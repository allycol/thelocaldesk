import Link from 'next/link';

// Print orders send `print_ref` on the success URL (see api/print/upload) so
// they get their own copy; it's display-only, so a made-up value is harmless.
const PRINT_REF = /^[A-Z0-9]{8}$/;

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ print_ref?: string }>;
}) {
  const { print_ref } = await searchParams;

  if (print_ref) {
    return (
      <main className="status-page">
        <div className="container">
          <h1>Thanks, your print order is in 🖨️</h1>
          <p className="subtitle">
            We&rsquo;ve received your files and payment. Check your inbox for the receipt.
            {PRINT_REF.test(print_ref) && <> Your order reference is {print_ref}.</>}
          </p>
          <p>
            We&rsquo;ll print your order and email you as soon as it&rsquo;s ready. Pick it up whenever suits
            you &mdash; print orders are left just inside the front door, on the left.
          </p>
          <p className="status-cta">
            Need to change something? <Link href="/get-in-touch">Get in touch →</Link>
          </p>
        </div>
      </main>
    );
  }

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
