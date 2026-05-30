// VleisKraft™ Subscription Tiers
// Consumers: FREE forever — no tier, no gate, no paywall
// Butchers: 5-tier B2B model

export type ConsumerTier = 'consumer'; // always free
export type ButcherTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
export type VleisKraftTier = ConsumerTier | ButcherTier;

export const BUTCHER_TIER_RANK: Record<ButcherTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
  enterprise: 4,
};

export const BUTCHER_TIERS = {
  free: {
    id: 'free',
    name_en: 'Freemium',
    name_af: 'Gratis',
    price: 0,
    price_display_en: 'R0/mo',
    price_display_af: 'R0/mo',
    color: '#555555',
    features_en: [
      'List up to 10 products',
      'Basic storefront on VleisKraft™',
      'Customer enquiries',
      'VleisKraft™ directory listing',
    ],
    features_af: [
      'Lys tot 10 produkte',
      'Basiese winkelfront op VleisKraft™',
      'Kliënte-navrae',
      'VleisKraft™ gidsinskrywing',
    ],
  },
  starter: {
    id: 'starter',
    name_en: 'Starter',
    name_af: 'Beginners',
    price: 3500,
    price_display_en: 'R3,500/mo',
    price_display_af: 'R3 500/mo',
    color: '#C0392B',
    features_en: [
      'Up to 50 products',
      'Order management dashboard',
      'WhatsApp order alerts',
      'Basic analytics',
      'Customer loyalty tracking',
    ],
    features_af: [
      'Tot 50 produkte',
      'Bestellingbestuur-dashboard',
      'WhatsApp-bestellingkennisgewings',
      'Basiese analitiek',
      'Kliëntelojaliteitsopsporing',
    ],
  },
  pro: {
    id: 'pro',
    name_en: 'Pro',
    name_af: 'Pro',
    price: 7500,
    price_display_en: 'R7,500/mo',
    price_display_af: 'R7 500/mo',
    color: '#8B0000',
    badge: 'GEWILD',
    popular: true,
    features_en: [
      'Unlimited products',
      'VleisAI™ demand forecasting',
      'Campaign & promotions manager',
      'Stockvel group management',
      'Advanced analytics',
      'Priority listing placement',
    ],
    features_af: [
      'Onbeperkte produkte',
      'VleisAI™ vraagvoorspelling',
      'Veldtog- en promosiebestuurder',
      'Stockvel-groepbestuur',
      'Gevorderde analitiek',
      'Prioriteit noteringsplasing',
    ],
  },
  business: {
    id: 'business',
    name_en: 'Business',
    name_af: 'Besigheid',
    price: 10000,
    price_display_en: 'R10,000/mo',
    price_display_af: 'R10 000/mo',
    color: '#1a3a5c',
    features_en: [
      'Multi-branch management',
      'B2B bulk order portal',
      'Volume pricing tiers',
      'Automated invoicing',
      'Delivery scheduler',
      'Dedicated account manager',
    ],
    features_af: [
      'Multi-tak bestuur',
      'B2B grootmaat bestellingsportaal',
      'Volumeprysvlakke',
      'Outomatiese fakturering',
      'Afleweringskedule',
      'Toegewyde rekeningbestuurder',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name_en: 'Enterprise',
    name_af: 'Onderneming',
    price: 15000,
    price_display_en: 'R15,000/mo',
    price_display_af: 'R15 000/mo',
    color: '#C9A84C',
    features_en: [
      'Everything in Business',
      'Custom API integrations',
      'White-label options',
      'Dedicated support line',
      'Custom reporting & SLA guarantee',
      'Early access to new features',
    ],
    features_af: [
      'Alles in Besigheid',
      'Pasgemaakte API-integrasies',
      'Wit-etiket opsies',
      'Toegewyde ondersteuningslyn',
      'Pasgemaakte verslagdoening & SLA-waarborg',
      'Vroeë toegang tot nuwe funksies',
    ],
  },
} as const;

export const VLEISKRAFT_SUBSCRIBE_ROUTE = '/paywall/butcher-plans';
export const VLEISKRAFT_ACCENT = '#C9A84C';
