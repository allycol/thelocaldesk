import Link from 'next/link';

// Compliance requirement: ABN/business name/address and links to the three
// policy pages need to appear on every page, not just at checkout — see the
// footer stop of the compliance map. "Manage membership" also lives here so
// self-service cancellation is reachable from anywhere in one click.
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-business">
          AIC Ecommerce Pty Ltd trading as The Local Desk · ABN 26 611 700 979 · Shop 2, 27 Collins
          Street, Kiama, NSW 2533
        </p>
        <nav className="site-footer-links">
          <Link href="/account">Manage membership</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/membership-agreement">Membership Agreement</Link>
          <Link href="/refund-policy">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
