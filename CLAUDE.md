# thelocaldesk.au

Coworking-space site. Next.js 16 (App Router) + TypeScript on Node 22, MySQL
(mysql2) for local user/subscription/booking state, Stripe Checkout + Billing
for all payments. See [README.md](README.md) for the file map and local setup.

## Deployment target: GoDaddy Node.js Hosting

This constrains several things in the code — don't "simplify" them away:

- `server.js` is a **custom server**, not `next start` — it binds explicitly
  to `process.env.PORT` and `0.0.0.0`, per GoDaddy's requirement. **Caveat**:
  GoDaddy's own official Claude Code skill (see below) actually recommends
  plain `next start` for standard Next.js apps and says not to replace it
  with a custom server — `next start` already reads `PORT` from env. The
  custom server here predates that guidance and hasn't caused a known
  problem, but if `server.js`/schema-auto-apply ever behaves unexpectedly
  after a real `Publish`, this mismatch is the first thing to revisit.
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
`github.com/allycol/thelocaldesk` (branch `main`).

**Official skill**: GoDaddy publishes a Claude Code skill for this platform —
installed locally at `~/.claude/skills/godaddy-nodejs-hosting` (via
`npx skills add godaddy/nodejs-hosting-agent-skill --skill godaddy-nodejs-hosting -g -a claude-code`).
Its `contract.md` documents the exact deploy contract, and
`scripts/validate-paas.mjs <project-dir>` checks a project against it —
worth re-running after any deploy-relevant change. This repo currently
passes with only two harmless warnings (`.env` and `node_modules` present
locally — both gitignored, never actually deployed).

### GoDaddy app structure

- One app ("thelocaldesk"), with a **Preview** state and a **Published**
  state, not two fully separate deployed apps. As of 2026-09, the app has
  never actually been published — everything tested so far is Preview.
