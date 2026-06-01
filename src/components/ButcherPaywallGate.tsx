/**
 * VleisKraft™ ButcherPaywallGate — B2B 5-tier feature gate
 * Tiers: free → starter → pro → business → enterprise
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type ButcherTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

const TIER_RANK: Record<ButcherTier, number> = {
  free: 0, starter: 1, pro: 2, business: 3, enterprise: 4,
};

const TIER_LABEL: Record<ButcherTier, string> = {
  free: 'Freemium', starter: 'Starter', pro: 'Pro', business: 'Business', enterprise: 'Enterprise',
};

interface ButcherPaywallGateProps {
  required: ButcherTier;
  currentTier: ButcherTier;
  featureName?: string;
  children: React.ReactNode;
}

const GOLD = '#C9A84C';

export function ButcherPaywallGate({ required, currentTier, featureName, children }: ButcherPaywallGateProps) {
  const router = useRouter();
  const hasAccess = TIER_RANK[currentTier] >= TIER_RANK[required];
  if (hasAccess) return <>{children}</>;

  const label = TIER_LABEL[required];

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={['rgba(0,0,0,0.88)', 'rgba(0,0,0,0.96)']} style={styles.overlay}>
        <Ionicons name="lock-closed" size={32} color={GOLD} />
        <Text style={styles.title}>{featureName ? `${featureName} \u2014 ` : ''}{label} Funksie</Text>
        <Text style={styles.sub}>Gradeer op na {label} om toegang te kry tot hierdie funksie.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/paywall/butcher-plans' as any)}>
          <Text style={styles.btnText}>Gradeer Op →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', overflow: 'hidden', borderRadius: 16, minHeight: 180 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10, alignItems: 'center', justifyContent: 'center',
    padding: 24, borderRadius: 16, minHeight: 180,
  },
  title: { color: '#C9A84C', fontSize: 18, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  sub: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24, backgroundColor: '#C9A84C' },
  btnText: { color: '#000', fontWeight: '700', fontSize: 14 },
});
