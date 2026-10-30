import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { ServiceHero } from '@/components/ServiceHero';
import { getProducts, productsByCategory } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Virtual office — The Local Desk',
};

// Products come live from Stripe — see the same note in /coworking.
export const dynamic = 'force-dynamic';

export default async function VirtualOfficePage() {
  const items = productsByCategory(await getProducts(), 'virtual');

  return (
    <main className="service-page has-hero">
      <ServiceHero title="Virtual office" image="/images/services/virtual-office-hero.jpg" position="center 45%">
        A business address and mail handling without a desk &mdash; for when you need a presence, not a
        seat. Give your business a proper local presence from day one.
      </ServiceHero>

      <div className="container">
        {items.length === 0 ? (
          <p className="empty-category">
            Nothing available online right now — <Link href="/get-in-touch">get in touch</Link> and we&rsquo;ll help.
          </p>
        ) : (
          <ProductGrid items={items} />
        )}
      </div>
    </main>
  );
}
