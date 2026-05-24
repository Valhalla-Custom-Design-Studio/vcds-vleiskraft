
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import api from '@/lib/api';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function MealPlannerScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [people, setPeople] = useState('');
  const [budget, setBudget] = useState('');
  const [prefs, setPrefs] = useState('');
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!people || !budget) { Alert.alert('Error', 'Enter people and budget'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/meal-planner/generate', { people: Number(people), budget: Number(budget), preferences: prefs });
      setPlan(data.plan ?? data);
    } catch { Alert.alert('Error', 'Could not generate plan'); }
    finally { setLoading(false); }
  };

  const addAll = () => {
    plan.forEach(day => day.ingredients?.forEach((ing: any) => { if (ing.productId) addItem(ing.productId); }));
    Alert.alert('✅', t('addAllToCart', language));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 {t('weeklyMenu', language)}</Text>
        <Text style={styles.sub}>7-dag AI maaltydplan</Text>
      </View>
      <GlassCard style={styles.form}>
        <TextInput style={styles.input} placeholder={t('people', language)} placeholderTextColor={Colors.textSecondary} value={people} onChangeText={setPeople} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder={t('weeklyBudget', language)} placeholderTextColor={Colors.textSecondary} value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder={t('preferences', language)} placeholderTextColor={Colors.textSecondary} value={prefs} onChangeText={setPrefs} />
        <GradientButton label={loading ? t('loading', language) : '📅 ' + t('generate', language)} onPress={generate} loading={loading} />
      </GlassCard>
      {plan.length > 0 && (
        <>
          {plan.map((day, i) => (
            <GlassCard key={i} style={styles.dayCard}>
              <Text style={styles.dayName}>{DAYS[i] ?? `Day ${i+1}`}</Text>
              <Text style={styles.mealName}>{day.meal}</Text>
              {day.ingredients?.map((ing: any, j: number) => (
                <Text key={j} style={styles.ingredient}>• {ing.name} — R{ing.price}</Text>
              ))}
              {day.totalCost && <Text style={styles.dayCost}>R{day.totalCost}</Text>}
            </GlassCard>
          ))}
          <GradientButton label={t('addAllToCart', language)} onPress={addAll} style={{ marginTop: Spacing.md }} />
        </>
      )}
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
  dayCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  dayName: { color: Colors.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  mealName: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  ingredient: { color: Colors.textSecondary, fontSize: 13, marginBottom: 2 },
  dayCost: { color: Colors.successBright, fontSize: 14, fontWeight: '700', marginTop: Spacing.sm },
});
