import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ButcherTier, BUTCHER_TIERS, BUTCHER_TIER_RANK } from '../constants/tiers';

interface ButcherTierGateProps {
  requiredTier: ButcherTier;
  currentTier: ButcherTier;
  feature_af?: string;
  feature_en?: string;
  lang?: 'af' | 'en';
  children: React.ReactNode;
}

export default function ButcherTierGate({
  requiredTier, currentTier, feature_af, feature_en, lang = 'af', children,
}: ButcherTierGateProps) {
  const router = useRouter();
  const hasAccess = BUTCHER_TIER_RANK[currentTier] >= BUTCHER_TIER_RANK[requiredTier];
  if (hasAccess) return <>{children}</>;

  const required = BUTCHER_TIERS[requiredTier];
  const featureName = lang === 'af' ? (feature_af || 'Hierdie funksie') : (feature_en || 'This feature');
  const planName = lang === 'af' ? required.name_af : required.name_en;
  const price = lang === 'af' ? required.price_display_af : required.price_display_en;

  return (
    <View style={s.container}>
      <Ionicons name="lock-closed" size={36} color="#C9A84C" />
      <Text style={s.title}>{featureName}</Text>
      <Text style={s.sub}>
        {lang === 'af'
          ? `Opgradeer na ${planName} om toegang te kry`
          : `Upgrade to ${planName} to unlock`}
      </Text>
      <TouchableOpacity style={s.btn} onPress={() => router.push('/paywall/butcher-plans')}>
        <Text style={s.btnText}>
          {lang === 'af' ? `Opgradeer — ${price}` : `Upgrade — ${price}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: '#0A0A0A',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#FFF', marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: 24, backgroundColor: '#C9A84C', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  btnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
