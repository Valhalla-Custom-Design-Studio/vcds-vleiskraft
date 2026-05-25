import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

interface Order {
  id: number;
  user_name: string;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  processing: Colors.secondary,
  completed: Colors.success,
  cancelled: Colors.error,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${global.authToken}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.authToken}` },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (_) { Alert.alert('Error', 'Failed to update order status'); }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.orderId}>Order #{item.id}</Text>
        <View style={[s.badge, { backgroundColor: STATUS_COLORS[item.status] || Colors.textSecondary }]}>
          <Text style={s.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={s.customer}>{item.user_name}</Text>
      <Text style={s.meta}>{item.items_count} items · R{Number(item.total).toFixed(2)}</Text>
      <Text style={s.date}>{new Date(item.created_at).toLocaleDateString('en-ZA')}</Text>
      <View style={s.actions}>
        {['processing', 'completed', 'cancelled'].map((st) => (
          <TouchableOpacity key={st} style={[s.actionBtn, item.status === st && s.actionBtnActive]} onPress={() => updateStatus(item.id, st)}>
            <Text style={[s.actionText, item.status === st && s.actionTextActive]}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <FlatList
      style={s.container}
      data={orders}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      contentContainerStyle={{ padding: Spacing.md, paddingTop: 60 }}
      ListHeaderComponent={<Text style={s.title}>Order Management</Text>}
      ListEmptyComponent={<Text style={s.empty}>No orders found</Text>}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  orderId: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  badge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: '700' },
  customer: { fontSize: FontSize.sm, color: Colors.textSecondary },
  meta: { fontSize: FontSize.sm, color: Colors.secondary, marginTop: 2 },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  actionBtn: { flex: 1, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xs, alignItems: 'center' },
  actionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  actionTextActive: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xl },
});
