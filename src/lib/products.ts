import type Stripe from 'stripe';
import { stripe } from './stripe';

export type ProductCategory = 'full_time' | 'flexible' | 'daily' | 'virtual' | 'students' | 'printing' | 'events';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  full_time: 'Full time',
  flexible: 'Flexible',
  daily: 'Daily',
  virtual: 'Virtual',
  students: 'Students',
  printing: 'Printing',
  events: 'Events',
};

// Category copy/imagery is edited here, not in Stripe — categories are our
// own grouping, not a Stripe object. Images live in public/images/ — add
// one there and set its path below.
export const CATEGORY_INFO: Record<ProductCategory, { description: string; image: string | null }> = {
  full_time: {
    description: 'Your own space, every day — dedicated desks for a permanent base.',
    image: '/images/home-space.jpg',
  },
  flexible: {
    description: "Come and go as it suits you — weekly and monthly bundles for when you don't need a desk daily.",
    image: '/images/mixed-spaces.jpg',
  },
  daily: {
    description: 'No commitment, just drop in — day passes and half-day access for one-off visits.',
    image: '/images/collaboration-area.jpg',
  },
  virtual: {
    description: 'A business address and mail handling without a desk — for when you need a presence, not a seat.',
    image: '/images/services/virtual-office-hero.jpg',
  },
  students: {
    description: 'Affordable study passes for students and tutors — flexible hours, no long-term commitment.',
    image: null,
  },
  printing: {
    description: 'Free for members. Everyone else pays per page, in colour or black and white.',
    image: null,
  },
  events: {
    description: 'Hire The Local Desk as a venue — suited to seminars, small conferences and presentations.',
    image: null,
  },
};

// Full order — used by the Membership Agreement's live price table, which
// should reflect every membership/pass category. `printing` is deliberately
// not here: per-page print jobs and venue hire aren't plans, and have their
// own pages.
export const CATEGORY_ORDER: ProductCategory[] = ['full_time', 'flexible', 'daily', 'virtual', 'students'];

// /coworking's category tabs — everything except `virtual`, which has its
// own page (/virtual-office) now that it's a separate service.
export const COWORKING_CATEGORY_ORDER: ProductCategory[] = CATEGORY_ORDER.filter((c) => c !== 'virtual');

// Homepage teaser grid only — deliberately a subset of CATEGORY_ORDER.
// `students` is intentionally left off here for now (still deciding how/
// whether to feature it on the homepage) even though it's live on
// /coworking and in the Membership Agreement.
export const HOME_CATEGORY_ORDER: ProductCategory[] = ['full_time', 'flexible', 'daily', 'virtual'];

// Where a category's teaser/links should land.
export function categoryHref(category: ProductCategory): string {
  return category === 'virtual' ? '/virtual-office' : `/coworking?category=${category}`;
}

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
  minQuantity: number; // 1 unless the unit price is too low to meet Stripe's minimum charge
}

// Stripe won't create a Checkout charge below 50c AUD, so a 20c print has to
// be bought in multiples. Not a product setting — derived from the price.
const STRIPE_MIN_CHARGE_CENTS = 50;

export function minimumQuantity(unitAmountCents: number): number {
  return unitAmountCents > 0 ? Math.max(1, Math.ceil(STRIPE_MIN_CHARGE_CENTS / unitAmountCents)) : 1;
}

export function isProductCategory(value: unknown): value is ProductCategory {
  return (
    value === 'full_time' ||
    value === 'flexible' ||
    value === 'daily' ||
    value === 'virtual' ||
    value === 'students' ||
    value === 'printing' ||
    value === 'events'
  );
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
      minQuantity: minimumQuantity(price.unit_amount ?? 0),
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
