import { NextResponse } from 'next/server';
import { stripe, APP_BASE_URL } from '@/lib/stripe';
import { PRICES, isSubscriptionPlan } from '@/lib/plans';

export async function POST(req: Request) {
  try {
    const { plan, customerEmail } = await req.json();

    if (typeof plan !== 'string' || !isSubscriptionPlan(plan)) {
      return NextResponse.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      customer_email: typeof customerEmail === 'string' ? customerEmail : undefined,
      automatic_tax: { enabled: true },
      billing_mode: { type: 'flexible' },
      metadata: { plan_key: plan },
      success_url: `${APP_BASE_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_BASE_URL}/membership/cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('createSubscriptionCheckout failed:', err);
    return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
  }
}
