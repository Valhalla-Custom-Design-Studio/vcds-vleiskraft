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

const PLANS = [
  {
    id: 'free',
    color: '#555555',
    priceEn: 'R0/mo', priceAf: 'R0/mo',
    nameEn: 'Freemium', nameAf: 'Gratis',
    featuresEn: ['List up to 10 products', 'Basic storefront', 'Customer enquiries', 'VleisKraft™ listing'],
    featuresAf: ['Lys tot 10 produkte', 'Basiese winkelfront', 'Kliënte-navrae', 'VleisKraft™ notering'],
  },
  {
    id: 'starter',
    color: '#C0392B',
    priceEn: 'R3,500/mo', priceAf: 'R3 500/mo',
    nameEn: 'Starter', nameAf: 'Beginners',
    featuresEn: ['Up to 50 products', 'Order management', 'WhatsApp order alerts', 'Basic analytics dashboard', 'Customer loyalty tracking'],
    featuresAf: ['Tot 50 produkte', 'Bestellingbestuur', 'WhatsApp-bestellingkennisgewings', 'Basiese analitiek-dashboard', 'Kliëntelojaliteitsopsporing'],
  },
  {
    id: 'pro',
    color: '#8B0000',
    popular: true,
    priceEn: 'R7,500/mo', priceAf: 'R7 500/mo',
    nameEn: 'Pro', nameAf: 'Pro',
    featuresEn: ['Unlimited products', 'VleisAI™ demand forecasting', 'Campaign & promotions manager', 'Stockvel group management', 'Advanced analytics', 'Priority listing placement'],
    featuresAf: ['Onbeperkte produkte', 'VleisAI™ vraagvoorspelling', 'Veldtog- en promosiebestuurder', 'Stockvel-groepbestuur', 'Gevorderde analitiek', 'Prioriteit noteringsplasing'],
  },
  {
    id: 'business',
    color: '#1a3a5c',
    priceEn: 'R10,000/mo', priceAf: 'R10 000/mo',
    nameEn: 'Business', nameAf: 'Besigheid',
    featuresEn: ['Multi-branch management', 'B2B bulk order portal', 'Volume pricing tiers', 'Automated invoicing', 'Delivery scheduler', 'Dedicated account manager'],
    featuresAf: ['Multi-tak bestuur', 'B2B grootmaat bestellingsportaal', 'Volumeprysvlakke', 'Outomatiese fakturering', 'Afleweringskedule', 'Toegewyde rekeningbestuurder'],
  },
  {
    id: 'enterprise',
    color: GOLD,
    priceEn: 'R15,000/mo', priceAf: 'R15 000/mo',
    nameEn: 'Enterprise', nameAf: 'Onderneming',
    featuresEn: ['Everything in Business', 'Custom API integrations', 'White-label options', 'Dedicated support line', 'Custom reporting', 'SLA guarantee', 'Early access to new features'],
    featuresAf: ['Alles in Besigheid', 'Pasgemaakte API-integrasies', 'Wit-etiket opsies', 'Toegewyde ondersteuningslyn', 'Pasgemaakte verslagdoening', 'SLA-waarborg', 'Vroeë toegang tot nuwe funksies'],
  },
];

type Lang = 'en' | 'af';

