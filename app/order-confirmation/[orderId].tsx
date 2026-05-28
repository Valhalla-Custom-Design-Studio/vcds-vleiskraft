
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { SkeletonBox } from '@/components/ui/SkeletonBox';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { language } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const shareOrder = () => {
    Share.share({ message: language === 'af' ? 'Sopas bestel by La Oma™ Slaghuis! 🥩🔥' : 'Just ordered from La Oma™ Slaghuis! 🥩🔥' });
  };

  if (loading) return <View style={styles.container}><SkeletonBox height={300} style={{ margin: Spacing.md }} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.successBright} />
      </View>
      <Text style={styles.title}>{t('thankYou', language)}</Text>
      <GlassCard style={styles.card}>
        <Text style={styles.orderId}>#{order?.id?.slice(-6).toUpperCase()}</Text>
        <Text style={styles.total}>R{order?.totalAmount?.toFixed(2)}</Text>
        <Text style={styles.collection}>{t('estimatedCollection', language)}: {t('within3045', language)}</Text>
        {order?.items?.map((item: any, i: number) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemName}>{item.productNameSnapshot ?? item.product?.nameEn}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
        ))}
      </GlassCard>
      <TouchableOpacity style={styles.shareBtn} onPress={shareOrder}>
        <Ionicons name="share-social-outline" size={20} color={Colors.secondary} />
        <Text style={styles.shareBtnText}>{t('shareOrder', language)}</Text>
      </TouchableOpacity>
      <GradientButton label={t('viewOrder', language)} onPress={() => router.push(`/order/${orderId}`)} style={{ marginBottom: Spacing.sm }} />
      <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.continueBtnText}>{t('continueShopping', language)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 80, paddingBottom: Spacing.xxl, alignItems: 'center' },
  successCircle: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.lg },
  card: { width: '100%', padding: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center' },
  orderId: { color: Colors.textSecondary, fontSize: 14, marginBottom: 4 },
  total: { color: Colors.secondary, fontSize: 32, fontWeight: '800', marginBottom: Spacing.sm },
  collection: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.md, textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 4 },
  itemName: { color: Colors.textPrimary, fontSize: 14 },
  itemQty: { color: Colors.textSecondary, fontSize: 14 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.secondary },
  shareBtnText: { color: Colors.secondary, fontWeight: '700' },
  continueBtn: { padding: Spacing.md },
  continueBtnText: { color: Colors.textSecondary, fontSize: 15 },
});
