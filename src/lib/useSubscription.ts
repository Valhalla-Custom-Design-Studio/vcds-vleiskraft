/**
 * Shared Subscription Status Hook
 * Checks if user has pro/platinum across VleisKraft + F&F
 * KAN-3: Cross-app subscription gate
 */
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'pro' | 'platinum';

const CACHE_KEY = 'vcds_subscription_status';
const CACHE_TTL = 300000; // 5 min cache

interface SubStatus {
  tier: SubscriptionTier;
  activeApps: string[];
  expiresAt: string | null;
  cachedAt: number;
}

export function useSubscription(apiBase: string, token: string | null) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);
  const [activeApps, setActiveApps] = useState<string[]>([]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    checkSubscription();
  }, [token]);

  const checkSubscription = async () => {
    try {
      // Check cache first
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: SubStatus = JSON.parse(cached);
        if (Date.now() - parsed.cachedAt < CACHE_TTL) {
          setTier(parsed.tier);
          setActiveApps(parsed.activeApps);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${apiBase}/api/subscriptions/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const status: SubStatus = {
          tier: data.tier || 'free',
          activeApps: data.activeApps || [],
          expiresAt: data.expiresAt,
          cachedAt: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(status));
        setTier(status.tier);
        setActiveApps(status.activeApps);
      }
    } catch (e) {
      console.warn('[Subscription] Check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const isPro = tier === 'pro' || tier === 'platinum';
  const isPlatinum = tier === 'platinum';
  const isFree = tier === 'free';

  return { tier, loading, isPro, isPlatinum, isFree, activeApps, refresh: checkSubscription };
}

export function SubscriptionGate({ 
  require, children, fallback, tier
}: { 
  require: 'pro' | 'platinum'; 
  tier: SubscriptionTier; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const hasAccess = require === 'pro' 
    ? (tier === 'pro' || tier === 'platinum')
    : tier === 'platinum';

  return hasAccess ? <>{children}</> : <>{fallback || null}</>;
}
