import { createHmac, timingSafeEqual } from 'crypto';

// Stateless, signed "magic link" token — no DB table needed. Grants access
// only to a Stripe-hosted Billing Portal session (view invoices, update
// payment method, cancel), never anything more sensitive, so a short
// expiry plus a signature check is enough security for what it protects.
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getSecret(): string {
  const secret = process.env.ACCOUNT_LINK_SECRET;
  if (!secret) throw new Error('ACCOUNT_LINK_SECRET is not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createAccountLinkToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAccountLinkToken(token: string): { email: string } | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { email, exp } = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (typeof email !== 'string' || typeof exp !== 'number' || Date.now() > exp) return null;
    return { email };
  } catch {
    return null;
  }
}
