import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';

export default function PredictionsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/predictions').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color="#c0392b" size="large" /></View>;

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📈 Price Predictions</Text>
      {data?.predictions?.map((p: any, i: number) => (
        <View key={i} style={s.card}>
          <Text style={s.cut}>{p.cut}</Text>
          <View style={s.row}>
            <Text style={s.label}>Current</Text><Text style={s.val}>R{p.current_price?.toFixed(2)}/kg</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>7-day forecast</Text>
            <Text style={[s.val, { color: p.trend === 'up' ? '#e74c3c' : '#2ecc71' }]}>
              {p.trend === 'up' ? '↑' : '↓'} R{p.predicted_price?.toFixed(2)}/kg
            </Text>
          </View>
          <Text style={s.confidence}>Confidence: {p.confidence}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  center: { flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  cut: { color: '#c0392b', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  label: { color: '#888', fontSize: 13 },
  val: { color: '#fff', fontSize: 13, fontWeight: '600' },
  confidence: { color: '#555', fontSize: 11, marginTop: 6 },
});
