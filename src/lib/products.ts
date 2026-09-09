import type Stripe from 'stripe';
import { stripe } from './stripe';

export type ProductCategory = 'full_time' | 'flexible' | 'daily' | 'virtual';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  full_time: 'Full time',
  flexible: 'Flexible',
  daily: 'Daily',
  virtual: 'Virtual',
};

// Category copy/imagery is edited here, not in Stripe — categories are our
// own grouping, not a Stripe object. Drop a real image into
// public/images/categories/ and set its path below once available.
export const CATEGORY_INFO: Record<ProductCategory, { description: string; image: string | null }> = {
  full_time: {
    description: 'Your own space, every day — dedicated desks and private offices for a permanent base.',
    image: null,
  },
  flexible: {
    description: "Come and go as it suits you — weekly and monthly bundles for when you don't need a desk daily.",
    image: null,
  },
  daily: {
    description: 'No commitment, just drop in — day passes and half-day access for one-off visits.',
    image: null,
  },
  virtual: {
    description: 'A business address and mail handling without a desk — for when you need a presence, not a seat.',
    image: null,
  },
};

export const CATEGORY_ORDER: ProductCategory[] = ['full_time', 'flexible', 'daily', 'virtual'];

export interface Product {
  priceId: string;
  title: string;
  price: string;
  priceSuffix: string;
  unitAmount: number; // cents, for sorting
  description: string;
  category: ProductCategory;
  image: string | null;
  dailyRate: string | null; // formatted, e.g. "$30" — for comparing across products
  billingInterval: Stripe.Price.Recurring.Interval | null; // e.g. "month" — null for one-time prices
  checkoutEndpoint: '/api/checkout/subscription' | '/api/checkout/one-time';
}

export function isProductCategory(value: unknown): value is ProductCategory {
  return value === 'full_time' || value === 'flexible' || value === 'daily' || value === 'virtual';
}

function formatDollars(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

// Prices are GST-inclusive — the amount shown is the final price, so no
// "+ GST" suffix is added.
function formatPrice(price: Stripe.Price): { price: string; priceSuffix: string } {
  const formatted = formatDollars((price.unit_amount ?? 0) / 100);

  if (price.type === 'recurring' && price.recurring) {
    const unit = price.recurring.interval === 'month' ? 'mo' : price.recurring.interval;
    return { price: formatted, priceSuffix: `/${unit}` };
  }
  return { price: formatted, priceSuffix: '' };
}

function formatDailyRate(product: Stripe.Product): string | null {
  const raw = product.metadata.daily_rate;
  if (!raw) return null;
  const amount = parseFloat(raw);
  if (Number.isNaN(amount)) return null;
  return formatDollars(amount);
}

// Products, prices, descriptions, and images are managed directly in the
// Stripe Dashboard so they can be updated without a redeploy. Category is
// stored as Product metadata (`category`) since Stripe has no native
// grouping field — products missing or with an unrecognised category are
// skipped rather than shown miscategorised.
export async function getProducts(): Promise<Product[]> {
  const result = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
    limit: 100,
  });

  const products: Product[] = [];

  for (const product of result.data) {
    const price = product.default_price;
    if (!price || typeof price === 'string' || !price.active) continue;

    const category = product.metadata.category;
    if (!isProductCategory(category)) continue;

    const { price: priceStr, priceSuffix } = formatPrice(price);

    products.push({
      priceId: price.id,
      title: product.name,
      description: product.description ?? '',
      image: product.images[0] ?? null,
      category,
      price: priceStr,
      priceSuffix,
      unitAmount: price.unit_amount ?? 0,
      dailyRate: formatDailyRate(product),
      billingInterval: price.type === 'recurring' ? (price.recurring?.interval ?? null) : null,
      checkoutEndpoint: price.type === 'recurring' ? '/api/checkout/subscription' : '/api/checkout/one-time',
    });
  }

  products.sort((a, b) => a.unitAmount - b.unitAmount);
  return products;
}

// Flexible products don't merchandise well in plain price order (it
// interleaves weekly and monthly bundles) — show all weekly bundles first,
// largest to smallest, then all monthly bundles, largest to smallest. Bundle
// size is parsed from the title (e.g. "Weekly 5 days hot desk") rather than
// hardcoded, so new bundles slot in correctly without a code change.
function flexibleSortKey(product: Product): [number, number] {
  const intervalRank = product.billingInterval === 'week' ? 0 : product.billingInterval === 'month' ? 1 : 2;
  const days = parseInt(product.title.match(/(\d+)\s*days?/i)?.[1] ?? '0', 10);
  return [intervalRank, -days];
}

export function productsByCategory(products: Product[], category: ProductCategory): Product[] {
  const filtered = products.filter((p) => p.category === category);

  if (category === 'flexible') {
    return [...filtered].sort((a, b) => {
      const [aInterval, aDays] = flexibleSortKey(a);
      const [bInterval, bDays] = flexibleSortKey(b);
      return aInterval - bInterval || aDays - bDays;
    });
  }

  return filtered;
}
