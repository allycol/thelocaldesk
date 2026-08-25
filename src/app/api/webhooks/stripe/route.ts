import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { pool } from '@/lib/db';

// Route handlers get the raw, unparsed Request body — needed here because
// Stripe signature verification hashes the exact bytes Stripe sent.
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: Stripe can deliver the same event more than once.
  const [result] = await pool.query('INSERT IGNORE INTO webhook_events (stripe_event_id, event_type) VALUES (?, ?)', [
    event.id,
    event.type,
  ]);
  const alreadyProcessed = (result as { affectedRows: number }).affectedRows === 0;
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        console.log('Invoice paid:', (event.data.object as Stripe.Invoice).id);
        break;
      case 'invoice.payment_failed':
        // Stripe Smart Retries keeps retrying automatically — this is the
        // cue to notify the member, not to retry payment ourselves.
        console.log('Invoice payment failed:', (event.data.object as Stripe.Invoice).id);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error(`Failed handling ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Stripe has shipped the "current_period_end" field in two shapes depending on
// account billing-mode config and stripe-node version: top-level on the
// Subscription, or per subscription-item. Read both defensively so this
// keeps working regardless of which one the installed package's types expose.
function currentPeriodEndOf(subscription: Stripe.Subscription): Date | null {
  const raw = subscription as unknown as {
    current_period_end?: number;
    items: { data: Array<{ current_period_end?: number }> };
  };
  const seconds = raw.current_period_end ?? raw.items.data[0]?.current_period_end;
  return typeof seconds === 'number' ? new Date(seconds * 1000) : null;
}

async function upsertUser(email: string | null, stripeCustomerId: string | null): Promise<number | null> {
  if (!email) return null;
  await pool.query(
    `INSERT INTO users (email, stripe_customer_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE stripe_customer_id = COALESCE(VALUES(stripe_customer_id), stripe_customer_id)`,
    [email, stripeCustomerId]
  );
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  const row = (rows as Array<{ id: number }>)[0];
  return row?.id ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
  const userId = await upsertUser(email, stripeCustomerId);

  if (session.mode === 'subscription' && typeof session.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const planKey = session.metadata?.plan_key ?? 'unknown';
    const periodEnd = currentPeriodEndOf(subscription);

    await pool.query(
      `INSERT INTO subscriptions
         (user_id, stripe_subscription_id, stripe_price_id, plan_key, status, current_period_end, cancel_at_period_end)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         current_period_end = VALUES(current_period_end),
         cancel_at_period_end = VALUES(cancel_at_period_end)`,
      [
        userId,
        subscription.id,
        subscription.items.data[0]?.price.id ?? null,
        planKey,
        subscription.status,
        periodEnd,
        subscription.cancel_at_period_end,
      ]
    );
  }

  if (session.mode === 'payment') {
    const itemKey = session.metadata?.item_key ?? 'unknown';
    await pool.query(
      `INSERT INTO bookings (user_id, stripe_checkout_session_id, item_key, amount_total, currency, status)
       VALUES (?, ?, ?, ?, ?, 'paid')
       ON DUPLICATE KEY UPDATE status = 'paid'`,
      [userId, session.id, itemKey, session.amount_total ?? 0, session.currency ?? 'aud']
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const periodEnd = currentPeriodEndOf(subscription);
  await pool.query(
    `UPDATE subscriptions
     SET status = ?, current_period_end = ?, cancel_at_period_end = ?
     WHERE stripe_subscription_id = ?`,
    [subscription.status, periodEnd, subscription.cancel_at_period_end, subscription.id]
  );
}
