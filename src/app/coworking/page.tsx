import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductTabs } from '@/components/ProductTabs';
import { ServiceHero } from '@/components/ServiceHero';
import { COWORKING_CATEGORY_ORDER, getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Coworking — The Local Desk',
};

// Products are managed in Stripe, not this codebase — fetch on every
// request rather than at build time. `revalidate` alone still statically
// prerenders once during `next build`, which fails on hosts (like
// GoDaddy Node.js Hosting) that don't inject secrets until the app
// actually starts — `force-dynamic` skips build-time generation entirely.
export const dynamic = 'force-dynamic';

export default async function CoworkingPage() {
  const products = await getProducts();

  return (
    <main className="service-page has-hero">
      <ServiceHero title="Coworking" image="/images/services/coworking-hero.jpg" position="center 59%">
        Hot-desks, dedicated workstations and flexible day passes in the heart of Kiama. Join for a
        month or drop in for a day &mdash; either way you get fast internet, free tea and coffee, and a
        room full of people getting on with it.
      </ServiceHero>

      <div className="container">
        <div className="pricing-promo">
          <p>
            <strong>🐣 Early bird pricing</strong> — lock in these rates while they last. There&rsquo;s
            also no minimum subscription period yet (a 3-month minimum is coming later).
          </p>
        </div>

        <Suspense>
          <ProductTabs products={products} categories={COWORKING_CATEGORY_ORDER} />
        </Suspense>
      </div>
    </main>
  );
}
