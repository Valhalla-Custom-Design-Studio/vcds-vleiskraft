import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';
import { t } from '../../src/i18n';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MEALS = ['Breakfast','Lunch','Dinner'];

export default function MealPlannerScreen() {
  const [plan, setPlan] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api.post('/meal-planner/generate', { days: 7, preferences: ['beef', 'lamb'] });
      setPlan(r.data.plan || {});
    } catch { Alert.alert('Error', 'Could not generate plan'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🍽️ {t('meal_planner')}</Text>
      <TouchableOpacity style={s.btn} onPress={generate} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Generating...' : '✨ AI Generate Week Plan'}</Text>
      </TouchableOpacity>
      {DAYS.map(day => (
        <View key={day} style={s.dayCard}>
          <Text style={s.dayTitle}>{day}</Text>
          {MEALS.map(meal => (
            <View key={meal} style={s.mealRow}>
              <Text style={s.mealLabel}>{meal}</Text>
              <Text style={s.mealVal}>{plan[day]?.[meal] || '—'}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  btn: { backgroundColor: '#c0392b', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '700' },
  dayCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 12 },
  dayTitle: { color: '#c0392b', fontWeight: '700', marginBottom: 8 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  mealLabel: { color: '#888', fontSize: 13 },
  mealVal: { color: '#fff', fontSize: 13 },
});
