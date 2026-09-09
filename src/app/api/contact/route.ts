import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sendEmail } from '@/lib/emailGateway';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendContactNotification(params: { name: string; email: string; message: string }): Promise<void> {
  // Fixed recipient — read from env, set in the Node.js Hosting UI, per
  // the platform's email-gateway contract (fail closed rather than
  // silently sending nowhere if it's ever unset).
  const recipient = process.env.CONTACT_FORM_RECIPIENT_EMAIL;
  if (!recipient) throw new Error('CONTACT_FORM_RECIPIENT_EMAIL is not set');

  await sendEmail({
    to: recipient,
    replyTo: params.email,
    subject: `New enquiry from ${params.name}`,
    text: `${params.message}\n\n—\n${params.name} <${params.email}>`,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const { name, email, message, company } = body as Record<string, unknown>;

  // Honeypot — a hidden field real visitors never fill in. Bots that
  // blindly fill every field trip it; reply as if it worked so they don't
  // learn to look for it.
  if (typeof company === 'string' && company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 200) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
    return NextResponse.json({ error: 'Please enter a message (at least 10 characters).' }, { status: 400 });
  }

  const trimmed = { name: name.trim(), email: email.trim(), message: message.trim() };

  let emailSent = true;
  try {
    await sendContactNotification(trimmed);
  } catch (err) {
    console.error('sendContactNotification failed:', err);
    emailSent = false;
  }

  try {
    await pool.query('INSERT INTO contact_messages (name, email, message, email_sent) VALUES (?, ?, ?, ?)', [
      trimmed.name,
      trimmed.email,
      trimmed.message,
      emailSent,
    ]);
  } catch (err) {
    console.error('Failed to store contact message:', err);
    // The DB mirrors the message for backup purposes only — as long as the
    // email itself sent, the enquiry has actually reached us.
    if (!emailSent) {
      return NextResponse.json({ error: 'Something went wrong. Please email us directly.' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