- **Preview and Publish share a single provisioned MySQL database** (per
  GoDaddy's own Database panel: "the hosted database shared by preview and
  publish") — this contradicts an earlier assumption in this file that each
  environment gets its own DB. Still worth being careful with secrets, since
  they *are* per-environment even if the DB isn't.
- **"Update Preview" (pull from GitHub) ≠ "Restart Preview App".** Preview
  normally runs in a live-reload `next dev` process (by platform design, for
  fast iteration) — pulling new code into that process does **not** run
  `db/apply-schema.js` or bind via `server.js`, since dev mode never touches
  either. Only an explicit **restart** pushes the app through GoDaddy's real
  `install → build → start` pipeline (i.e. `node server.js`). Confirm which
  mode is currently running from Runtime Logs: `next dev` at the top means
  live-preview mode; `node server.js` + `Database schema is up to date.`
  means the real production path ran.
- **Preview URLs require an access token on every request, including
  webhooks.** The preview link (`https://<app-id>.preview.c38.airoapp.ai`)
  gates all requests — plain requests get `401 Unauthorized` from the
  platform itself, before ever reaching the Next.js app. The token
  (`?airoShareToken=...`, visible in Runtime Logs request lines, or on the
  app's Preview URL in the dashboard) has to be appended to *any* URL that
  needs to reach Preview from outside a logged-in browser session —
  including the Stripe webhook endpoint URL (see Stripe section below).
  There's no indication this gating applies to a genuinely Published app.
- Env vars are only injected into the process at startup — restart the app
  after adding/changing a secret.
- `db/apply-schema.js` applies `db/schema.sql` (`CREATE TABLE IF NOT EXISTS`,
  safe to re-run) automatically on every `server.js` boot (i.e. only when
  actually running the production start path — see above), rather than
  requiring `npm run db:init` to be run against the DB manually — GoDaddy's
  provisioned database isn't reachable from a local machine, though it *can*
  be browsed read-only (schema and data) via the dashboard's **Database**
  panel. A schema failure is logged but doesn't block startup (Checkout
  doesn't need the DB; only the webhook handler does).

## Stripe

Sandbox account: "AIC Ecommerce PTY Ltd". **Products, prices, descriptions,
and images are managed entirely in the Stripe Dashboard**, not hardcoded —
[src/lib/products.ts](src/lib/products.ts) fetches them live
(`stripe.products.list`, fetched fresh on every request — see the
`force-dynamic` gotcha above — on `/`, `/pricing`, and
`/membership-agreement`), so there's no `plans.ts`-style price-ID file to
keep in sync. Every product needs Product metadata `category` set to one of
`full_time` / `flexible` / `daily` / `virtual` (see `CATEGORY_ORDER` in
products.ts) — a product with a missing or unrecognised category is
silently skipped from the site. Adding a 5th category needs a code change
(that Set of valid values, `CATEGORY_LABELS`, `CATEGORY_INFO`); everything
else about a new product is Dashboard-only.

**Test and live mode have entirely separate product catalogs** (Stripe
doesn't share Products/Prices across modes). The live-mode catalog was
created 2026-09-10 by scripting a straight copy from test mode (same name,
description, metadata, tax code, price, currency, tax_behavior, and billing
interval for all 12 products) — not recreated by hand in the Dashboard, so
it should match test mode exactly as of that date. **The two catalogs are
not kept in sync automatically going forward** — a product added/changed in
test mode (e.g. while prototyping) needs the same change made separately in
live mode (Dashboard, with Live mode toggled on) before it'll actually show
up or charge correctly for real customers.

Product `metadata.daily_rate` (a plain dollar string, e.g. `"30"`) drives the
"≈ $X/day" comparison line on product cards — optional, omit to hide it.

GST/Tax is configured, including a default tax code — Checkout will fail
with `"You must specify a tax code..."` if that default ever gets cleared
(Stripe Dashboard > Settings > Tax > Tax settings). **Prices should have
`tax_behavior: inclusive`** — the site displays `unit_amount` as the final
price with no "+ GST" suffix, so an `exclusive` price means the amount
charged at checkout won't match what's displayed. `tax_behavior` can't be
edited on an existing Price; a wrong one needs a new Price created and set
as the Product's `default_price`.

**Checkout consent checkbox**: both checkout routes set
`consent_collection: { terms_of_service: 'required' }`, which shows an
unticked "I agree to ... Terms of Service and Privacy Policy" checkbox above
the Pay button, required before paying. This depends on a **Terms of
service** URL being set in Stripe Dashboard > Settings > Business > Public
details (`dashboard.stripe.com/settings/public`) — currently set to
`/membership-agreement`. If that URL is ever cleared, checkout session
creation will likely start failing outright, so don't remove
`consent_collection` without also removing/updating that Dashboard field.

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

**Preview's webhook URL needs the share token appended**, e.g.
`https://<app-id>.preview.c38.airoapp.ai/api/webhooks/stripe?airoShareToken=<token>`
— otherwise every delivery gets rejected with a 401 by GoDaddy's own access
gate before it reaches the app (see GoDaddy app structure above). Query
params on the endpoint URL don't affect signature verification (Stripe signs
the raw body, not the URL). Double-check the signing secret pasted into
`STRIPE_WEBHOOK_SECRET` character-for-character if signature verification
keeps failing — a mis-pasted secret was the actual root cause the one time
this got debugged at length (see git history / session notes around
2026-09-04).

## Legal / compliance pages

Three pages exist to meet Australian Consumer Law / Privacy Act obligations
for a subscription business: [/privacy-policy](src/app/privacy-policy/page.tsx),
[/membership-agreement](src/app/membership-agreement/page.tsx),
[/refund-policy](src/app/refund-policy/page.tsx) — linked from the site
footer ([src/components/Footer.tsx](src/components/Footer.tsx)) on every
page. Content came from real docx drafts (see git history around
2026-09-08); business address is Shop 2, 27 Collins Street, Kiama, NSW 2533,
AIC Ecommerce Pty Ltd is GST-registered.

The **Membership Agreement's price table is generated live from Stripe**
(same `getProducts()`/`force-dynamic` pattern as `/pricing`), not
hardcoded — grouped by `CATEGORY_ORDER`, so a new product with a valid
`category` shows up there automatically. Don't hand-edit that table back to
static rows.

Any unresolved detail is rendered on the live page itself as a highlighted
`<Tbd>` marker (see [src/components/LegalPage.tsx](src/components/LegalPage.tsx))
rather than guessed — grep for `<Tbd` to find what's still outstanding. As
of 2026-09-08, only the Fixed-Term Membership term lengths (Membership
Agreement clause 7) remain unresolved — no fixed-term product currently
exists in Stripe, so the clause may not even apply yet.

Still not implemented from the original compliance review: tax-invoice
wording on receipts (Stripe's own invoice/receipt Dashboard settings, not
app code).

### Member self-service — "Manage membership" (built 2026-09-09)

Was the single most-enforced item in the original compliance review (ACCC
already acts on missing self-service cancellation under existing
misleading-conduct powers, ahead of the 2027 "click to cancel" deadline) —
now built, not deferred.

**Deliberately not a custom account system.** [/account](src/app/account/page.tsx)
takes just an email address and, via a passwordless magic link
([src/lib/magicLink.ts](src/lib/magicLink.ts) — a short-lived HMAC-signed
token, `ACCOUNT_LINK_SECRET`, no DB table, no session system), redirects
straight to a **Stripe-hosted Billing Portal session**
(`stripe.billingPortal.sessions.create()` in
[api/account/verify/route.ts](src/app/api/account/verify/route.ts)). Stripe's
own page provides billing history, payment-method updates, email updates,
and cancellation — no custom UI needed for any of it. This was a deliberate
choice over building real auth (password reset, sessions, a custom billing
page): far less code, far smaller security surface (nothing to leak but a
15-minute link to a Stripe page, no passwords anywhere), and Stripe's portal
is more polished than anything worth building in-house for this.

The Billing Portal's feature set (which updates are allowed, whether
cancellation is immediate or `at_period_end`) lives in a **Configuration**
object on the Stripe account, not in this codebase — created once via a
one-off API call (`stripe.billingPortal.configurations.create()`), not
through the Dashboard UI. It's mode-scoped like Tax IDs: a test-mode
configuration was created 2026-09-09, and the **live-mode equivalent was
also created 2026-09-10** once live keys were issued (`bpc_1UDbao...`,
confirmed `is_default: true`) — both now exist, so `billingPortal.sessions.create()`
works in either mode. Cancellation is configured `mode: 'at_period_end'`,
matching the Membership Agreement's "takes effect at the end of your
current billing cycle" wording — the webhook handler already listens for
`customer.subscription.updated`/`.deleted` and syncs `subscriptions.status`,
so no webhook-side changes were needed.

"Manage membership" is linked from the site footer
([Footer.tsx](src/components/Footer.tsx)) — reachable in one click from any
page, satisfying the compliance bar of being at least as easy to reach as
signing up.

Confirmed working end-to-end (2026-09-09) against a real test-mode
subscription: requested a link, redirected to a real Billing Portal session
showing the actual subscription, payment method, and paid invoice history.
Also confirmed an expired/invalid token redirects to `/account?error=...`
with a visible message rather than failing silently, and that requesting a
link for an unregistered email returns the identical generic response as a
registered one (no account-enumeration leak).

## Transactional email — two different paths, deliberately

There are now **two separate mechanisms** for sending real (non-newsletter)
email, and they're not interchangeable — don't consolidate them without
re-reading this section:

- **Get in touch — contact form** uses **GoDaddy Node.js Hosting's native
  email gateway**
  ([src/lib/emailGateway.ts](src/lib/emailGateway.ts), called from
  [api/contact/route.ts](src/app/api/contact/route.ts)), not Brevo. The
  GoDaddy hosting skill's own contract (rule C13, see
  `~/.claude/skills/godaddy-nodejs-hosting/email.md`) is explicit: use the
  platform's loopback gateway (`http://127.0.0.1:2525/api/email/send`),
  not a third-party API key — it's the officially supported pattern for
  this specific host (sender identity/domain verification handled
  automatically, one less secret to manage). `emailGateway.ts` is a
  verbatim copy of the skill's vended helper — keep it byte-for-byte
  identical if updating either side. The recipient is read from
  `CONTACT_FORM_RECIPIENT_EMAIL` (env var, not hardcoded, per the same
  contract) and fails closed (throws, logged) if unset.
  **This gateway is loopback-only — it does not exist on a local dev
  machine, only inside an actual Node.js Hosting container.** Confirmed
  locally (2026-09-09): the call fails with `email gateway unreachable:
  fetch failed` exactly as expected; the contact form still writes to
  `contact_messages` (schema in [db/schema.sql](db/schema.sql)) and still
  returns success to the visitor either way, so a submission is never
  silently lost. **Real delivery can only be verified once actually
  deployed to Preview/Publish** — do that check before assuming this
  works end-to-end.
