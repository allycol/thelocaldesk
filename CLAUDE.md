# thelocaldesk.au

Coworking-space site. Next.js 16 (App Router) + TypeScript on Node 22, MySQL
(mysql2) for local user/subscription/booking state, Stripe Checkout + Billing
for all payments. See [README.md](README.md) for the file map and local setup.

## Deployment target: GoDaddy Node.js Hosting

This constrains several things in the code — don't "simplify" them away:

- `server.js` is a **custom server**, not `next start` — it binds explicitly
  to `process.env.PORT` and `0.0.0.0`, per GoDaddy's requirement.
- `package.json` needs non-empty `name`, `version`, and `main` (`main` is set
  to `"server.js"`), and a real `build` script — GoDaddy's deploy checklist
  requires all three.
- Every runtime package (including `typescript` and `@types/*`) lives under
  `"dependencies"`, never `"devDependencies"` — GoDaddy's build step doesn't
  install dev dependencies.
- `package-lock.json` is committed intentionally, so GoDaddy's install
  resolves the exact versions verified locally rather than whatever a caret
  range picks at deploy time.

Deploy is git-based: the GoDaddy app is connected directly to
`github.com/allycol/thelocaldesk` (branch `main`) — push to `main` and
redeploy from the GoDaddy dashboard.

### GoDaddy app structure

- Two environments: **Preview** and **Publish**. Each has its own Secrets
  tab and its own provisioned MySQL database (own Database tab per
  environment) — **never sync/copy secrets from Preview to Publish**, since
  that would point production at Preview's database instance instead of its
  own.
- Env vars are only injected into the process at startup — restart the app
  after adding/changing a secret.
- `db/apply-schema.js` applies `db/schema.sql` (`CREATE TABLE IF NOT EXISTS`,
  safe to re-run) automatically on every `server.js` boot, rather than
  requiring `npm run db:init` to be run against the DB manually — GoDaddy's
  provisioned database isn't reachable from a local machine. A schema
  failure is logged but doesn't block startup (Checkout doesn't need the DB;
  only the webhook handler does).

## Stripe

Sandbox account: "AIC Ecommerce PTY Ltd". Products/Prices already exist for
Hot Desk / Dedicated Desk / Private Office memberships, Day Pass, and Meeting
Room — Price IDs are in [src/lib/plans.ts](src/lib/plans.ts) (overridable via
env vars). GST/Tax is configured, including a default tax code — Checkout
will fail with `"You must specify a tax code..."` if that default ever gets
cleared (Stripe Dashboard > Settings > Tax > Tax settings).

The webhook destination (Stripe Dashboard > Workbench > Webhooks) must be
configured with:
- Endpoint: `https://<domain>/api/webhooks/stripe`
- Scope: "Your account"
- **Payload style: Snapshot** — not "Thin". The handler in
  [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts)
  reads full objects straight off `event.data.object`; a "Thin" payload only
  carries a reference and would need a rewrite to re-fetch each object.
- Events: exactly `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed` —
  nothing else is handled, so nothing else is needed.

Each environment (Preview/Publish) and each Stripe mode (test/live) needs its
own webhook destination, since each has a different signing secret.

## Known gotchas already worked around in code

- [src/lib/stripe.ts](src/lib/stripe.ts) constructs the Stripe client lazily
  via a `Proxy`, not at module load. `next build` evaluates every route
  module to collect its metadata, so an eager `new Stripe(...)` fails the
  build in any environment where secrets aren't injected until runtime
  (reproduced locally: build failed with `STRIPE_SECRET_KEY is not set`).
- Checkout session creation intentionally omits `billing_mode` — the
  `stripe` package version GoDaddy's build resolves doesn't type that field.
- [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts)
  reads `current_period_end` defensively (`currentPeriodEndOf`), since it can
  be top-level on the Subscription or per subscription-item depending on
  Stripe billing-mode config and `stripe-node` version.
- `next` is pinned to `^16.3.2` (upgraded from `^15.1.0`) to clear
  high-severity `postcss`/`sharp` advisories `npm audit` flagged in the
  resolved 15.x bundle.

## Status

Verified working: production build, server binding, MySQL schema
auto-creation (tested end-to-end against a real local MySQL instance), and
the Preview environment's Checkout flow reaching Stripe's payment page.

Not yet verified: a completed test payment actually landing a row in
`subscriptions` via the webhook; the one-time purchase flow (Day
Pass/Meeting Room); subscription cancellation
(`customer.subscription.deleted`); and the Publish (production) environment,
which has no secrets configured yet — it needs its own DB credentials (from
its own Database tab), live-mode Stripe keys, and a separate live-mode
webhook endpoint before connecting the real domain and publishing.
