# thelocaldesk.au

Coworking site for The Local Desk — Next.js (App Router, TypeScript) on Node.js 22, MySQL for
local account/subscription state, Stripe Checkout + Billing for all payments.

Built for **GoDaddy's Node.js Hosting**:

- `server.js` is a custom Node server so the app binds explicitly to `process.env.PORT` and
  `0.0.0.0`, per GoDaddy's requirements.
- All runtime packages (including `typescript` and the `@types/*` packages) are listed under
  `"dependencies"` in [package.json](package.json), not `devDependencies` — GoDaddy's build step
  does not install dev dependencies.
- `npm run build` runs `next build`; `npm start` runs `node server.js`.

## Project layout

```
thelocaldesk.au/
├── server.js                 # custom server — binds to PORT / 0.0.0.0
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── db/
│   ├── schema.sql            # MySQL schema
│   └── init.mjs              # applies schema.sql (npm run db:init)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx           # pricing page — memberships + day passes/rooms
    │   ├── globals.css
    │   ├── membership/{success,cancelled}/page.tsx
    │   ├── booking/{success,cancelled}/page.tsx
    │   └── api/
    │       ├── checkout/subscription/route.ts   # Stripe Checkout, mode=subscription
    │       ├── checkout/one-time/route.ts        # Stripe Checkout, mode=payment
    │       └── webhooks/stripe/route.ts          # verifies + processes Stripe events
    └── lib/
        ├── stripe.ts          # Stripe client
        ├── plans.ts           # plan keys -> sandbox Price IDs
        └── db.ts              # mysql2 connection pool
```

## Setup

```bash
npm install
cp .env.example .env
# fill in DB_* and STRIPE_* in .env
npm run db:init      # creates users / subscriptions / bookings / webhook_events tables
npm run dev
```

## Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET`.

## Production

```bash
npm run build
npm start
```

Register the real webhook endpoint in the Dashboard (Developers → Webhooks) pointing at
`https://<your-domain>/api/webhooks/stripe`, and put its signing secret in the production
environment as `STRIPE_WEBHOOK_SECRET`.

See `stripe-integration-plan.md` for the product/pricing rationale and go-live checklist.
