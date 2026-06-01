/**
 * VleisKraft(TM) PayFast Subscription Service
 * B2B Butchery Tiers  -  Bilingual (EN/AF)
 * Consumer = Free | Starter/Beginner R3,500 | Pro/Groei R5,000 | Business/Besigheid R7,500 | Enterprise/Onderneming R15,000
 */
import crypto from 'crypto';

const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE   || '';
const PAYFAST_URL          = process.env.PAYFAST_SANDBOX === 'true'
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

export interface SubscriptionPlan {
  id: string;
  name_en: string;
  name_af: string;
  tier: string;
  amount: number;           // ZAR/month
  billingCycle: 'monthly';
  trial_days: number;       // 0 = no trial
  max_branches: number;
  features_en: string[];
  features_af: string[];
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'consumer_free',
    name_en: 'Consumer (Free)',
    name_af: 'Verbruiker (Gratis)',
    tier: 'consumer',
    amount: 0,
    billingCycle: 'monthly',
    trial_days: 0,
    max_branches: 1,
    features_en: ['Browse butchery catalogue', 'VleisAI(TM) (5 queries/month)', 'View promotions', 'Basic profile'],
    features_af: ['Blaai deur slaggery-katalogus', 'VleisKI(TM) (5 navrae/maand)', 'Sien promosies', 'Basiese profiel'],
  },
  {
    id: 'starter_monthly',
    name_en: 'Starter',
    name_af: 'Beginner',
    tier: 'starter',
    amount: 3500,
    billingCycle: 'monthly',
    trial_days: 30,          // <- 30-day free trial
    max_branches: 1,
    features_en: ['Product catalogue', 'Order management', 'WhatsApp commerce', 'Basic analytics', 'Layby', 'Basic demand intelligence'],
    features_af: ['Produk-katalogus', 'Bestellingbestuur', 'WhatsApp-handel', 'Basiese analitika', 'L\u00EA-by', 'Basiese aanvraagintelligensie'],
  },
  {
    id: 'pro_monthly',
    name_en: 'Pro',
    name_af: 'Groei',
    tier: 'pro',
    amount: 5000,
    billingCycle: 'monthly',
    trial_days: 0,
    max_branches: 1,
    features_en: ['All Starter features', 'Full analytics', 'Stockvel management', 'WooCommerce sync', 'Full demand intelligence', 'Meal planner', 'VleisAI(TM) unlimited'],
    features_af: ['Alle Beginner-funksies', 'Volledige analitika', 'Stockvel-bestuur', 'WooCommerce-integrasie', 'Volledige aanvraagintelligensie', 'Maaltydplanner', 'VleisKI(TM) onbeperk'],
  },
  {
    id: 'business_monthly',
    name_en: 'Business',
    name_af: 'Besigheid',
    tier: 'business',
    amount: 7500,
    billingCycle: 'monthly',
    trial_days: 0,
    max_branches: 3,
    features_en: ['All Pro features', 'Marketing campaigns', 'Competitions', 'Spitbraai bookings', 'Academy access', 'Up to 3 branches', 'Priority support'],
    features_af: ['Alle Groei-funksies', 'Bemarkingsveldtogte', 'Kompetisies', 'Spit braai-besprekings', 'Akademie-toegang', 'Tot 3 takke', 'Prioriteitsondersteuning'],
  },
  {
    id: 'enterprise_monthly',
    name_en: 'Enterprise',
    name_af: 'Onderneming',
    tier: 'enterprise',
    amount: 15000,
    billingCycle: 'monthly',
    trial_days: 0,
    max_branches: 999,
    features_en: ['All Business features', 'Multi-franchise management', 'White-label branding', 'Dedicated onboarding', 'Custom integrations', 'API access', 'SLA support'],
    features_af: ['Alle Besigheid-funksies', 'Multi-franchise-bestuur', 'Wit-etiket-handelsmerke', 'Toegewyde aanboord', 'Pasgemaakte integrasies', 'API-toegang', 'SLA-ondersteuning'],
  },
];

function generateSignature(params: Record<string, string>): string {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&');
  const withPass = PAYFAST_PASSPHRASE
    ? `${str}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : str;
  return crypto.createHash('md5').update(withPass).digest('hex');
}

export function buildPaymentUrl(
  planId: string,
  userId: string,
  butcheryName: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string,
): string {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  if (plan.amount === 0) throw new Error('Consumer plan is free  -  no payment required');

  const now = new Date();
  const billingDate = plan.trial_days > 0
    ? new Date(now.getTime() + plan.trial_days * 86400000)
    : now;
  const billingDateStr = billingDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const params: Record<string, string> = {
    merchant_id:      PAYFAST_MERCHANT_ID,
    merchant_key:     PAYFAST_MERCHANT_KEY,
    return_url:       returnUrl,
    cancel_url:       cancelUrl,
    notify_url:       notifyUrl,
    name_first:       butcheryName,
    m_payment_id:     `${userId}_${planId}_${Date.now()}`,
    amount:           plan.amount.toFixed(2),
    item_name:        `VleisKraft(TM) ${plan.name_en}  -  R${plan.amount.toLocaleString('en-ZA')}/maand`,
    subscription_type: '1',
    billing_date:     billingDateStr,
    recurring_amount: plan.amount.toFixed(2),
    frequency:        '3',   // Monthly
    cycles:           '0',   // Indefinite
  };

  // 30-day trial: initial charge R0
  if (plan.trial_days > 0) {
    params.amount = '0.00';
  }

  params.signature = generateSignature(params);
  const query = new URLSearchParams(params).toString();
  return `${PAYFAST_URL}?${query}`;
}

export function validateWebhookSignature(params: Record<string, string>): boolean {
  const received = params.signature;
  const clean = { ...params };
  delete clean.signature;
  const expected = generateSignature(clean);
  return received === expected;
}
