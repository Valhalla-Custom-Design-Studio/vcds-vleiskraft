import PostHog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = 'https://eu.posthog.com';

let client: PostHog | null = null;

export function initPostHog() {
  if (!POSTHOG_KEY) return;
  client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST, flushAt: 20, flushInterval: 30000 });
}

export function track(event: string, props?: Record<string, unknown>) {
  client?.capture(event, props);
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  client?.identify(userId, traits);
}

export function reset() {
  client?.reset();
}

// Key events
export const Events = {
  PRODUCT_VIEWED: 'product_viewed',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  ORDER_PLACED: 'order_placed',
  VLEISAI_QUERY: 'vleisai_query',
  VOICE_ORDER_USED: 'voice_order_used',
  CARCASS_AI_USED: 'carcass_ai_used',
  WOOCOMMERCE_IMPORT: 'woocommerce_import',
  PLATINUM_UPGRADE: 'platinum_upgrade',
  STOCKVEL_JOINED: 'stockvel_joined',
  BRAAI_DIARY_ENTRY: 'braai_diary_entry',
  MEAL_PLAN_CREATED: 'meal_plan_created',
  LAYBY_STARTED: 'layby_started',
  COMPETITION_ENTERED: 'competition_entered',
} as const;
