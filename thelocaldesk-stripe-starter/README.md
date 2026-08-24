# The Local Desk — Stripe starter

A minimal Node.js 22 starting point for The Local Desk's Stripe integration. No framework —
plain `http` module plus the official `stripe` package, so you can drop this straight into
whatever the rest of your app ends up looking like.

## What's here

- `server.js` — three endpoints:
  - `POST /api/checkout/one-time` — creates a Checkout Session for a day pass or meeting room booking (`{ "plan": "day_pass", "customerEmail": "..." }`)
  - `POST /api/checkout/subscription` — creates a Checkout Session for a membership plan (`{ "plan": "hot_desk", "customerEmail": "..." }`)
  - `POST /api/webhooks/stripe` — verifies and handles Stripe webhook events
- Price IDs for the five placeholder products already created in the sandbox (see below).

## Setup

```bash
npm install
cp .env.example .env
# edit .env — add your sandbox secret key from https://dashboard.stripe.com/test/apikeys
node --env-file=.env server.js
```

## Testing webhooks locally

Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This prints a `whsec_...` value — put that in `.env` as `STRIPE_WEBHOOK_SECRET`.

## Trying it end to end

```bash
curl -X POST http://localhost:3000/api/checkout/subscription \
  -H "Content-Type: application/json" \
  -d '{"plan": "hot_desk", "customerEmail": "test@example.com"}'
```

This returns `{ "checkoutUrl": "https://checkout.stripe.com/..." }` — open that URL and pay with
a [Stripe test card](https://docs.stripe.com/testing#cards) (e.g. `4242 4242 4242 4242`, any
future expiry, any CVC).

## Placeholder products created in the sandbox

| Plan key              | Product                     | Price (AUD) | Type      |
| ---------------------- | ---------------------------- | ----------- | --------- |
| `hot_desk`             | Hot Desk Membership          | $199/month  | recurring |
| `dedicated_desk`        | Dedicated Desk Membership    | $399/month  | recurring |
| `private_office`        | Private Office Membership    | $899/month  | recurring |
| `day_pass`              | Day Pass                     | $35         | one-time  |
| `meeting_room_hourly`   | Meeting Room (per hour)      | $25         | one-time* |

\* Meeting room usage is priced as a one-time Price object so it can be attached either to a
one-time Checkout, or added as an ad hoc Invoice Item on a member's next subscription invoice
(see the integration plan doc for the usage-billing approach).

All of these are placeholders — rename, re-price, or restructure freely in the Stripe Dashboard
or via the API; nothing in `server.js` needs to change except the `PRICES` map at the top.

## Before going live

1. Finish setting up **Stripe Tax** — add your business's registered address as the Tax
   Settings `head_office`, and complete your Australian GST registration in the Dashboard
   (Settings → Tax). `automatic_tax: { enabled: true }` is already wired into both Checkout
   calls above, but it won't calculate correctly until Tax setup is complete.
2. Set up a **real webhook endpoint** in the Dashboard once this is deployed (Developers →
   Webhooks), pointing at `https://yourdomain/api/webhooks/stripe`, and copy its signing secret
   into your production environment as `STRIPE_WEBHOOK_SECRET`.
3. Swap the sandbox `STRIPE_SECRET_KEY` and Price IDs above for their live-mode equivalents.
