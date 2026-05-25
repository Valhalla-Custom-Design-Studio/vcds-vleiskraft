import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';
import { t } from '../../src/i18n';

export default function ReorderScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/orders/reorder-suggestions').then(r => setItems(r.data.items || [])).catch(() => {});
  }, []);

  const reorder = async (id: string) => {
    try { await api.post('/orders/reorder', { item_id: id }); Alert.alert('✅', 'Reorder placed!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🔄 Smart Reorder</Text>
      <Text style={s.sub}>AI-suggested based on your purchase history</Text>
      {items.map(item => (
        <View key={item.id} style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.meta}>Last ordered: {item.last_ordered} • {item.frequency}</Text>
          </View>
          <TouchableOpacity style={s.btn} onPress={() => reorder(item.id)}>
            <Text style={s.btnText}>Reorder</Text>
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
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  name: { color: '#fff', fontWeight: '600' },
  meta: { color: '#888', fontSize: 12, marginTop: 2 },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
