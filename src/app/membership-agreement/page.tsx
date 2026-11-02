import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Tbd } from '@/components/LegalPage';
import { CATEGORY_ORDER, getProducts, productsByCategory, type Product } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Membership Agreement — The Local Desk',
};

// Prices are managed in Stripe, not this codebase — fetch on every
// request rather than at build time (same pattern as /coworking).
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
    <LegalPage title="Membership Agreement" effectiveDate="2 November 2026">
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
        Our access hours are 9am to 6pm, Monday to Friday, excluding public holidays. We&rsquo;ll do our
        best to accommodate individual members&rsquo; needs outside those hours, so check with us
        directly, but there is no unsupervised or after-hours access without prior arrangement. CCTV operates in common areas and
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

      <h2>13. Virtual Office / Business Address</h2>

      <h3>13.1 Scope</h3>
      <ol className="legal-alpha">
        <li>
          This clause applies to members on the Virtual Office plan (see Clause 1), referred to in this
          clause as the <strong>Address Service</strong>.
        </li>
        <li>
          The Virtual Office plan may be taken on its own, or in addition to any of our monthly plans. It
          is not available in addition to our weekly plans, Day Passes, or other single-use passes.
        </li>
        <li>
          The Address Service is a feature of an active Virtual Office plan, not a standalone product once
          purchased — it ends when that plan ends, on the terms in clause 13.6.
        </li>
      </ol>

      <h3>13.2 What the Address Service includes</h3>
      <ol className="legal-alpha">
        <li>
          Use of Shop 2, 27 Collins Street, Kiama, NSW 2533 (the <strong>Address</strong>) as your
          business&rsquo;s postal address, and, where clause 13.3 applies, as your company&rsquo;s
          registered office or your business&rsquo;s principal place of business.
        </li>
        <li>Receipt and handling of mail addressed to you at the Address, on the terms in clause 13.5.</li>
        <li>
          The Address Service does not include a dedicated phone number, call answering, or reception
          unless separately agreed with us in writing.
        </li>
      </ol>

      <h3>13.3 Use as a registered office or principal place of business</h3>
      <ol className="legal-alpha">
        <li>
          If you ask to nominate the Address as your company&rsquo;s registered office with the Australian
          Securities and Investments Commission (ASIC), or as your principal place of business with the
          Australian Business Register, we will give our written consent as occupier of the premises,
          provided your Virtual Office plan is current and not restricted under Clause 9 or suspended
          under Clause 12, you hold your own current ABN (and ACN, if a company), and you have not been
          asked to stop using the Address under clause 13.6.
        </li>
        <li>
          Our consent is given for so long as your Virtual Office plan remains active, and is
          automatically withdrawn on the date that plan ends, or earlier under clause 13.6. It does not
          survive cancellation, non-payment restriction, or termination of that plan.
        </li>
        <li>
          We will provide our consent in writing on request, in the form of the consent letter attached to
          this Agreement as a schedule, and may re-confirm it periodically or on request from ASIC, the
          Australian Business Register, or another regulator.
        </li>
        <li>
          A registered office must be a physical address open to the public for at least three business
          hours each business day. For the purposes of the Address Service, the Address is open to the
          public from 9am to 6pm, Monday to Friday, excluding public holidays.
        </li>
      </ol>

      <h3>13.4 Your obligations</h3>
      <ol className="legal-alpha">
        <li>
          You must keep your registration details current with ASIC and the Australian Business Register
          at all times, and must notify us promptly of any change to your business name, ABN, ACN, or the
          nature of your business conducted at the Address.
        </li>
        <li>
          You must not use the Address, or represent that you use the Address, for any business other than
          the one disclosed to us, or for any unlawful, deceptive, or misleading purpose.
        </li>
        <li>
          You must not use the Address as a retail shopfront, a delivery address for goods sold to third
          parties, or a returns address, unless we&rsquo;ve agreed to this in writing beforehand — the
          Address Service is for correspondence and registration purposes, not fulfilment.
        </li>
        <li>
          You remain solely responsible for meeting your own obligations to ASIC, the Australian Business
          Register, the Australian Taxation Office, and any other regulator, including responding to
          notices sent to the Address. Our handling of your mail under clause 13.5 does not transfer any
          part of that responsibility to us.
        </li>
      </ol>

      <h3>13.5 Mail handling</h3>
      <ol className="legal-alpha">
        <li>
          We will collect mail addressed to you at the Address during our access hours, hold it for you at
          the premises, and notify you by email within 1–2 business days of receipt.
        </li>
        <li>
          We will take reasonable care in handling your mail, but we are not a registered postal or
          mail-redirection service, and we do not accept responsibility for loss, delay, or misdelivery of
          mail once it has left our premises, or for any consequence of a notice (including from ASIC or
          the ATO) not being actioned by you in time.
        </li>
        <li>
          You should not use the Address to receive items requiring a signature, items of significant
          value, or time-critical legal documents unless you&rsquo;ve made a specific arrangement with us
          in advance.
        </li>
        <li>
          While your Virtual Office plan is active, we will hold uncollected mail for you indefinitely.
          Once that plan ends, we will continue holding any uncollected mail for a further 3 months, after
          which we may return it to sender or securely destroy it.
        </li>
      </ol>

      <h3>13.6 Ending the Address Service</h3>
      <ol className="legal-alpha">
        <li>
          The Address Service ends automatically when your Virtual Office plan ends, however that happens
          — cancellation under Clause 6 or 7, non-payment restriction under Clause 9, or suspension or
          termination under Clause 12.
        </li>
        <li>
          Within 28 days of the Address Service ending, you must update your registered office, principal
          place of business, and any other public record that names the Address, with ASIC, the Australian
          Business Register, and any other relevant body — matching the notice period those regulators
          require of you directly.
        </li>
        <li>
          We may withdraw our consent to your use of the Address, and ask you to complete the change in
          clause 13.6(b) sooner than 28 days, if your plan is restricted or suspended under Clause 9 or 12,
          we reasonably believe the Address is being used in breach of clause 13.4, or we&rsquo;re asked to
          do so by ASIC, a court, or another regulator.
        </li>
        <li>
          If you don&rsquo;t complete that change in time, we may (but don&rsquo;t have to) notify ASIC or
          the Australian Business Register that we no longer consent to the Address being used as your
          registered office or principal place of business.
        </li>
      </ol>

      <h3>13.7 Fees</h3>
      <ol className="legal-alpha">
        <li>
          Fees for the Virtual Office plan are those shown in Clause 1, inclusive of GST where we are
          GST-registered. Clause 4 (billing), Clause 9 (late or failed payment), and Clause 12 (suspension
          and termination) apply to the Address Service in the same way they apply to your other plan
          inclusions.
        </li>
      </ol>

      <h3>13.8 Indemnity</h3>
      <ol className="legal-alpha">
        <li>
          You indemnify us against any loss, claim, fine, or cost we reasonably incur because the Address
          was used in breach of clause 13.4, including any claim by a third party who was misled about your
          business&rsquo;s location or presence at the Address.
        </li>
      </ol>

      <h2>14. General</h2>
      <ul>
        <li>This Agreement is governed by the law of New South Wales, Australia.</li>
        <li>If any part of this Agreement is found unenforceable, the rest continues to apply.</li>
        <li>
          This is our standard form of agreement for all Members — nothing in it is intended to operate
          as an unfair contract term under the Australian Consumer Law, and we&rsquo;ll review it against
          that law as it develops.
        </li>
      </ul>

      <h2>Schedule — Written consent letter</h2>
      <p>
        This is the form of consent we give under clause 13.3 for a Virtual Office member to use the
        Address as a registered office or principal place of business.
      </p>
      <div className="legal-letter">
        <p>
          <em>[Date]</em>
        </p>
        <p>To whom it may concern,</p>
        <h3>Consent to Use of Premises as Registered Office / Principal Place of Business</h3>
        <p>
          AIC Ecommerce Pty Ltd (ABN 26 611 700 979, ACN 611 700 979), trading as The Local Desk, as
          occupier of Shop 2, 27 Collins Street, Kiama, NSW 2533, consents to{' '}
          <em>[member&rsquo;s registered business/company name, ABN/ACN]</em> using this address as its
          registered office and/or principal place of business, for so long as{' '}
          <em>[member name]</em> holds a current Virtual Office plan with The Local Desk.
        </p>
        <p>
          This consent is given on behalf of AIC Ecommerce Pty Ltd and may be withdrawn on the terms of the
          member&rsquo;s Membership Agreement with us.
        </p>
        <p>Signed: ______________________________</p>
        <p>
          Name / position: <em>[name, position]</em>
        </p>
        <p>For and on behalf of AIC Ecommerce Pty Ltd t/as The Local Desk</p>
      </div>

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
