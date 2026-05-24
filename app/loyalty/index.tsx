import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';
import { LoyaltyAccount, LoyaltyTransaction } from '@/types';

const TIER_COLORS = { BRONZE: '#CD7F32', SILVER: '#A8A9AD', GOLD: Colors.secondary, PLATINUM: '#E5E4E2' };
const TIER_NEXT = { BRONZE: 500, SILVER: 2000, GOLD: 5000, PLATINUM: Infinity };

export default function LoyaltyScreen() {
  const { language } = useAuthStore();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/loyalty/account'),
      api.get('/api/loyalty/transactions'),
      api.get('/api/loyalty/referral-code'),
    ]).then(([a, tx, r]) => {
      setAccount(a.data); setTransactions(tx.data); setReferralCode(r.data.code);
    }).finally(() => setLoading(false));
  }, []);

  const redeem = async () => {
    Alert.prompt('Punte Wissel', 'Hoeveel punte wil jy wissel?', async (pts) => {
      try { await api.post('/api/loyalty/redeem', { points: +pts }); Alert.alert('✅', 'Punte gebruik!'); }
      catch { Alert.alert('Fout', 'Nie genoeg punte nie.'); }
    });
  };

  const shareCode = () => Share.share({ message: `${t('shareCode', language)} Kode: ${referralCode}` });

  if (loading || !account) return null;

  const tier = account.tier as keyof typeof TIER_COLORS;
  const nextPts = TIER_NEXT[tier];
  const progress = nextPts === Infinity ? 1 : Math.min(account.points / nextPts, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>⭐ {t('vleiskraftPoints', language)}</Text>

      {/* Tier Card */}
      <LinearGradient colors={[TIER_COLORS[tier], '#1A1A1A']} style={styles.tierCard}>
        <Text style={styles.tierName}>{t(tier.toLowerCase() as any, language)}</Text>
        <Text style={styles.points}>{account.points.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>{t('yourPoints', language)}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: TIER_COLORS[tier] }]} />
        </View>
        {nextPts < Infinity && <Text style={styles.nextTier}>{nextPts - account.points} {t('pointsToNext', language)}</Text>}
      </LinearGradient>

      <GradientButton onPress={redeem} label={t('redeemPoints', language)} variant="gold" style={styles.btn} />

      {/* Referral */}
      <GlassCard style={styles.referral}>
        <Text style={styles.referTitle}>{t('referFriend', language)}</Text>
        <Text style={styles.referSub}>{t('shareCode', language)}</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{referralCode}</Text>
          <TouchableOpacity onPress={shareCode}>
            <Ionicons name="share-social-outline" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Transaction History */}
      <Text style={styles.histTitle}>Geskiedenis</Text>
      {transactions.map((tx) => (
        <GlassCard key={tx.id} style={styles.txCard}>
          <View style={styles.txRow}>
            <Text style={styles.txDesc}>{tx.description}</Text>
            <Text style={[styles.txPts, { color: tx.points > 0 ? Colors.successBright : Colors.error }]}>
              {tx.points > 0 ? '+' : ''}{tx.points}
            </Text>
          </View>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: Spacing.md },
  tierCard: { borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.md, alignItems: 'center' },
  tierName: { color: '#fff', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: Spacing.sm },
  points: { color: '#fff', fontSize: 48, fontWeight: '900' },
  pointsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: Spacing.md },
  progressBg: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: Spacing.sm },
  progressFill: { height: 8, borderRadius: 4 },
  nextTier: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  btn: { marginBottom: Spacing.md },
  referral: { marginBottom: Spacing.md },
  referTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  referSub: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.sm },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.elevated, borderRadius: Radius.sm, padding: Spacing.md },
  code: { color: Colors.secondary, fontSize: 20, fontWeight: '800', letterSpacing: 4 },
  histTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  txCard: { marginBottom: Spacing.sm },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txDesc: { color: Colors.textPrimary, fontSize: 14, flex: 1 },
  txPts: { fontSize: 16, fontWeight: '700' },
});
