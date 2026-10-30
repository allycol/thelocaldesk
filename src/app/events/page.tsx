import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { ServiceHero } from '@/components/ServiceHero';
import { getProducts, productsByCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Events — The Local Desk',
};

// Products come live from Stripe — see the same note in /coworking.
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const items = productsByCategory(await getProducts(), 'events');

  return (
    <main className="service-page has-hero">
      <ServiceHero title="Events" image="/images/services/events-hero.jpg" position="center 32%">
        Hire The Local Desk as a venue &mdash; suited to seminars, workshops, small conferences and
        presentations. Hosted in the heart of Kiama, with fast internet and tea and coffee on hand.
      </ServiceHero>

      <div className="container">
        {items.length > 0 && <ProductGrid items={items} />}

        <Link href="/get-in-touch" className="hero-cta printing-cta">
          Enquire about events
        </Link>
      </div>
    </main>
  );
}
