import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — The Local Desk',
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" effectiveDate="5 September 2026">
      <p>
        This policy should be read together with our <Link href="/membership-agreement">Membership
        Agreement</Link>. It explains where you stand on refunds for Memberships and Day Passes with{' '}
        <strong>AIC Ecommerce Pty Ltd</strong>, trading as <strong>The Local Desk</strong>.
      </p>

      <h2>Our general approach</h2>
      <p>
        Membership and Day Pass fees pay for access to a physical space, and are treated as earned once
        the relevant billing cycle begins or a Day Pass is issued. Outside the consumer guarantees below,
        fees aren&rsquo;t refunded for change of mind, non-attendance, cancelling a Membership early, or
        if we relocate or close the premises with reasonable notice.
      </p>

      <h2>Flexible Memberships</h2>
      <p>
        You can cancel any time. Cancellation takes effect at the end of your current billing cycle, and
        you keep access until then — we don&rsquo;t refund the unused portion of a cycle you&rsquo;ve
        already paid for.
      </p>

      <h2>Fixed-Term Memberships</h2>
      <p>
        You&rsquo;re committed for the term you signed up to. If you ask to end it early, we&rsquo;ll
        consider that case by case (see the <Link href="/membership-agreement">Membership Agreement</Link>)
        — and unless we agree otherwise in writing, this policy&rsquo;s no-refund position still applies
        to fees already paid.
      </p>

      <h2>Day Passes and Half-Day Passes</h2>
      <p>
        Once issued, a Day Pass or Half-Day Pass is valid only for its stated date and period, and
        isn&rsquo;t refundable or transferable, except as required by the guarantees below.
      </p>

      <h2>Your rights under the Australian Consumer Law</h2>
      <p className="legal-guarantee">
        Our services come with guarantees that cannot be excluded under the Australian Consumer Law. You
        are entitled to a replacement or refund for a major failure and for compensation for any other
        reasonably foreseeable loss or damage. You are also entitled to have services re-supplied within
        a reasonable time if they are not of an acceptable quality and this does not amount to a major
        failure.
      </p>
      <p>
        In practice, for a coworking Membership this covers things like the premises being unavailable
        due to our fault for an extended period, or access not being provided as described — it
        isn&rsquo;t affected by anything else in this policy.
      </p>

      <h2>Payment errors</h2>
      <p>
        If you&rsquo;re charged in error, or charged twice for the same period, we&rsquo;ll refund the
        incorrect amount in full to your original Stripe payment method.
      </p>

      <h2>How to ask for a refund</h2>
      <p>
        Email <strong>ally@thelocaldesk.au</strong> with your name, your plan, and the reason for your
        request. We&rsquo;ll respond within 3 business days and explain the outcome. Any refund we agree
        to is paid back to your original Stripe payment method.
      </p>

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
