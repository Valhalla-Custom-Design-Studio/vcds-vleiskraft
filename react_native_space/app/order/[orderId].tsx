import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

interface OrderItem { id: number; name: string; quantity: number; price: number; }
interface Order { id: number; status: string; total: number; created_at: string; items: OrderItem[]; delivery_address: string; }

export default function OrderDetail() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${global.authToken}` },
    }).then(r => r.ok ? r.json() : null).then(d => setOrder(d)).catch(() => {});
  }, [orderId]);

  const submitRating = async () => {
    if (!rating) { Alert.alert('Rate first', 'Select 1–5 stars'); return; }
    setSubmitting(true);
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.authToken}` },
        body: JSON.stringify({ rating, review }),
      });
      Alert.alert('Thanks!', 'Review submitted.');
    } catch (_) { Alert.alert('Error', 'Could not submit review.'); }
    setSubmitting(false);
  };

  if (!order) return <View style={s.center}><Text style={s.empty}>Loading order...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: Spacing.lg, paddingTop: 60 }}>
      <TouchableOpacity style={s.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        <Text style={s.backText}>Orders</Text>
      </TouchableOpacity>

      <Text style={s.title}>Order #{order.id}</Text>
      <Text style={s.status}>Status: <Text style={{ color: Colors.primary }}>{order.status.toUpperCase()}</Text></Text>
      <Text style={s.meta}>Placed: {new Date(order.created_at).toLocaleDateString('en-ZA')}</Text>
      {order.delivery_address && <Text style={s.meta}>Deliver to: {order.delivery_address}</Text>}

      <Text style={s.section}>Items</Text>
      {order.items?.map((item) => (
        <View key={item.id} style={s.item}>
          <Text style={s.itemName}>{item.quantity}x {item.name}</Text>
          <Text style={s.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      ))}

      <View style={s.total}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalValue}>R{Number(order.total).toFixed(2)}</Text>
      </View>

      {order.status === 'completed' && (
        <View style={s.ratingSection}>
          <Text style={s.section}>Leave a Review</Text>
          <View style={s.stars}>
            {[1,2,3,4,5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={32} color={Colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={[s.input, s.textarea]} value={review} onChangeText={setReview} placeholder="Share your experience..." placeholderTextColor={Colors.textSecondary} multiline numberOfLines={4} textAlignVertical="top" />
          <TouchableOpacity style={s.btn} onPress={submitRating} disabled={submitting}>
            <Text style={s.btnText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  back: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  backText: { color: Colors.textPrimary, fontSize: FontSize.md },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  status: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  meta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  section: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemName: { fontSize: FontSize.md, color: Colors.textPrimary, flex: 1 },
  itemPrice: { fontSize: FontSize.md, color: Colors.secondary },
  total: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.md },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  ratingSection: { marginTop: Spacing.xl },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  input: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md },
  textarea: { height: 100 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  empty: { color: Colors.textSecondary, fontSize: FontSize.md },
});
