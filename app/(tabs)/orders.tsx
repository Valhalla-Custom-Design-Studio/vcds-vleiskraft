import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { format } from 'date-fns';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: Colors.warning, CONFIRMED: Colors.secondary, PREPARING: Colors.secondary,
  READY: Colors.successBright, COLLECTED: Colors.success, DELIVERED: Colors.success,
  CANCELLED: Colors.error,
};

export default function OrdersScreen() {
  const { language } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(5)].map((_, i) => <SkeletonBox key={i} height={80} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{t('orders', language)}</Text></View>
      {orders.length === 0
        ? <EmptyState icon="receipt-outline" title={t('noOrders', language)} ctaLabel={t('startShopping', language)} onCta={() => router.push('/(tabs)/shop')} />
        : (
          <FlatList
            data={orders} keyExtractor={(i) => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/order/${item.id}`)}>
                <View style={styles.row}>
                  <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '33' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.date}>{format(new Date(item.createdAt), 'dd MMM yyyy')}</Text>
                  <Text style={styles.total}>R{item.totalAmount.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  card: { backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  statusBadge: { borderRadius: Radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  date: { color: Colors.textSecondary, fontSize: 13 },
  total: { color: Colors.secondary, fontSize: 16, fontWeight: '700' },
});