- **Purchase confirmation** deliberately still uses **Brevo's REST API**
  ([src/lib/email.ts](src/lib/email.ts), `BREVO_API_KEY`) — a conscious
  choice to keep it off the GoDaddy gateway (2026-09-09), even though the
  gateway would also work for this. Sent from the `checkout.session.completed`
  handler in [api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts)
  (`sendPurchaseNotification`) to whichever email the customer checked out
  with, from `ally@thelocaldesk.au` as "The Local Desk" — that sender
  address must stay verified in Brevo (Settings > Senders & IP) or every
  send fails. Fetches the line item's product name via
  `stripe.checkout.sessions.listLineItems` (not on the webhook payload by
  default) and formats the amount from `session.amount_total`. Wrapped in
  its own try/catch **inside** `handleCheckoutCompleted` — the purchase is
  already recorded in `subscriptions`/`bookings` by that point, and a
  thrown error here would make Stripe retry the whole webhook event for no
  reason (the DB writes are already idempotent, so a retry wouldn't even
  give the email a different outcome). Confirmed working end-to-end
  (2026-09-08): a real subscription checkout (test card, Stripe
  CLI-forwarded webhooks) → `subscriptions` row written + confirmation
  email received with no errors logged.

The newsletter subscribe form
([SubscribeSection.tsx](src/components/SubscribeSection.tsx)) is a third,
unrelated path — it posts straight to Brevo's own `sib-forms` endpoint
client-side and needs no API key at all.

