import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

interface Stats {
  orders: number;
  revenue: number;
  customers: number;
  products: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ orders: 0, revenue: 0, customers: 0, products: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${global.authToken}` },
      });
      if (res.ok) setStats(await res.json());
    } catch (_) { console.error("[VleisKraft]", _); }
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchStats(); setRefreshing(false); };

  const tiles = [
    { label: 'Orders Today', value: stats.orders, icon: 'receipt-outline', color: Colors.primary },
    { label: 'Revenue', value: `R${stats.revenue.toLocaleString()}`, icon: 'cash-outline', color: Colors.success },
    { label: 'Customers', value: stats.customers, icon: 'people-outline', color: Colors.secondary },
    { label: 'Products', value: stats.products, icon: 'cube-outline', color: Colors.warning },
  ];

  const navItems = [
    { label: 'Orders', icon: 'list-outline', route: '/admin/orders' },
    { label: 'WooCommerce', icon: 'storefront-outline', route: '/admin/woocommerce' },
    { label: 'Branding', icon: 'color-palette-outline', route: '/admin/branding' },
  ];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      <View style={s.header}>
        <Text style={s.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={s.grid}>
        {tiles.map((t) => (
          <View key={t.label} style={s.tile}>
            <Ionicons name={t.icon as any} size={28} color={t.color} />
            <Text style={[s.tileValue, { color: t.color }]}>{t.value}</Text>
            <Text style={s.tileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.nav}>
        {navItems.map((n) => (
          <TouchableOpacity key={n.label} style={s.navItem} onPress={() => router.push(n.route as any)}>
            <Ionicons name={n.icon as any} size={20} color={Colors.primary} />
            <Text style={s.navLabel}>{n.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: Spacing.sm },
  tile: { width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  tileValue: { fontSize: FontSize.xl, fontWeight: '700' },
  tileLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  nav: { margin: Spacing.md, gap: Spacing.sm },
  navItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  navLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
});
