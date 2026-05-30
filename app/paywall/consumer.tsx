import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOLD = '#C9A84C';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.onrender.com';

const L = {
  en: {
    badge: 'PREMIUM ACCESS',
    title: 'Unlock VleisKraft™',
    sub: "SA's #1 premium meat marketplace — buy directly from verified local butcheries",
    price: 'R99',
    period: '/month',
    trial: '7-day free trial • Cancel anytime',
    features: [
      { icon: 'storefront', text: 'Access all verified butcheries & products' },
      { icon: 'receipt', text: 'Full order history & tracking' },
      { icon: 'pricetag', text: 'Exclusive deals & braai bundles' },
      { icon: 'chatbubble-ellipses', text: 'VleisAI™ recipe & cut suggestions' },
      { icon: 'flash', text: 'Priority delivery slots' },
      { icon: 'shield-checkmark', text: 'Verified quality guarantee' },
    ],
    cta: 'Start Free Trial',
    ctaSub: 'Then R99/month. Cancel anytime.',
    login: 'Already subscribed? Log in',
    langSwitch: 'AF',
  },
  af: {
    badge: 'PREMIUM TOEGANG',
    title: 'Ontsluit VleisKraft™',
    sub: "SA se #1 premium vleis handelsmerk — koop direk van geverifieerde plaaslike slagteries",
    price: 'R99',
    period: '/maand',
    trial: '7-dae gratis proeftydperk • Kanselleer enige tyd',
    features: [
      { icon: 'storefront', text: 'Toegang tot alle geverifieerde slagteries en produkte' },
      { icon: 'receipt', text: 'Volledige bestellinggeskiedenis en opsporing' },
      { icon: 'pricetag', text: 'Eksklusiewe aanbiedings en braai-bundels' },
      { icon: 'chatbubble-ellipses', text: 'VleisAI™ resep- en snytvoorstelle' },
      { icon: 'flash', text: 'Prioriteit afleweringsgleuwe' },
      { icon: 'shield-checkmark', text: 'Geverifieerde kwaliteitsgaransie' },
    ],
    cta: 'Begin Gratis Proeftydperk',
    ctaSub: 'Dan R99/maand. Kanselleer enige tyd.',
    login: 'Reeds ingeteken? Teken in',
    langSwitch: 'EN',
  },
} as const;

type Lang = 'en' | 'af';

export default function ConsumerPaywallScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [loading, setLoading] = useState(false);
  const l = L[lang];

  async function handleSubscribe() {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/payments/consumer-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: 'consumer_premium', amount: 9900 }),
      });
      const data = await res.json();
      if (data.payment_url) {
        router.push({ pathname: '/payments/index', params: { url: data.payment_url } });
      } else {
        Alert.alert('VleisKraft™', data.message || 'Could not initiate payment');
      }
    } catch {
      Alert.alert('VleisKraft™', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Lang toggle */}
      <View style={s.langRow}>
        <TouchableOpacity onPress={() => setLang(lang === 'en' ? 'af' : 'en')} style={s.langBtn}>
          <Text style={s.langBtnText}>{l.langSwitch}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#1a0a00', '#0A0A0A']} style={s.hero}>
          <LinearGradient colors={[GOLD, '#8B0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.badge}>
            <Ionicons name="diamond" size={12} color="#000" />
            <Text style={s.badgeText}>{l.badge}</Text>
          </LinearGradient>
          <Text style={s.heroTitle}>{l.title}</Text>
          <Text style={s.heroSub}>{l.sub}</Text>

          <View style={s.priceWrap}>
            <Text style={s.price}>{l.price}</Text>
            <Text style={s.period}>{l.period}</Text>
          </View>
          <Text style={s.trial}>{l.trial}</Text>
        </LinearGradient>

        {/* Features */}
        <View style={s.featuresWrap}>
          {l.features.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureIconWrap}>
                <Ionicons name={f.icon as any} size={18} color={GOLD} />
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity onPress={handleSubscribe} disabled={loading} style={s.ctaBtn}>
            <LinearGradient colors={[GOLD, '#A07830']} style={s.ctaBtnGrad}>
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={s.ctaBtnText}>{l.cta}</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.ctaSubText}>{l.ctaSub}</Text>

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={s.loginLink}>
            <Text style={s.loginLinkText}>{l.login}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  langBtnText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  scroll: { paddingBottom: 40 },
  hero: { padding: 28, alignItems: 'center', paddingTop: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#000', letterSpacing: 1 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: TEXT, textAlign: 'center', marginBottom: 10 },
  heroSub: { fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  priceWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 8 },
  price: { fontSize: 56, fontWeight: '900', color: GOLD },
  period: { fontSize: 18, color: MUTED, marginBottom: 10 },
  trial: { fontSize: 13, color: MUTED },
  featuresWrap: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  featureIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 15, color: TEXT, lineHeight: 20 },
  ctaWrap: { paddingHorizontal: 24, paddingTop: 24 },
  ctaBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 10 },
  ctaBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
  ctaSubText: { textAlign: 'center', color: MUTED, fontSize: 13, marginBottom: 20 },
  loginLink: { alignItems: 'center', paddingVertical: 12 },
  loginLinkText: { color: GOLD, fontSize: 14, fontWeight: '600' },
});
