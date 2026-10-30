import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PrintUploadForm } from '@/components/PrintUploadForm';
import { MAX_QUANTITY } from '@/lib/printFiles-constants';
import { getProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Upload your files — The Local Desk',
};

// Reads live product data from Stripe — see the same note in /coworking.
export const dynamic = 'force-dynamic';

export default async function PrintUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ priceId?: string; quantity?: string }>;
}) {
  const { priceId, quantity: quantityRaw } = await searchParams;
  const quantity = Number(quantityRaw);
  const product = (await getProducts()).find((p) => p.priceId === priceId && p.category === 'printing');

  if (!product || !Number.isInteger(quantity) || quantity < product.minQuantity || quantity > MAX_QUANTITY) {
    redirect('/printing');
  }

  const total = `$${((product.unitAmount * quantity) / 100).toFixed(2)}`;

  return (
    <main className="service-page">
      <div className="container">
        <h1>Upload your files</h1>
        <p className="subtitle">
          {quantity} × {product.title} — <strong>{total}</strong> (GST inclusive). Add the files you&rsquo;d like printed,
          then continue to payment. <Link href="/printing">Change order</Link>
        </p>

        <PrintUploadForm priceId={product.priceId} quantity={quantity} />
      </div>
    </main>
  );
}
