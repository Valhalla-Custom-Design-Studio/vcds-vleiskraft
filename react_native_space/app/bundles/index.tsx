import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from '../../src/services/api';
import { t } from '../../src/i18n';

export default function BundlesScreen() {
  const [bundles, setBundles] = useState<any[]>([]);

  useEffect(() => {
    api.get('/bundles').then(r => setBundles(r.data.bundles || [])).catch(() => {});
  }, []);

  const addToCart = async (id: string) => {
    try { await api.post('/cart', { bundle_id: id, quantity: 1 }); Alert.alert('✅', 'Bundle added to cart!'); }
    catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📦 Meat Bundles</Text>
      {bundles.map(b => (
        <View key={b.id} style={s.card}>
          <Text style={s.name}>{b.name}</Text>
          <Text style={s.desc}>{b.description}</Text>
          <View style={s.row}>
            <Text style={s.price}>R{b.price?.toFixed(2)}</Text>
            <Text style={s.saving}>Save R{b.saving?.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={s.btn} onPress={() => addToCart(b.id)}>
            <Text style={s.btnText}>{t('add_to_cart')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 48 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  desc: { color: '#888', fontSize: 13, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  price: { color: '#c0392b', fontSize: 20, fontWeight: '800' },
  saving: { color: '#2ecc71', fontSize: 14, fontWeight: '600', alignSelf: 'center' },
  btn: { backgroundColor: '#c0392b', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
