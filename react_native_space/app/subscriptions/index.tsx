import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { api } from '../../src/services/api';

const PLANS = [
  { tier: 'free', name: 'Free', price: 0, features: ['Browse catalogue', 'Basic orders', '1 trace/month'] },
  { tier: 'pro', name: 'Pro', price: 199, features: ['Unlimited orders', 'VleisGPT', 'Price predictions', 'Meal planner', 'Stockvel'] },
  { tier: 'platinum', name: 'Platinum', price: 499, features: ['Everything in Pro', 'Admin branding', 'WooCommerce sync', 'IoT cold chain', 'Priority support'] },
];

export default function SubscriptionsScreen() {
  const [current, setCurrent] = useState('free');

  useEffect(() => {
    api.get('/subscriptions/current').then(r => setCurrent(r.data.tier || 'free')).catch(() => {});
  }, []);

  const upgrade = async (tier: string) => {
    try {
      const r = await api.post('/payments/subscribe', { tier });
      if (r.data.payment_url) Linking.openURL(r.data.payment_url);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>💎 Subscription Plans</Text>
      {PLANS.map(plan => (
        <View key={plan.tier} style={[s.card, current === plan.tier && s.active]}>
          {current === plan.tier && <Text style={s.badge}>CURRENT PLAN</Text>}
          <Text style={s.planName}>{plan.name}</Text>
          <Text style={s.price}>{plan.price === 0 ? 'Free' : `R${plan.price}/month`}</Text>
          {plan.features.map(f => <Text key={f} style={s.feature}>✓ {f}</Text>)}
          {current !== plan.tier && plan.price > 0 && (
            <TouchableOpacity style={s.btn} onPress={() => upgrade(plan.tier)}>
              <Text style={s.btnText}>Upgrade to {plan.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  active: { borderColor: '#c0392b' },
  badge: { color: '#c0392b', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  planName: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  price: { color: '#c0392b', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  feature: { color: '#888', fontSize: 13, marginBottom: 3 },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
});
