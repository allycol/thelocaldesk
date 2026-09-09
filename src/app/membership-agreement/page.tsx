import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Tbd } from '@/components/LegalPage';
import { CATEGORY_ORDER, getProducts, productsByCategory, type Product } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Membership Agreement — The Local Desk',
};

// Prices are managed in Stripe, not this codebase — fetch on every
// request rather than at build time (same pattern as /products).
// `revalidate` alone still statically prerenders once during `next
// build`, which fails on hosts (like GoDaddy Node.js Hosting) that don't
// inject secrets until the app actually starts — `force-dynamic` skips
// build-time generation entirely.
export const dynamic = 'force-dynamic';

function billingLabel(product: Product): string {
  if (!product.billingInterval) return 'Single use';
  if (product.billingInterval === 'month') return 'Monthly';
  if (product.billingInterval === 'week') return 'Weekly';
  return product.billingInterval;
}

export default async function MembershipAgreementPage() {
  const products = await getProducts();

  return (
    <LegalPage title="Membership Agreement" effectiveDate="5 September 2026">
      <p>
        This Agreement is between <strong>AIC Ecommerce Pty Ltd (ABN 26 611 700 979)</strong>, trading
        as <strong>The Local Desk</strong> (<strong>we</strong>, <strong>us</strong> or{' '}
        <strong>the Operator</strong>), and the person or business purchasing a Membership or Day Pass
        (<strong>you</strong> or the <strong>Member</strong>). By purchasing a Membership or Day Pass,
        online or in person, you agree to these terms.
      </p>

      <h2>1. The plans</h2>
      <p>
        The current plans and GST-inclusive prices are (this table is pulled live from Stripe, so it
        can&rsquo;t drift out of date):
      </p>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Billing</th>
              <th>Price (GST incl.)</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.flatMap((category) =>
              productsByCategory(products, category).map((product) => (
                <tr key={product.priceId}>
                  <td>{product.title}</td>
                  <td>{billingLabel(product)}</td>
                  <td>
                    {product.price}
                    {product.priceSuffix}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
      <p>Prices may change from time to time — see clause 5 for how we handle that for existing Members.</p>

      <h2>2. Access to the premises</h2>
      <p>
        Access hours are flexible and set at our discretion — we generally do our best to accommodate
        individual members&rsquo; needs, so check with us directly for current arrangements. There is no
        unsupervised or after-hours access without prior arrangement. CCTV operates in common areas and
        at entry points — see our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>3. No guests</h2>
      <p>
        Members may not bring guests onto the premises. Anyone using the space — including a colleague,
        client or friend — must hold a current Membership or a valid Day Pass or Half-Day Pass in their
        own name. Sharing your access or login with anyone else isn&rsquo;t permitted.
      </p>

      <h2>4. Billing</h2>
      <p>
        Monthly plans are billed in advance to the payment method on file, processed through Stripe. Day
        Passes and Half-Day Passes are charged in full at the time of purchase. Weekly plans are billed
        in advance on a weekly cycle.
      </p>

      <h2>5. Changing our fees or these terms</h2>
      <p>
        We may change our fees or the terms of this Agreement from time to time. Where a change is
        unfavourable to an existing Member, we&rsquo;ll give at least 30 days&rsquo; notice, and you may
        cancel your Membership before the change takes effect without penalty. We won&rsquo;t rely on any
        term that lets us vary this Agreement to your detriment without that notice.
      </p>

      <h2>6. Flexible Memberships</h2>
      <ul>
        <li>No minimum term — cancel any time by emailing ally@thelocaldesk.au.</li>
        <li>Cancellation takes effect at the end of your current billing cycle; you keep access until then.</li>
        <li>
          See our <Link href="/refund-policy">Refund Policy</Link> for how paid fees are treated when
          you cancel.
        </li>
      </ul>

      <h2>7. Fixed-Term Memberships</h2>
      <ul>
        <li>
          Some plans are offered for a fixed term (e.g.{' '}
          <Tbd>[INSERT TERM LENGTHS OFFERED — e.g. 3, 6 or 12 months]</Tbd>), shown to you at checkout.
        </li>
        <li>
          Unless you cancel or we agree otherwise, a Fixed-Term Membership automatically continues as a
          Flexible Membership at the end of the term, billed at the then-current price.
        </li>
        <li>
          Ending a Fixed-Term Membership early isn&rsquo;t guaranteed. We&rsquo;ll consider a request
          case by case, and if we agree to it, may apply an early-exit fee reflecting our reasonable
          costs — we&rsquo;ll tell you the amount before you&rsquo;re charged.
        </li>
      </ul>

      <h2>8. Day Passes and Half-Day Passes</h2>
      <p>
        A Day Pass or Half-Day Pass is valid for the specific date and period you purchased it for, is
        not transferable to another person, and doesn&rsquo;t roll over or require cancellation.
      </p>

      <h2>9. Late or failed payment</h2>
      <p>
        If a payment fails, access to the premises will be restricted until payment is made in full. We
        don&rsquo;t charge a late fee, but we may restrict access without further notice beyond letting
        you know the payment failed.
      </p>

      <h2>10. House rules</h2>
      <ul>
        <li>Treat other members and our staff with respect — no illegal activity, harassment or discrimination.</li>
        <li>Keep noise to a reasonable level, and take extended calls in a suitable area if one&rsquo;s available.</li>
        <li>Leave shared areas — kitchen, meeting rooms, bathrooms — clean and tidy after you use them.</li>
        <li>No smoking or vaping anywhere on the premises.</li>
        <li>No alcohol on the premises, except at an event we host or approve.</li>
        <li>You&rsquo;re responsible for your own belongings and equipment — see clause 11 on insurance.</li>
        <li>You&rsquo;re liable for the cost of repairing or replacing anything you damage.</li>
        <li>No subletting, reselling or otherwise passing on your access to anyone else.</li>
        <li>Follow reasonable staff directions and posted fire and emergency procedures.</li>
        <li>
          We may photograph or film the premises for marketing, and you may appear incidentally — see
          our <Link href="/privacy-policy">Privacy Policy</Link> for how to opt out.
        </li>
      </ul>

      <h2>11. Insurance and liability</h2>
      <p>
        We hold public liability insurance for the premises. It doesn&rsquo;t cover your personal
        property, equipment or business activities — we&rsquo;d encourage you to arrange your own
        contents or business insurance. To the extent the law allows, our liability for loss or damage
        under this Agreement is limited to re-supplying the Membership or Day Pass, or the cost of doing
        so. Nothing in this Agreement excludes, restricts or modifies any guarantee, right or remedy you
        have under the Australian Consumer Law that can&rsquo;t lawfully be excluded — see our{' '}
        <Link href="/refund-policy">Refund Policy</Link>.
      </p>

      <h2>12. Suspension and termination by us</h2>
      <p>
        We may suspend or end your access for non-payment, a breach of these house rules or this
        Agreement, or conduct that risks the safety of others on the premises. Where it&rsquo;s
        reasonably possible, we&rsquo;ll give you notice and a chance to fix a minor breach first.
      </p>

      <h2>13. General</h2>
      <ul>
        <li>This Agreement is governed by the law of New South Wales, Australia.</li>
        <li>If any part of this Agreement is found unenforceable, the rest continues to apply.</li>
        <li>
          This is our standard form of agreement for all Members — nothing in it is intended to operate
          as an unfair contract term under the Australian Consumer Law, and we&rsquo;ll review it against
          that law as it develops.
        </li>
      </ul>

      <h2>Contact us</h2>
      <p>
        AIC Ecommerce Pty Ltd trading as The Local Desk
        <br />
        ABN 26 611 700 979
        <br />
        Shop 2, 27 Collins Street, Kiama, NSW 2533
        <br />
        Email: ally@thelocaldesk.au
      </p>
    </LegalPage>
  );
}
