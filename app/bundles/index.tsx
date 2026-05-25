
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import api from '@/lib/api';

const OCCASIONS = ['Braai', 'Potjie', 'Dinner', 'Birthday', 'Family'];

export default function BundlesScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [budget, setBudget] = useState('');
  const [people, setPeople] = useState('');
  const [occasion, setOccasion] = useState('Braai');
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!budget || !people) { Alert.alert('Error', 'Enter budget and people count'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/bundles/generate', { budget: Number(budget), people: Number(people), occasion });
      setBundles(data.bundles ?? data);
    } catch { Alert.alert('Error', 'Could not generate bundles'); }
    finally { setLoading(false); }
  };

  const addAll = (bundle: any) => {
    bundle.items?.forEach((item: any) => { if (item.productId) addItem(item.productId, item.quantity ?? 1); });
    Alert.alert('✅', t('addAllToCart', language));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🎁 {t('smartBundle', language)}</Text>
        <Text style={styles.sub}>AI-gegenereerde vleis bundels</Text>
      </View>
      <GlassCard style={styles.form}>
        <TextInput style={styles.input} placeholder={t('budget', language)} placeholderTextColor={Colors.textSecondary} value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder={t('people', language)} placeholderTextColor={Colors.textSecondary} value={people} onChangeText={setPeople} keyboardType="numeric" />
        <Text style={styles.label}>{t('occasion', language)}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {OCCASIONS.map(o => (
            <TouchableOpacity key={o} style={[styles.chip, occasion === o && styles.chipActive]} onPress={() => setOccasion(o)}>
              <Text style={[styles.chipText, occasion === o && styles.chipTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <GradientButton label={loading ? t('loading', language) : '🎁 ' + t('generate', language)} onPress={generate} loading={loading} />
      </GlassCard>
      {bundles.map((bundle, i) => (
        <GlassCard key={i} style={styles.bundleCard}>
          <Text style={styles.bundleName}>{bundle.name ?? `Bundle ${i + 1}`}</Text>
          {bundle.items?.map((item: any, j: number) => (
            <View key={j} style={styles.bundleItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>R{item.price}</Text>
            </View>
          ))}
          <View style={styles.bundleFooter}>
            <Text style={styles.bundleTotal}>Total: R{bundle.total}</Text>
            {bundle.savings && <Text style={styles.savings}>Save R{bundle.savings}</Text>}
          </View>
          <TouchableOpacity style={styles.addAllBtn} onPress={() => addAll(bundle)}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addAllText}>{t('addAllToCart', language)}</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  form: { padding: Spacing.md, marginBottom: Spacing.lg },
  input: { height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15 },
  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.sm },
  chips: { marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.elevated, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  bundleCard: { padding: Spacing.md, marginBottom: Spacing.md },
  bundleName: { color: Colors.secondary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  bundleItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { color: Colors.textPrimary, fontSize: 14 },
  itemPrice: { color: Colors.secondary, fontSize: 14, fontWeight: '600' },
  bundleFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  bundleTotal: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  savings: { color: Colors.successBright, fontSize: 14, fontWeight: '600' },
  addAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.md },
  addAllText: { color: '#fff', fontWeight: '700' },
});
