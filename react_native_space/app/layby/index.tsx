import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';

export default function LaybyScreen() {
  const [laybys, setLaybys] = useState<any[]>([]);

  useEffect(() => {
    api.get('/layby').then(r => setLaybys(r.data.laybys || [])).catch(() => {});
  }, []);

  const pay = async (id: string) => {
    try { await api.post(`/layby/${id}/pay`); Alert.alert('✅', 'Payment made!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>💳 Lay-By</Text>
      <Text style={s.sub}>Pay over time for bulk meat orders</Text>
      {laybys.length === 0 && <Text style={s.empty}>No active lay-bys</Text>}
      {laybys.map(l => (
        <View key={l.id} style={s.card}>
          <Text style={s.name}>{l.item_name}</Text>
          <View style={s.progressBar}>
            <View style={[s.progress, { width: `${(l.paid / l.total) * 100}%` as any }]} />
          </View>
          <Text style={s.meta}>R{l.paid?.toFixed(2)} / R{l.total?.toFixed(2)} paid</Text>
          <TouchableOpacity style={s.btn} onPress={() => pay(l.id)}>
            <Text style={s.btnText}>Make Payment (R{l.installment?.toFixed(2)})</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4, marginTop: 48 },
  sub: { color: '#888', fontSize: 13, marginBottom: 20 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { color: '#fff', fontWeight: '700', marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: '#333', borderRadius: 3, marginBottom: 6 },
  progress: { height: 6, backgroundColor: '#c0392b', borderRadius: 3 },
  meta: { color: '#888', fontSize: 12, marginBottom: 10 },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
