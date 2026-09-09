'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BuyButton } from '@/components/BuyButton';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  isProductCategory,
  productsByCategory,
  type Product,
  type ProductCategory,
} from '@/lib/products';

const DEFAULT_CATEGORY: ProductCategory = 'flexible';

export function ProductTabs({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get('category');
  const activeCategory = isProductCategory(requested) ? requested : DEFAULT_CATEGORY;

  function selectCategory(category: ProductCategory) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const items = productsByCategory(products, activeCategory);

  return (
    <>
      <nav className="category-tabs">
        {CATEGORY_ORDER.map((category) => (
          <button
            key={category}
            className={`category-tab ${category === activeCategory ? 'is-active' : ''}`}
            onClick={() => selectCategory(category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="empty-category">No products in this category yet.</p>
      ) : (
        <div className="product-grid">
          {items.map((product) => (
            <article className="product-card" key={product.priceId}>
              {product.image && (
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                </div>
              )}
              <div className="product-body">
                <span className="category-tag">{CATEGORY_LABELS[product.category]}</span>
                <h3>{product.title}</h3>
                <div className="product-price">
                  {product.price} <span>{product.priceSuffix}</span>
                  {product.billingInterval && <sup className="disclosure-asterisk">*</sup>}
                </div>
                {product.dailyRate && <p className="daily-rate">≈ {product.dailyRate}/day</p>}
                <p className="product-description">{product.description}</p>
                <BuyButton
                  priceId={product.priceId}
                  endpoint={product.checkoutEndpoint}
                  label={product.checkoutEndpoint === '/api/checkout/subscription' ? 'Subscribe' : 'Book now'}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {items.some((product) => product.billingInterval) && (
        <p className="subscription-disclosure">
          * Renews automatically until you cancel. Cancel anytime — takes effect at the end of your current
          billing cycle.
        </p>
      )}
    </>
  );
}
