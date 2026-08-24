// Price IDs from the sandbox (AIC Ecommerce PTY Ltd). Swap in live-mode IDs
// via env vars when going live — see stripe-integration-plan.md.
export type SubscriptionPlanKey = 'hot_desk' | 'dedicated_desk' | 'private_office';
export type OneTimeItemKey = 'day_pass' | 'meeting_room_hourly';
export type PlanKey = SubscriptionPlanKey | OneTimeItemKey;

export const PRICES: Record<PlanKey, string> = {
  hot_desk: process.env.STRIPE_PRICE_HOT_DESK ?? 'price_1U7qsKKkpqRq8EXWqFrfxczy',
  dedicated_desk: process.env.STRIPE_PRICE_DEDICATED_DESK ?? 'price_1U7qsMKkpqRq8EXWsHymyFIC',
  private_office: process.env.STRIPE_PRICE_PRIVATE_OFFICE ?? 'price_1U7qsNKkpqRq8EXWtHbgVldu',
  day_pass: process.env.STRIPE_PRICE_DAY_PASS ?? 'price_1U7qsVKkpqRq8EXWSlmOmbXU',
  meeting_room_hourly: process.env.STRIPE_PRICE_MEETING_ROOM ?? 'price_1U7qsXKkpqRq8EXWX0d2GwLw',
};

export const SUBSCRIPTION_PLANS = new Set<PlanKey>(['hot_desk', 'dedicated_desk', 'private_office']);
export const ONE_TIME_ITEMS = new Set<PlanKey>(['day_pass', 'meeting_room_hourly']);

export function isSubscriptionPlan(key: string): key is SubscriptionPlanKey {
  return SUBSCRIPTION_PLANS.has(key as PlanKey);
}

export function isOneTimeItem(key: string): key is OneTimeItemKey {
  return ONE_TIME_ITEMS.has(key as PlanKey);
}
