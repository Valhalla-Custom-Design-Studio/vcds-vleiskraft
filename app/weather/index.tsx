
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
const Spacing = { sm: 8, md: 16, lg: 24 };
const Radius = { sm: 8, md: 12, lg: 16 };
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useAuthStore } from '../../src/store/authStore';
import { t } from '../../src/locales';
import api from '../../src/lib/api';

export default function WeatherScreen() {
  const { language } = useAuthStore();
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/api/weather/forecast');
      setForecast(data.forecast ?? data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const getBraaiIcon = (good: boolean) => good ? '🔥' : '🍲';
  const getBraaiColor = (good: boolean) => good ? Colors.successBright : Colors.warning;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🌤️ {t('braaiWeather', language)}</Text>
        <Text style={styles.sub}>{t('forecast3day', language)}</Text>
      </View>
      {loading
        ? [...Array(3)].map((_, i) => <SkeletonBox key={i} height={120} style={{ marginBottom: Spacing.md }} />)
        : forecast.map((day, i) => (
          <GlassCard key={i} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.day ?? day.date}</Text>
              <Text style={styles.temp}>{day.temp ?? day.temperature}°C</Text>
            </View>
            <Text style={styles.condition}>{day.condition}</Text>
            <View style={[styles.braaiBadge, { backgroundColor: getBraaiColor(day.goodForBraai) + '22' }]}>
              <Text style={styles.braaiIcon}>{getBraaiIcon(day.goodForBraai)}</Text>
              <Text style={[styles.braaiText, { color: getBraaiColor(day.goodForBraai) }]}>
                {day.recommendation ?? (day.goodForBraai ? t('perfectBraai', language) : 'Indoor potjie day 🍲')}
              </Text>
            </View>
          </GlassCard>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  dayCard: { padding: Spacing.md, marginBottom: Spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  dayName: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  temp: { color: Colors.secondary, fontSize: 22, fontWeight: '800' },
  condition: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.sm },
  braaiBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.sm },
  braaiIcon: { fontSize: 24 },
  braaiText: { fontSize: 14, fontWeight: '600', flex: 1 },
});