Both `BREVO_API_KEY` and `CONTACT_FORM_RECIPIENT_EMAIL` are confirmed set
in GoDaddy's live env vars as of the 2026-09-10 Publish cutover (see
Status below) — the real end-to-end purchase test that day included a
received confirmation email, which wouldn't have worked otherwise.

## Brevo CRM sync — Prospect/Customer tagging

Separate from both email paths above: [src/lib/brevo.ts](src/lib/brevo.ts)
(`upsertBrevoCustomer`) tags every purchaser in Brevo's contact database via
a custom **`CUSTOMER_STATUS`** attribute (plain text attribute, values
`"Prospect"` / `"Customer"` — not a Brevo "category" enum, so it's simpler
to write from code and Brevo's segment filters work identically either
way). Called from `handleCheckoutCompleted` in
[api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts),
alongside (but independent of — separate try/catch) the purchase
confirmation email, using the same `BREVO_API_KEY`.

- **Upserts by email** (`updateEnabled: true`) — a customer who never
  subscribed to the newsletter still gets a Brevo contact created, not
  just updated.
- Sets `CUSTOMER_STATUS: "Customer"` and splits Stripe Checkout's "name on
  card" (`session.customer_details.name`) into `FIRSTNAME`/`LASTNAME` via
  `splitName()` — first word is the first name, everything after is the
  last name (so multi-word surnames survive intact).
