import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';

const PLANS = [
  { id: 'silver', name: 'VleisKas™ Silver', price: 'R49/month', features: ['AI Braai Brain', 'Cutting charts', 'Basic recipes', 'Community access'] },
  { id: 'gold', name: 'VleisKas™ Gold', price: 'R99/month', features: ['Everything in Silver', 'VleisAI™ Identify', 'Voice ordering', 'Demand intelligence', 'Priority support'] },
  { id: 'platinum', name: 'VleisKas™ Platinum', price: 'R199/month', features: ['Everything in Gold', 'VleisToFork™ traceability', 'B2B tools', 'White-label branding', 'Dedicated account manager'] },
];

export default function NewSubscriptionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!selected) { Alert.alert('Select a plan first'); return; }
    setLoading(true);
    try {
      const res = await api.post('/payments/subscription', { plan: selected });
      if (res.data.payment_url) {
        await Linking.openURL(res.data.payment_url);
        router.replace('/subscriptions');
      }
    } catch {
      Alert.alert('Error', 'Could not initiate subscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer title="Choose a Plan">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Unlock the full VleisKraft™ experience</Text>
        {PLANS.map(plan => (
          <TouchableOpacity key={plan.id} onPress={() => setSelected(plan.id)} activeOpacity={0.85}>
            <GlassCard style={[styles.planCard, selected === plan.id && styles.planSelected]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              {plan.features.map((f, i) => (
                <Text key={i} style={styles.feature}>✓  {f}</Text>
              ))}
              {selected === plan.id && <View style={styles.selectedBadge}><Text style={styles.selectedText}>Selected</Text></View>}
            </GlassCard>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.subscribeBtn, (!selected || loading) && styles.subscribeBtnDisabled]}
          onPress={subscribe}
          disabled={!selected || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeBtnText}>Subscribe via PayFast</Text>}
        </TouchableOpacity>
        <Text style={styles.legal}>Secure payment via PayFast. Cancel anytime.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  planCard: { padding: 16, position: 'relative' },
  planSelected: { borderWidth: 2, borderColor: colors.primary },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planName: { fontSize: 16, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 15, fontWeight: '700', color: colors.primary },
  feature: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  selectedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  selectedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  subscribeBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  subscribeBtnDisabled: { opacity: 0.5 },
  subscribeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  legal: { textAlign: 'center', fontSize: 11, color: colors.textSecondary, marginTop: 4 },
});
