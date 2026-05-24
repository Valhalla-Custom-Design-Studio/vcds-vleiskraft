import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { api } from '../../src/services/api';
import { t } from '../../src/i18n';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, spent: 0, tier: 'free' });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/dashboard');
      setStats(r.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const quickLinks = [
    { label: '🥩 ' + t('shop'), route: '/(tabs)/shop' },
    { label: '📦 ' + t('orders'), route: '/(tabs)/orders' },
    { label: '🤖 VleisGPT', route: '/(tabs)/vleisgpt' },
    { label: '🔍 ' + t('trace'), route: '/trace/demo' },
    { label: '🏆 ' + t('challenges'), route: '/competitions' },
    { label: '📅 ' + t('meal_planner'), route: '/meal-planner' },
    { label: '👥 Stockvel', route: '/stockvel' },
    { label: '📚 Academy', route: '/academy' },
  ];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c0392b" />}>
      <View style={s.header}>
        <Text style={s.greeting}>{t('welcome_back')}, {user?.first_name || 'Boer'} 👋</Text>
        <View style={s.tierBadge}><Text style={s.tierText}>{stats.tier.toUpperCase()}</Text></View>
      </View>
      <View style={s.statsRow}>
        <View style={s.statCard}><Text style={s.statVal}>{stats.orders}</Text><Text style={s.statLabel}>{t('orders')}</Text></View>
        <View style={s.statCard}><Text style={s.statVal}>R{stats.spent.toFixed(0)}</Text><Text style={s.statLabel}>{t('spent')}</Text></View>
      </View>
      <Text style={s.sectionTitle}>{t('quick_actions')}</Text>
      <View style={s.grid}>
        {quickLinks.map((l) => (
          <TouchableOpacity key={l.route} style={s.gridItem} onPress={() => router.push(l.route as any)}>
            <Text style={s.gridText}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  tierBadge: { backgroundColor: '#c0392b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, alignItems: 'center' },
  statVal: { color: '#c0392b', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingBottom: 32 },
  gridItem: { width: '47%', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  gridText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
