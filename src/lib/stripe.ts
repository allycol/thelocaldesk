import Stripe from 'stripe';

// Constructed lazily, on first use inside a request — not at module load.
// `next build` evaluates every route module to collect its metadata, so an
// eager `new Stripe(...)` here would fail the build in any environment
// (like GoDaddy's) where secrets aren't injected until runtime.
let client: Stripe | null = null;

function getClient(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not set');
    client = new Stripe(apiKey);
  }
  return client;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:3000';
