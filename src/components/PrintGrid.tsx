'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORY_LABELS, type Product } from '@/lib/products';
import { MAX_QUANTITY } from '@/lib/printFiles-constants';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function PrintCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.minQuantity);

  function clamp(value: number): number {
    if (!Number.isFinite(value)) return product.minQuantity;
    return Math.min(MAX_QUANTITY, Math.max(product.minQuantity, Math.round(value)));
  }

  return (
    <article className="product-card">
      <div className="product-body">
        <span className="category-tag">{CATEGORY_LABELS[product.category]}</span>
        <h3>{product.title}</h3>
        <div className="product-price">
          {product.price} <span>each</span>
        </div>
        {product.description && <p className="product-description">{product.description}</p>}

        <div className="quantity-picker">
          <label htmlFor={`qty-${product.priceId}`}>Quantity</label>
          <div className="quantity-controls">
            <button type="button" onClick={() => setQuantity((q) => clamp(q - 1))} aria-label="Decrease quantity">
              −
            </button>
            <input
              id={`qty-${product.priceId}`}
              type="number"
              inputMode="numeric"
              min={product.minQuantity}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              onBlur={() => setQuantity(clamp(quantity))}
            />
            <button type="button" onClick={() => setQuantity((q) => clamp(q + 1))} aria-label="Increase quantity">
              +
            </button>
          </div>
        </div>

        {product.minQuantity > 1 && (
          <p className="quantity-note">Minimum order of {product.minQuantity}, due to card payment minimums.</p>
        )}

        <p className="print-total">
          Total <strong>{formatCents(product.unitAmount * clamp(quantity))}</strong>
        </p>

        <Link
          href={`/printing/upload?priceId=${encodeURIComponent(product.priceId)}&quantity=${clamp(quantity)}`}
          className="buy-button buy-button-link"
        >
          Get prints
        </Link>
      </div>
    </article>
  );
}

export function PrintGrid({ items }: { items: Product[] }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <PrintCard key={product.priceId} product={product} />
      ))}
    </div>
  );
}
