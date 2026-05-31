import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export type ButcherPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
export type UserType = 'consumer' | 'butcher';

const PLAN_RANK: Record<ButcherPlan, number> = {
  free: 0, starter: 1, pro: 2, business: 3, enterprise: 4,
};

// Which minimum plan is required per feature
export const FEATURE_GATES: Record<string, ButcherPlan> = {
  // Butcher features
  unlimited_products: 'pro',
  campaigns: 'pro',
  stockvel: 'pro',
  vleis_ai: 'pro',
  bulk_orders: 'business',
  multi_branch: 'business',
  volume_pricing: 'business',
  invoicing: 'business',
  delivery_scheduler: 'business',
  api_access: 'enterprise',
  white_label: 'enterprise',
  custom_reporting: 'enterprise',
  // Starter+
  order_management: 'starter',
  whatsapp_alerts: 'starter',
  analytics: 'starter',
  loyalty_tracking: 'starter',
};

export function usePlan() {
  const [plan, setPlan] = useState<ButcherPlan | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await AsyncStorage.getItem('plan') as ButcherPlan | null;
      const ut = await AsyncStorage.getItem('userType') as UserType | null;
      setPlan(p || 'free');
      setUserType(ut);
      setLoading(false);
    }
    load();
  }, []);

  function canAccess(feature: string): boolean {
    if (!plan) return false;
    const required = FEATURE_GATES[feature];
    if (!required) return true; // no gate = free
    return PLAN_RANK[plan] >= PLAN_RANK[required];
  }

  function requirePlan(feature: string, lang: 'en' | 'af' = 'af'): boolean {
    if (canAccess(feature)) return true;
    const required = FEATURE_GATES[feature];
    const planNames: Record<ButcherPlan, string> = {
      free: lang === 'af' ? 'Gratis' : 'Free',
      starter: 'Starter',
      pro: 'Pro',
      business: lang === 'af' ? 'Besigheid' : 'Business',
      enterprise: lang === 'af' ? 'Onderneming' : 'Enterprise',
    };
    Alert.alert(
      'VleisKraft™',
      lang === 'af'
        ? `Hierdie funksie vereis die ${planNames[required]}-pakket of hoër. Gradeer op om toegang te kry.`
        : `This feature requires the ${planNames[required]} plan or higher. Upgrade to access.`,
      [
        { text: lang === 'af' ? 'Later' : 'Later', style: 'cancel' },
        { text: lang === 'af' ? 'Gradeer Op' : 'Upgrade', onPress: () => router.push('/paywall/butcher-plans') },
      ]
    );
    return false;
  }

  return { plan, userType, loading, canAccess, requirePlan };
}
