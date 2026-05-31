import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ButcherTier, BUTCHER_TIER_RANK } from '../constants/tiers';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.onrender.com';

interface ButcherTierState {
  tier: ButcherTier;
  isButcher: boolean;
  hasAccess: (requiredTier: ButcherTier) => boolean;
  loading: boolean;
  refresh: () => void;
}

export function useButcherTier(): ButcherTierState {
  const [tier, setTier] = useState<ButcherTier>('free');
  const [isButcher, setIsButcher] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userType = await AsyncStorage.getItem('userType');
      setIsButcher(userType === 'butcher');
      if (!token || userType !== 'butcher') { setLoading(false); return; }

      const res = await fetch(`${API}/api/butcher/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTier((data.tier as ButcherTier) || 'free');
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasAccess = (requiredTier: ButcherTier) =>
    BUTCHER_TIER_RANK[tier] >= BUTCHER_TIER_RANK[requiredTier];

  return { tier, isButcher, hasAccess, loading, refresh: load };
}
