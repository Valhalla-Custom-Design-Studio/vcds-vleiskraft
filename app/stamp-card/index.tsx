import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { StampCard } from '@/types';

export default function StampCardScreen() {
  const { language } = useAuthStore();
  const [card, setCard] = useState<StampCard | null>(null);

  useEffect(() => {
    api.get('/api/stamp-card/my').then(r => setCard(r.data));
  }, []);

  const redeem = async () => {
    await api.post('/api/stamp-card/redeem');
    Alert.alert('🎁', 'Beloning gebruik!');
    api.get('/api/stamp-card/my').then(r => setCard(r.data));
  };

  if (!card) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🎟️ {t('stampCard', language)}</Text>
      <GlassCard>
        <Text style={styles.label}>{t('yourStamps', language)}</Text>
        <View style={styles.grid}>
          {[...Array(card.target)].map((_, i) => (
            <View key={i} style={[styles.stamp, i < card.stamps && styles.stampFilled]}>
              <Ionicons name={i < card.stamps ? 'checkmark' : 'ellipse-outline'} size={20} color={i < card.stamps ? '#fff' : Colors.textSecondary} />
            </View>
          ))}
        </View>
        <Text style={styles.progress}>{card.stamps}/{card.target} stempels</Text>
        {card.redeemed > 0 && <Text style={styles.reward}>{card.redeemed} {t('rewardAvailable', language)}</Text>}
        {card.redeemed > 0 && <GradientButton onPress={redeem} label={t('useReward', language)} variant="gold" style={styles.btn} />}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: Spacing.md },
  label: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  stamp: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  stampFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  progress: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.sm },
  reward: { color: Colors.successBright, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  btn: {},
});