- All existing Brevo contacts (100, all from the newsletter subscribe
  form, none of whom had purchased) were backfilled to
  `CUSTOMER_STATUS: "Prospect"` in a one-off script when this was built
  (2026-09-10) — **not** an ongoing/automatic process. A contact that
  predates this feature and later unsubscribes-then-resubscribes, or any
  other edge case outside the checkout flow, won't get a Prospect tag
  applied automatically; only the checkout webhook ever sets
  `CUSTOMER_STATUS` going forward (to `"Customer"` specifically — nothing
  currently sets it back to `"Prospect"` or removes it).
- Deliberately **not** cross-referenced against pre-existing purchases —
  members who bought before this feature existed (e.g. the live purchase
  test on Publish day) won't retroactively show as `"Customer"` in Brevo
  unless they make another purchase. Worth a one-off reconciliation script
  later if that backlog matters.

Confirmed working end-to-end (2026-09-10): a real one-time test purchase
with a brand-new email (not previously in Brevo) created a new contact
with `CUSTOMER_STATUS: "Customer"` and correctly split first/last name,
no errors logged. Test contact and its local DB rows deleted after
verifying.

## Known gotchas already worked around in code

- `package.json`'s `build` script is `rm -rf .next && next build`, not
  plain `next build` — **don't simplify this away.** GoDaddy's "Try
  rebuild" appears to persist the `.next` directory across attempts
  instead of wiping it. After the `/products` → `/pricing` and
  `/where-we-are` → `/location` route rename (2026-09-09), rebuilds
  started failing with an error pointing at the deleted
  `src/app/products/page.tsx` — almost certainly a stale
  `.next/types/app/**/page.ts` (Next's internal route-validation file,
  which imports each page module by relative path) surviving from before
  the rename. Bumping `package.json`'s version first did *not* fix it,
  ruling out anything keyed on that; explicitly deleting `.next` before
  every build did (confirmed working on GoDaddy 2026-09-10). There's no
  cache-clear option in GoDaddy's dashboard UI, so this has to be enforced
  from the build script itself.
- [src/lib/stripe.ts](src/lib/stripe.ts) constructs the Stripe client lazily
  via a `Proxy`, not at module load. `next build` evaluates every route
  module to collect its metadata, so an eager `new Stripe(...)` fails the
  build in any environment where secrets aren't injected until runtime
  (reproduced locally: build failed with `STRIPE_SECRET_KEY is not set`).
- **The same failure mode can reappear one layer up, via page-level ISR.**
  `/`, `/products`, and `/membership-agreement` all call `getProducts()`
  (a real Stripe call) inside an async Server Component. Setting
  `export const revalidate = 60` alone still statically prerenders the
  page once during `next build` (ISR's first render), which invokes
  Stripe at build time regardless of `stripe.ts`'s own lazy Proxy —
  harmless locally since `next build` auto-loads `.env`, but fails on
  GoDaddy with the identical `STRIPE_SECRET_KEY is not set` error, since
  its build step doesn't have secrets injected yet (confirmed: 2026-09-10,
  first real GoDaddy deploy attempt after the Stripe-source-of-truth
  refactor introduced these ISR pages). Fixed by using
  `export const dynamic = 'force-dynamic'` on all three instead — skips
  build-time generation entirely, fetches fresh per request. If a future
  page fetches Stripe data inside a Server Component, give it
  `force-dynamic` too rather than `revalidate`.
- Checkout session creation intentionally omits `billing_mode` — the
  `stripe` package version GoDaddy's build resolves doesn't type that field.
- [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts)
  reads `current_period_end` defensively (`currentPeriodEndOf`), since it can
  be top-level on the Subscription or per subscription-item depending on
  Stripe billing-mode config and `stripe-node` version.
- `next` is pinned to `^16.3.2` (upgraded from `^15.1.0`) to clear
  high-severity `postcss`/`sharp` advisories `npm audit` flagged in the
  resolved 15.x bundle.
