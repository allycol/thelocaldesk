import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductTabs } from '@/components/ProductTabs';
import { getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products — The Local Desk',
};

// Products are managed in Stripe, not this codebase — fetch on every
// request rather than at build time. `revalidate` alone still statically
// prerenders once during `next build`, which fails on hosts (like
// GoDaddy Node.js Hosting) that don't inject secrets until the app
// actually starts — `force-dynamic` skips build-time generation entirely.
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="products-page">
      <div className="container">
        <h1>Products</h1>
        <p className="subtitle">Flexible memberships and day passes — something for everyone.</p>

        <Suspense>
          <ProductTabs products={products} />
        </Suspense>
      </div>
    </main>
  );
}
