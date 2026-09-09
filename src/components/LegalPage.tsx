// Shared chrome for the three compliance pages (Privacy Policy, Membership
// Agreement, Refund & Cancellation Policy) — heading, effective date, and
// consistent typography for the body content each page supplies.
export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <main className="legal-page">
      <div className="container legal-container">
        <h1>{title}</h1>
        <p className="legal-effective-date">The Local Desk · Effective {effectiveDate}</p>
        {children}
      </div>
    </main>
  );
}

// Marks text that still needs a real value before this page can go live —
// rendered clearly rather than silently guessed. Search the codebase for
// <Tbd to find every outstanding placeholder across all three pages.
export function Tbd({ children }: { children: React.ReactNode }) {
  return <mark className="legal-tbd">{children}</mark>;
}
