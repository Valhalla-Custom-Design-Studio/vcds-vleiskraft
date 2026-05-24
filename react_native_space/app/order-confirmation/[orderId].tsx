import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then(r => setOrder(r.data.order)).catch(() => {});
  }, [orderId]);

  return (
    <ScrollView style={s.container}>
      <View style={s.hero}>
        <Text style={s.check}>✅</Text>
        <Text style={s.title}>Order Confirmed!</Text>
        <Text style={s.orderId}>#{orderId}</Text>
      </View>
      {order && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          {order.items?.map((item: any, i: number) => (
            <View key={i} style={s.row}>
              <Text style={s.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={s.itemPrice}>R{item.total?.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[s.row, s.totalRow]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalVal}>R{order.total?.toFixed(2)}</Text>
          </View>
        </View>
      )}
      <TouchableOpacity style={s.btn} onPress={() => router.push(`/delivery-tracking/${orderId}` as any)}>
        <Text style={s.btnText}>🚚 Track Delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={() => router.replace('/(tabs)')}>
        <Text style={s.btnOutlineText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 40 },
  check: { fontSize: 64 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 12 },
  orderId: { color: '#888', marginTop: 4 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { color: '#c0392b', fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { color: '#fff', fontSize: 14 },
  itemPrice: { color: '#888', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#333', marginTop: 8, paddingTop: 12 },
  totalLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
  totalVal: { color: '#c0392b', fontWeight: '800', fontSize: 16 },
  btn: { backgroundColor: '#c0392b', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnOutlineText: { color: '#888', fontWeight: '600' },
});
