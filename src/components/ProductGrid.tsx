import { BuyButton } from '@/components/BuyButton';
import { CATEGORY_LABELS, type Product } from '@/lib/products';

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <>
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

      {items.some((product) => product.billingInterval) && (
        <p className="subscription-disclosure">
          * Renews automatically until you cancel. Cancel anytime — takes effect at the end of your current
          billing cycle.
        </p>
      )}
    </>
  );
}