- [next.config.ts](next.config.ts) sets
  `allowedDevOrigins: ['*.airoapp.ai']` — Preview serves the app through a
  proxy on that domain rather than the dev server's own origin, which
  Next's dev server blocks by default (client JS chunks/HMR would otherwise
  fail to load, even though the initial page request still returns 200).
- Local testing against a real MySQL instance needs env vars exported into
  the shell before `npm start`, e.g. `set -a; source .env; set +a; npm start`.
  `next()`'s programmatic API (used by the custom `server.js`) does **not**
  load `.env` before top-level code runs — only Next's own CLI
  (`next build`/`next dev`) does that eagerly — so `db/apply-schema.js` sees
  empty `DB_*` vars and fails auth if `.env` isn't exported first. This
  isn't a problem on GoDaddy, since secrets are injected as real process env
  vars before Node starts, not via a `.env` file.

## Status

Verified working, end-to-end including a real webhook write to the
database:
- **Local**: subscription checkout, one-time purchase (Day Pass), and
  subscription cancellation (`customer.subscription.deleted`) all confirmed
  against a local MySQL instance via Stripe CLI-forwarded webhooks.
- **Preview** (2026-09-04): subscription checkout and one-time purchase
  (Day Pass) both confirmed against GoDaddy's actual Preview deployment (not
  just local) — including webhook-driven DB writes, using a real
  Stripe-delivered webhook (not CLI-forwarded). Required an explicit
  **Restart** (not just "Update Preview") to get `server.js` actually
  running, and the `?airoShareToken=...` webhook URL workaround above.
  Subscription cancellation not yet re-tested against Preview specifically
  (only verified locally so far).

**Publish (production) cutover — complete as of 2026-09-10.** The app is
live at `thelocaldesk.au` with a real confirmed end-to-end purchase. What
it took, for reference:
- Live-mode Stripe webhook endpoint created (same 5 events as test mode —
  see Stripe section above) and `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`
  updated to live values in GoDaddy's env vars.
- Live-mode account confirmed fully verified (`charges_enabled`,
  `payouts_enabled`, `details_submitted` all true, no outstanding
  requirements).
- Live-mode Tax settings already correctly configured (real default tax
  code, GST active) — no action needed there.
- Live-mode ABN (26 611 700 979) added as a Tax ID — it had been added to
  the wrong mode twice before (test, apparently, despite attempts to add it
  live); confirmed present via API this time.
- Live-mode Billing Portal Configuration created (see "Manage membership"
  section above) — was missing entirely; would have made `/account` fail
  outright in live mode.

Since done, 2026-09-10:
- `APP_BASE_URL` updated to the real production domain in GoDaddy's
  Publish env vars.
- Terms of service URL confirmed set for live mode via the Stripe
  Dashboard UI directly (no API path exists for this setting in the
  installed SDK version — checked `accounts.retrieve()` including
  `.settings`, no matching field).
- Custom domain (`thelocaldesk.au`, registered in the same GoDaddy
  account) attached to the app — DNS configured automatically by GoDaddy
  since domain and hosting share an account, no manual records needed.
- The stale-`.next`-cache Publish failure (see Known gotchas above) and a
  wrong-key-published-to-Publish-env incident were both hit and fixed
  along the way.
- Live-mode product catalog created (see Stripe section above) — the app
  was showing no products on the real domain until this was done, since
  test/live catalogs don't share.
- **The app is live at `thelocaldesk.au`.** A real end-to-end purchase was
  completed successfully post-publish, confirming the whole chain works
  for real: checkout, webhook-driven DB write, tax invoice, confirmation
  email, and "Manage membership" all functioning in live mode.

Still outstanding / deliberately deferred:
- Whether the Preview-style access-gate/share-token requirement applies to
  a genuinely published app was never separately tested — moot now, since
  the live purchase test above already proves the real domain works
  end-to-end regardless.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
