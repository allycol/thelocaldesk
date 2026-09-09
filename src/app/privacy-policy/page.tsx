import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — The Local Desk',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="5 September 2026">
      <p>
        AIC Ecommerce Pty Ltd (ABN 26 611 700 979, ACN 611 700 979), trading as The Local Desk (
        <strong>we</strong>, <strong>us</strong> or <strong>our</strong>), respects your privacy. This
        policy explains what personal information we collect through our website and our coworking
        premises, how we use and share it, and how you can access, correct, or ask questions about it.
        It&rsquo;s written to meet our obligations under the <strong>Privacy Act 1988</strong> (Cth) and
        the Australian Privacy Principles (APPs).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account and billing details</strong> — your name, email address, phone number,
          business name, and a payment token from Stripe (we never see or store your full card number).
        </li>
        <li>
          <strong>Premises and access records</strong> — sign-in records during staffed hours, and CCTV
          footage of common areas and entry points.
        </li>
        <li>
          <strong>Marketing and website data</strong> — email engagement data through Brevo (opens,
          clicks, unsubscribes), and website usage data collected through Google Analytics, Google Ads,
          and the Meta Pixel.
        </li>
        <li>Anything you volunteer to us directly — in an enquiry, a support email, or a form.</li>
      </ul>

      <h2>How we collect it</h2>
      <p>
        Directly from you, when you sign up for a Membership or Day Pass, contact us, or sign in at
        reception. Automatically, through cookies and tracking pixels on our website. And physically,
        through the CCTV cameras operating on the premises.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>To set up and run your Membership or Day Pass, and to process payment through Stripe.</li>
        <li>To manage access to and the security of the premises, including CCTV monitoring.</li>
        <li>
          To send you service communications — invoices, receipts, and notices about your Membership
          (including changes to fees or terms).
        </li>
        <li>
          With your consent, to send you marketing by email through Brevo, and to show you tailored
          advertising through Google and Meta.
        </li>
        <li>To understand and improve our website, using Google Analytics.</li>
        <li>
          To meet our legal obligations, including issuing tax invoices and complying with workplace
          safety requirements.
        </li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share personal information with the service providers we use to run the business, and only
        for the purposes above:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — to process payments.
        </li>
        <li>
          <strong>Brevo</strong> — to send email marketing, where you&rsquo;ve opted in.
        </li>
        <li>
          <strong>Meta and Google</strong> — to run and measure advertising, and to analyse website
          traffic.
        </li>
      </ul>
      <p>
        Some of these providers store or process information outside Australia — Stripe, Meta and Google
        in the United States, and Brevo in the European Union. Before we share information with an
        overseas provider, we take reasonable steps to check they handle it consistently with the
        Australian Privacy Principles, generally through their own data processing agreements and
        certifications. We may also disclose information where required by law, or to our professional
        advisers.
      </p>

      <h2>Cookies and online tracking</h2>
      <p>
        Our website uses cookies and similar technology from Google Analytics, Google Ads and the Meta
        Pixel to understand how the site is used and to show relevant ads on other sites. You can limit
        this through your browser&rsquo;s cookie settings, or through Google&rsquo;s and Meta&rsquo;s own
        ad-preference controls. Turning cookies off may affect how parts of the site work.
      </p>

      <h2>CCTV</h2>
      <p>
        Cameras operate in common areas and at entry points of the premises for the security of members,
        staff and property. Signage is displayed on site. Footage is retained for 30 days and is only
        accessed to investigate an incident or for security purposes.
      </p>

      <h2>Photos and video for marketing</h2>
      <p>
        From time to time we take photos or video of the space for our own marketing (including for use
        with Brevo, Meta or Google), and members may appear in the background. If you&rsquo;d rather not
        appear in marketing material, let us know at ally@thelocaldesk.au and we&rsquo;ll take reasonable
        steps to exclude or remove you.
      </p>

      <h2>Keeping your information secure</h2>
      <p>
        We take reasonable technical and organisational steps to protect personal information from
        misuse, loss and unauthorised access, including restricting who on our team can access it and
        relying on our providers&rsquo; own security measures. No system is completely secure, and we
        can&rsquo;t guarantee against every risk.
      </p>

      <h2>Access and correction</h2>
      <p>
        You can ask us for a copy of the personal information we hold about you, or ask us to correct it,
        by emailing ally@thelocaldesk.au. We may need to verify your identity first, and we&rsquo;ll
        respond within a reasonable time.
      </p>

      <h2>Complaints</h2>
      <p>
        If you think we&rsquo;ve mishandled your personal information, contact us first at
        ally@thelocaldesk.au so we can try to sort it out. If you&rsquo;re not satisfied with our
        response, you can lodge a complaint with the{' '}
        <strong>Office of the Australian Information Commissioner</strong> (OAIC) at{' '}
        <a href="https://oaic.gov.au" target="_blank" rel="noreferrer">
          oaic.gov.au
        </a>
        .
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy as our business or the law changes. The current version will always be
        available on our website, with the effective date at the top.
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
