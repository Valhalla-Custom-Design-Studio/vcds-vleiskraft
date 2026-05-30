import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUTCHER_TIERS } from '../../src/constants/tiers';

const GOLD = '#C9A84C';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.onrender.com';

type Lang = 'en' | 'af';
type PlanId = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

const L = {
  en: {
    title: 'Butchery Plans',
    sub: 'Choose the plan that fits your business',
    popular: 'Most Popular',
    selectPlan: 'Select Plan',
    currentPlan: '✓ Current Plan',
    langSwitch: 'AF',
    successTitle: 'Plan Selected',
    successMsg: 'Your plan has been updated.',
  },
  af: {
    title: 'Slagtery Planne',
    sub: 'Kies die plan wat by jou besigheid pas',
    popular: 'Gewildste',
    selectPlan: 'Kies Plan',
    currentPlan: '✓ Huidige Plan',
    langSwitch: 'EN',
    successTitle: 'Plan Gekies',
    successMsg: 'Jou plan is opgedateer.',
  },
} as const;

const PLANS: PlanId[] = ['free', 'starter', 'pro', 'business', 'enterprise'];

export default function ButcherPlansScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [loading, setLoading] = useState<PlanId | null>(null);
  const l = L[lang];

  async function handleSelect(planId: PlanId) {
    if (planId === currentPlan) return;
    if (planId === 'free') {
      await AsyncStorage.setItem('plan', 'free');
      setCurrentPlan('free');
      return;
    }
    setLoading(planId);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/subscriptions/butcher-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Subscription failed');
      if (data.paymentUrl) {
        router.push({ pathname: '/payments/index', params: { url: data.paymentUrl } });
      } else {
        await AsyncStorage.setItem('plan', planId);
        setCurrentPlan(planId);
        Alert.alert(l.successTitle, l.successMsg);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={TEXT} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{l.title}</Text>
        <TouchableOpacity onPress={() => setLang(p => p === 'en' ? 'af' : 'en')} style={s.langBtn}>
          <Text style={s.langText}>{l.langSwitch}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.sub}>{l.sub}</Text>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {PLANS.map((planId) => {
          const plan = BUTCHER_TIERS[planId];
          const isActive = currentPlan === planId;
          const isLoading = loading === planId;
          const features = lang === 'en' ? plan.features_en : plan.features_af;
          const priceName = lang === 'en' ? plan.name_en : plan.name_af;
          const priceDisplay = lang === 'en' ? plan.price_display_en : plan.price_display_af;
          const isPopular = 'popular' in plan && (plan as any).popular;

          return (
            <View key={planId} style={[s.card, isActive && { borderColor: plan.color, borderWidth: 2 }]}>
              {isPopular && (
                <View style={[s.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={s.popularText}>{l.popular}</Text>
                </View>
              )}
              <View style={s.cardHeader}>
                <View style={[s.colorDot, { backgroundColor: plan.color }]} />
                <Text style={s.planName}>{priceName}</Text>
                <Text style={[s.planPrice, { color: plan.color }]}>{priceDisplay}</Text>
              </View>
              <View style={s.featureList}>
                {(features as readonly string[]).map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[s.selectBtn, { borderColor: plan.color }, isActive && { backgroundColor: plan.color }]}
                onPress={() => handleSelect(planId)}
                disabled={isActive || isLoading}
                activeOpacity={0.8}
              >
                {isLoading
                  ? <ActivityIndicator color={isActive ? BG : plan.color} size="small" />
                  : <Text style={[s.selectBtnText, { color: isActive ? BG : plan.color }]}>
                      {isActive ? l.currentPlan : l.selectPlan}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 17, fontWeight: '700' },
  langBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  langText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  sub: { color: MUTED, fontSize: 14, textAlign: 'center', marginBottom: 16, paddingHorizontal: 24 },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: SURFACE, borderRadius: 16, borderWidth: 1,
    borderColor: BORDER, padding: 18, marginBottom: 14, overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute', top: 0, right: 0,
    paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 12,
  },
  popularText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  planName: { color: TEXT, fontSize: 17, fontWeight: '800', flex: 1 },
  planPrice: { fontSize: 16, fontWeight: '800' },
  featureList: { gap: 8, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: '#ccc', fontSize: 13, flex: 1 },
  selectBtn: {
    borderWidth: 1.5, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  selectBtnText: { fontSize: 14, fontWeight: '700' },
});
