
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

interface Stats { todayOrders: number; todayRevenue: number; pendingOrders: number; totalCustomers: number; }

const ADMIN_MENU = (lang: 'af'|'en') => [
  { label: t('manageOrders', lang), icon: 'receipt-outline' as const, route: '/admin/orders', color: Colors.primary },
  { label: t('manageProducts', lang), icon: 'storefront-outline' as const, route: '/admin/products', color: Colors.secondary },
  { label: t('manageCustomers', lang), icon: 'people-outline' as const, route: '/admin/customers', color: Colors.successBright },
  { label: t('featureFlags', lang), icon: 'toggle-outline' as const, route: '/admin/features', color: Colors.warning },
  { label: t('woocommerce', lang), icon: 'cart-outline' as const, route: '/admin/woocommerce', color: '#7F54B3' },
  { label: t('posImport', lang), icon: 'cloud-upload-outline' as const, route: '/admin/pos-import', color: Colors.secondary },
  { label: t('margins', lang), icon: 'trending-up-outline' as const, route: '/admin/margins', color: Colors.successBright },
  { label: t('shelfLife', lang), icon: 'time-outline' as const, route: '/admin/shelf-life', color: Colors.warning },
  { label: t('sentiment', lang), icon: 'heart-outline' as const, route: '/admin/sentiment', color: Colors.primary },
  { label: 'Spitbraai', icon: 'bonfire-outline' as const, route: '/admin/spitbraai', color: Colors.secondary },
  { label: t('platinumButchery', lang), icon: 'diamond-outline' as const, route: '/admin/branding', color: '#FFD700' },
];

export default function AdminDashboard() {
  const { language } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ {t('adminDashboard', language)}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonBox key={i} height={80} style={styles.statCard} />)
        ) : (
          <>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNum}>{stats?.todayOrders ?? 0}</Text>
              <Text style={styles.statLabel}>{t('todayOrders', language)}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNum}>R{(stats?.todayRevenue ?? 0).toFixed(0)}</Text>
              <Text style={styles.statLabel}>{t('todayRevenue', language)}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNum, { color: Colors.warning }]}>{stats?.pendingOrders ?? 0}</Text>
              <Text style={styles.statLabel}>{t('pending', language)}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNum}>{stats?.totalCustomers ?? 0}</Text>
              <Text style={styles.statLabel}>{t('totalCustomers', language)}</Text>
            </GlassCard>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menuGrid}>
        {ADMIN_MENU(language).map(item => (
          <TouchableOpacity key={item.route} style={styles.menuCard} onPress={() => router.push(item.route as any)}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuLabel} numberOfLines={2}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '47%', padding: Spacing.md, alignItems: 'center' },
  statNum: { color: Colors.secondary, fontSize: 26, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  menuCard: { width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  menuIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  menuLabel: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
