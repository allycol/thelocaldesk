import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <main className="status-page">
      <div className="container">
        <h1>Booking confirmed 🎉</h1>
        <p className="subtitle">Check your inbox for the receipt and details.</p>
        <p className="status-cta">
          Have a question about your booking? <Link href="/get-in-touch">Get in touch →</Link>
        </p>
      </div>
    </main>
  );
}
