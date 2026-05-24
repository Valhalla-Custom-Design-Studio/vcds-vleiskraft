
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { format, differenceInDays } from 'date-fns';

export default function CampaignsScreen() {
  const { language } = useAuthStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await api.get('/api/campaigns'); setCampaigns(data); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.container}>{[...Array(2)].map((_, i) => <SkeletonBox key={i} height={120} style={{ margin: Spacing.md }} />)}</View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎄 {t('seasonOrder', language)}</Text>
      </View>
      {campaigns.length === 0
        ? <EmptyState icon="calendar-outline" title={t('noCampaigns', language)} />
        : (
          <FlatList
            data={campaigns}
            keyExtractor={i => i.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
            renderItem={({ item }) => {
              const daysLeft = differenceInDays(new Date(item.deadline), new Date());
              return (
                <GlassCard style={styles.card}>
                  <Text style={styles.name}>{language === 'af' ? item.nameAf : item.nameEn}</Text>
                  <Text style={styles.desc}>{language === 'af' ? item.descAf : item.descEn}</Text>
                  <View style={styles.row}>
                    <Text style={styles.deposit}>{t('deposit', language)}: {item.depositPct}%</Text>
                    <Text style={[styles.deadline, { color: daysLeft < 7 ? Colors.error : Colors.warning }]}>
                      {daysLeft} days left
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>Pre-Order Now</Text>
                  </TouchableOpacity>
                </GlassCard>
              );
            }}
            contentContainerStyle={{ padding: Spacing.md }}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  card: { padding: Spacing.md, marginBottom: Spacing.md },
  name: { color: Colors.secondary, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  desc: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  deposit: { color: Colors.textPrimary, fontSize: 14 },
  deadline: { fontSize: 14, fontWeight: '700' },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontWeight: '700' },
});
