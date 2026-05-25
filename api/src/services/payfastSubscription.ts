/**
 * PayFast Platinum Subscription Service
 * Handles butchery Platinum tier subscriptions with white-label branding
 */
import crypto from 'crypto';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_URL = 'https://www.payfast.co.za/eng/process';

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'platinum_monthly',
    name: 'VleisKraft™ Platinum Maandeliks',
    amount: 499,
    billingCycle: 'monthly',
    features: ['White-label branding', 'Custom logo & colours', 'WooCommerce sync', 'VleisAI™ unlimited', 'Priority support', 'Analytics dashboard', 'BulkSMS order alerts', 'Stockvel management'],
  },
  {
    id: 'platinum_annual',
    name: 'VleisKraft™ Platinum Jaarliks',
    amount: 4990,
    billingCycle: 'annual',
    features: ['All Platinum Monthly features', '2 maande gratis', 'Dedicated onboarding', 'Custom domain'],
  },
];

function generateSignature(params: Record<string, string>): string {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, '+')}`)
    .join('&');
  const withPass = PAYFAST_PASSPHRASE ? `${str}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}` : str;
  return crypto.createHash('md5').update(withPass).digest('hex');
}

export function buildPaymentUrl(
  planId: string,
  butcheryId: string,
  butcheryName: string,
  returnUrl: string,
  cancelUrl: string,
  notifyUrl: string,
): string {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error('Invalid plan');

  const params: Record<string, string> = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: butcheryName,
    m_payment_id: `${butcheryId}_${planId}_${Date.now()}`,
    amount: plan.amount.toFixed(2),
    item_name: plan.name,
    subscription_type: '1',
    billing_date: new Date().toISOString().split('T')[0],
    recurring_amount: plan.amount.toFixed(2),
    frequency: plan.billingCycle === 'monthly' ? '3' : '6',
    cycles: '0', // indefinite
  };

  params.signature = generateSignature(params);
  const query = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `${PAYFAST_URL}?${query}`;
}

export function validateWebhookSignature(params: Record<string, string>): boolean {
  const { signature, ...rest } = params;
  const expected = generateSignature(rest);
  return expected === signature;
}

export type SubscriptionTier = 'free' | 'platinum';

export function getPlatinumFeatures(): string[] {
  return PLANS[0].features;
}
