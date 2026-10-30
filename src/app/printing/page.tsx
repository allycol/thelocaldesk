import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintGrid } from '@/components/PrintGrid';
import { ServiceHero } from '@/components/ServiceHero';
import { getProducts, productsByCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Printing — The Local Desk',
};

// Products come live from Stripe — see the same note in /coworking.
export const dynamic = 'force-dynamic';

export default async function PrintingPage() {
  const items = productsByCategory(await getProducts(), 'printing');

  return (
    <main className="service-page has-hero">
      <ServiceHero title="Printing" image="/images/printing.jpg" position="center 27%">
        Printing is free for Local Desk members. Not a member? Order below &mdash; upload your files,
        pay online, and we&rsquo;ll print them for you, in black &amp; white or colour.
      </ServiceHero>

      <div className="container">
        {items.length > 0 && <PrintGrid items={items} />}

        <Link href="/get-in-touch" className="hero-cta printing-cta">
          Enquire about printing
        </Link>
      </div>
    </main>
  );
}
