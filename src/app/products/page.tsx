import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductTabs } from '@/components/ProductTabs';
import { getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Products — The Local Desk',
};

// Products are managed in Stripe, not this codebase — re-fetch periodically
// rather than baking a snapshot in at build time, so edits in the Stripe
// Dashboard show up without a redeploy.
export const revalidate = 60;

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