export default function ButcherSubscriptionScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [loading, setLoading] = useState<string | null>(null);
  const l = lang;

  async function handleSubscribe(plan: typeof PLANS[0]) {
    if (plan.id === 'free') {
      router.replace('/(tabs)');
      return;
    }
    setLoading(plan.id);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/payments/butcher-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const data = await res.json();
      if (data.payment_url) {
        router.push({ pathname: '/payments/index', params: { url: data.payment_url } });
      } else {
        Alert.alert('VleisKraft™', data.message || (l === 'af' ? 'Probeer weer.' : 'Please try again.'));
      }
    } catch {
      Alert.alert('VleisKraft™', l === 'af' ? 'Kon nie koppel nie.' : 'Could not connect.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.langRow}>
            {(['af', 'en'] as Lang[]).map((lg) => (
              <TouchableOpacity key={lg} onPress={() => setLang(lg)} style={[s.langBtn, lang === lg && s.langBtnActive]}>
                <Text style={[s.langBtnText, lang === lg && { color: GOLD }]}>{lg.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.title}>{l === 'af' ? 'Kies Jou Slagtery-Pakket' : 'Choose Your Butchery Plan'}</Text>
          <Text style={s.sub}>{l === 'af' ? 'Groei jou slagtery op VleisKraft™' : 'Grow your butchery on VleisKraft™'}</Text>
        </View>

        {/* Plans */}
        {PLANS.map((plan) => {
          const name = l === 'af' ? plan.nameAf : plan.nameEn;
          const price = l === 'af' ? plan.priceAf : plan.priceEn;
          const features = l === 'af' ? plan.featuresAf : plan.featuresEn;
          const isFree = plan.id === 'free';

          return (
            <View key={plan.id} style={s.planWrap}>
              {plan.popular && (
                <LinearGradient colors={[plan.color, '#C0392B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.popularBanner}>
                  <Ionicons name="star" size={13} color="#fff" />
                  <Text style={s.popularText}>{l === 'af' ? 'GEWILDSTE KEUSE' : 'MOST POPULAR'}</Text>
                </LinearGradient>
              )}
              <LinearGradient
                colors={[`${plan.color}18`, `${plan.color}06`]}
                style={[s.planCard, { borderColor: plan.color + '55' }, plan.popular && s.planCardPopular]}
              >
                <View style={s.planHeader}>
                  <View>
                    <Text style={[s.planName, { color: plan.color === GOLD ? GOLD : TEXT }]}>{name}</Text>
                    <Text style={[s.planPrice, { color: isFree ? MUTED : TEXT }]}>{price}</Text>
                  </View>
                  {!isFree && (
                    <View style={[s.planBadge, { backgroundColor: plan.color + '22', borderColor: plan.color + '55' }]}>
                      <Text style={[s.planBadgeText, { color: plan.color === GOLD ? GOLD : plan.color }]}>
                        {l === 'af' ? 'Betaald' : 'Paid'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={s.featureList}>
                  {features.map((f, i) => (
                    <View key={i} style={s.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color={isFree ? MUTED : plan.color} />
                      <Text style={s.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  style={s.planBtn}
                >
                  <LinearGradient
                    colors={isFree ? ['#333', '#222'] : [plan.color, plan.color + 'AA']}
                    style={s.planBtnGrad}
                  >
                    {loading === plan.id
                      ? <ActivityIndicator color={isFree ? MUTED : '#fff'} />
                      : <Text style={[s.planBtnText, isFree && { color: MUTED }]}>
                          {isFree
                            ? (l === 'af' ? 'Begin Gratis' : 'Start Free')
                            : (l === 'af' ? 'Kies Hierdie Pakket' : 'Choose This Plan')
                          }
                        </Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          );
        })}

        <Text style={s.footer}>
          {l === 'af'
            ? 'Alle pakkette sluit PayFast-betalings in. Kanselleer enige tyd.'
            : 'All plans include PayFast payments. Cancel anytime.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingBottom: 8 },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  langBtnActive: { borderColor: GOLD, backgroundColor: 'rgba(201,168,76,0.12)' },
  langBtnText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '900', color: TEXT, marginBottom: 6 },
  sub: { fontSize: 14, color: MUTED },
  planWrap: { marginHorizontal: 16, marginBottom: 16 },
  popularBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  popularText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  planCard: { borderWidth: 1, borderRadius: 16, padding: 20, overflow: 'hidden' },
  planCardPopular: { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  planPrice: { fontSize: 26, fontWeight: '900' },
  planBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  planBadgeText: { fontSize: 11, fontWeight: '700' },
  featureList: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontSize: 14, color: TEXT, lineHeight: 19 },
  planBtn: { borderRadius: 12, overflow: 'hidden' },
  planBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  planBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  footer: { textAlign: 'center', color: MUTED, fontSize: 12, paddingHorizontal: 24, paddingTop: 8 },
});
