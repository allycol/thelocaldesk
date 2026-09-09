import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { APP_BASE_URL } from '@/lib/stripe';
import { createAccountLinkToken } from '@/lib/magicLink';
import { sendAccountLink } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  // Always respond the same way whether or not the email matches an
  // account — a different response would let someone probe which emails
  // are registered members.
  try {
    const [rows] = await pool.query('SELECT stripe_customer_id FROM users WHERE email = ? LIMIT 1', [email]);
    const row = (rows as Array<{ stripe_customer_id: string | null }>)[0];

    if (row?.stripe_customer_id) {
      const token = createAccountLinkToken(email);
      const verifyUrl = `${APP_BASE_URL}/api/account/verify?token=${encodeURIComponent(token)}`;
      await sendAccountLink({ toEmail: email, verifyUrl });
    }
  } catch (err) {
    console.error('account/request-link failed:', err);
  }

  return NextResponse.json({ ok: true });
}
