// The Local Desk — Stripe starter server
// Plain Node.js 22 (no framework). Run with: node --env-file=.env server.js
//
// Node 22 reads environment variables natively via --env-file, so no `dotenv`
// dependency is needed. The only runtime dependency is the official `stripe` package.

import http from 'node:http';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3000;

// --- Price IDs from the sandbox (created via the Stripe MCP setup) -------
// Rename/retier freely later — these are placeholders. Swap in your live-mode
// Price IDs when you go live; keep test/live IDs in separate env vars if you
// prefer not to hardcode them.
const PRICES = {
  hot_desk: 'price_1U7qsKKkpqRq8EXWqFrfxczy',       // Hot Desk Membership — $199/mo AUD
  dedicated_desk: 'price_1U7qsMKkpqRq8EXWsHymyFIC',  // Dedicated Desk Membership — $399/mo AUD
  private_office: 'price_1U7qsNKkpqRq8EXWtHbgVldu',  // Private Office Membership — $899/mo AUD
  day_pass: 'price_1U7qsVKkpqRq8EXWSlmOmbXU',        // Day Pass — $35 AUD, one-time
  meeting_room_hourly: 'price_1U7qsXKkpqRq8EXWX0d2GwLw', // Meeting Room (per hour) — $25 AUD, one-time/invoice item
};

const SUBSCRIPTION_PLANS = new Set(['hot_desk', 'dedicated_desk', 'private_office']);
const ONE_TIME_ITEMS = new Set(['day_pass', 'meeting_room_hourly']);

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// --- Checkout: one-time payments (day pass, meeting room, etc.) ----------
async function createOneTimeCheckout(req, res) {
  try {
    const { plan, customerEmail } = await readJsonBody(req);
    if (!ONE_TIME_ITEMS.has(plan)) {
      return sendJson(res, 400, { error: `Unknown one-time item: ${plan}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      customer_email: customerEmail, // optional — Checkout will also collect it if omitted
      automatic_tax: { enabled: true }, // calculates AU GST once Stripe Tax is fully configured
      success_url: `${APP_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_BASE_URL}/booking/cancelled`,
    });

    sendJson(res, 200, { checkoutUrl: session.url });
  } catch (err) {
    console.error('createOneTimeCheckout failed:', err);
    sendJson(res, 500, { error: 'Could not create checkout session' });
  }
}

// --- Checkout: subscriptions (membership plans) ---------------------------
async function createSubscriptionCheckout(req, res) {
  try {
    const { plan, customerEmail } = await readJsonBody(req);
    if (!SUBSCRIPTION_PLANS.has(plan)) {
      return sendJson(res, 400, { error: `Unknown plan: ${plan}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      customer_email: customerEmail,
      automatic_tax: { enabled: true },
      // Flexible billing mode is Stripe's current default/recommended setting
      // for new subscriptions — gives access to newer billing capabilities.
      billing_mode: { type: 'flexible' },
      success_url: `${APP_BASE_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_BASE_URL}/membership/cancelled`,
    });

    sendJson(res, 200, { checkoutUrl: session.url });
  } catch (err) {
    console.error('createSubscriptionCheckout failed:', err);
    sendJson(res, 500, { error: 'Could not create checkout session' });
  }
}

// --- Webhook handler --------------------------------------------------------
// Register this endpoint with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
// while developing locally, or as a real webhook endpoint (Dashboard > Developers > Webhooks)
// once deployed. Needs the RAW request body for signature verification, so it's
// handled separately from the JSON routes above.
async function handleWebhook(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.writeHead(400);
    return res.end();
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // TODO: mark the booking/membership as active in your own DB,
      // using session.customer / session.subscription / session.metadata.
      console.log('Checkout completed:', session.id, session.mode);
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object;
      console.log('Invoice paid:', invoice.id, invoice.customer);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // TODO: notify the member, flag the account, etc. Smart Retries will
      // keep trying automatically — this is your cue to communicate, not to retry yourself.
      console.log('Invoice payment failed:', invoice.id, invoice.customer);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log(`Subscription ${event.type}:`, subscription.id, subscription.status);
      break;
    }
    case 'credit_note.created': {
      const creditNote = event.data.object;
      console.log('Credit note created:', creditNote.id);
      break;
    }
    default:
      console.log('Unhandled event type:', event.type);
  }

  res.writeHead(200);
  res.end();
}

// --- Router -----------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, APP_BASE_URL);

  if (req.method === 'POST' && pathname === '/api/checkout/one-time') {
    return createOneTimeCheckout(req, res);
  }
  if (req.method === 'POST' && pathname === '/api/checkout/subscription') {
    return createSubscriptionCheckout(req, res);
  }
  if (req.method === 'POST' && pathname === '/api/webhooks/stripe') {
    return handleWebhook(req, res);
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`The Local Desk Stripe starter listening on port ${PORT}`);
});
