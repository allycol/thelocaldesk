import { NextResponse } from 'next/server';
import { stripe, APP_BASE_URL } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId, customerEmail } = await req.json();

    if (typeof priceId !== 'string' || !priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Prices are managed in Stripe directly (see src/lib/products.ts), so
    // validate against Stripe itself rather than a hardcoded list — this
    // also catches a mismatched request (e.g. a subscription price posted
    // here).
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.type !== 'one_time') {
      return NextResponse.json({ error: 'Not a valid one-time price' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: typeof customerEmail === 'string' ? customerEmail : undefined,
      automatic_tax: { enabled: true },
      consent_collection: { terms_of_service: 'required' },
      // One-time payments don't generate a Stripe Invoice by default (only
      // subscriptions do) — this turns one on so a real tax invoice (ABN,
      // GST breakdown, PDF) exists to link from the purchase-confirmation
      // email, not just a payment receipt.
      invoice_creation: { enabled: true },
      metadata: { item_key: priceId },
      success_url: `${APP_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_BASE_URL}/booking/cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('createOneTimeCheckout failed:', err);
    return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
  }
}
