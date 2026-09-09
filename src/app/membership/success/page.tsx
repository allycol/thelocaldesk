import Link from 'next/link';

export default function MembershipSuccessPage() {
  return (
    <main className="status-page">
      <div className="container">
        <h1>You&apos;re in 🎉</h1>
        <p className="subtitle">
          Your membership is active. A receipt is on its way to your email — the webhook will finish
          syncing your account shortly.
        </p>
        <p className="status-note">
          Cancelling is easy whenever you need to — no phone calls, no lock-in. Head to{' '}
          <Link href="/account">Manage membership</Link>, enter the email you signed up with, and
          you&apos;ll get a secure link to view your billing history or cancel in a couple of
          clicks.
        </p>
        <p className="status-cta">
          Have a question? <Link href="/get-in-touch">Get in touch →</Link>
        </p>
      </div>
    </main>
  );
}
