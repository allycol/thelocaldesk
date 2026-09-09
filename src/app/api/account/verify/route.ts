import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { stripe, APP_BASE_URL } from '@/lib/stripe';
import { verifyAccountLinkToken } from '@/lib/magicLink';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const verified = verifyAccountLinkToken(token);

  if (!verified) {
    return NextResponse.redirect(`${APP_BASE_URL}/account?error=expired`);
  }

  try {
    const [rows] = await pool.query('SELECT stripe_customer_id FROM users WHERE email = ? LIMIT 1', [
      verified.email,
    ]);
    const row = (rows as Array<{ stripe_customer_id: string | null }>)[0];

    if (!row?.stripe_customer_id) {
      return NextResponse.redirect(`${APP_BASE_URL}/account?error=not_found`);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${APP_BASE_URL}/account`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (err) {
    console.error('account/verify failed:', err);
    return NextResponse.redirect(`${APP_BASE_URL}/account?error=unknown`);
  }
}
