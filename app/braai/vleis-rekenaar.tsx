import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import api from '@/lib/api';

const OCCASIONS = ['Braai', 'Potjie', 'Aandete', 'Verjaarsdag', 'Kersfees'];

export default function PortionCalcScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [guests, setGuests] = useState('');
  const [occasion, setOccasion] = useState('Braai');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!guests || isNaN(+guests)) { Alert.alert('Fout', 'Voer aantal gaste in'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/braai-brein/portion-calculator', { guestCount: +guests, eventType: occasion, preferences: [] });
      setResult(data);
    } catch { Alert.alert('Error', t('tryAgain', language)); }
    finally { setLoading(false); }
  };

  const addAll = async () => {
    if (!result?.items) return;
    for (const item of result.items) {
      if (item.productId) await addItem(item.productId, item.quantity);
    }
    Alert.alert('✅', t('addAllToCart', language));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🧮 {t('portionCalc', language)}</Text>
      <Text style={styles.sub}>AI bereken die regte hoeveelhede vleis vir jou braai</Text>
      <TextInput style={styles.input} placeholder={t('guests', language)} placeholderTextColor={Colors.textSecondary} keyboardType="numeric" value={guests} onChangeText={setGuests} />
      <Text style={styles.label}>{t('occasion', language)}</Text>
      <View style={styles.chips}>
        {OCCASIONS.map((o) => (
          <GradientButton key={o} onPress={() => setOccasion(o)} label={o} variant={occasion === o ? 'primary' : 'gold'} style={styles.chip} />
        ))}
      </View>
      <GradientButton onPress={calculate} label={loading ? t('analyzing', language) : t('calculate', language)} loading={loading} style={styles.btn} />
      {result && (
        <GlassCard style={styles.result}>
          {result.items?.map((item: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.quantity}kg — R{item.price}</Text>
            </View>
          ))}
          <Text style={styles.total}>Totaal: R{result.total}</Text>
          <GradientButton onPress={addAll} label={t('addAllToCart', language)} style={styles.btn} />
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.lg },
  input: { height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15 },
  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { flex: 0 },
  btn: { marginBottom: Spacing.md },
  result: { gap: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { color: Colors.textPrimary, fontSize: 15 },
  itemQty: { color: Colors.secondary, fontSize: 15, fontWeight: '700' },
  total: { color: Colors.successBright, fontSize: 18, fontWeight: '800', marginTop: Spacing.sm },
});
