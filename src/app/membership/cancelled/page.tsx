import Link from 'next/link';

export default function MembershipCancelledPage() {
  return (
    <main className="status-page">
      <div className="container">
        <h1>Checkout cancelled</h1>
        <p className="subtitle">No charge was made. Head back whenever you&apos;re ready.</p>
        <Link href="/pricing" className="hero-cta">
          Back to pricing
        </Link>
      </div>
    </main>
  );
}
