import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { SkeletonBox } from '../../src/components/SkeletonBox';
import { t } from '../../src/i18n';
import { api } from '../../src/services/api';

const STATUS_COLOR: Record<string, string> = {
  PENDING: Colors.warning, CONFIRMED: Colors.secondary, PREPARING: Colors.secondary,
  READY: Colors.successBright, COLLECTED: Colors.success, DELIVERED: Colors.success, CANCELLED: Colors.error,
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data);
        if (data.rating) { setRating(data.rating.rating); setRated(true); }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const reorder = async () => {
    try {
      await api.post(`/orders/${orderId}/reorder`);
      router.push('/cart');
    } catch { Alert.alert('Error', 'Could not reorder'); }
  };

  const submitRating = async () => {
    if (!rating) { Alert.alert('Error', 'Select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/rate`, { rating, comment });
      setRated(true);
      Alert.alert('✅', 'Thank you for your rating!');
    } catch { Alert.alert('Error', 'Could not submit rating'); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonBox height={400} style={{ margin: Spacing.md }} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.textPrimary, padding: Spacing.md }}>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>#{order.id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[order.status] ?? Colors.warning) + '33' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[order.status] ?? Colors.warning }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <Text style={styles.date}>{format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}</Text>

      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>{t('items')}</Text>
        {order.items?.map((item: any, i: number) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemName}>{item.productNameSnapshot}</Text>
            <Text style={styles.itemMeta}>x{item.quantity} • R{item.unitPrice?.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('total')}</Text>
          <Text style={styles.totalAmount}>R{order.totalAmount?.toFixed(2)}</Text>
        </View>
      </GlassCard>

      {order.deliveryType === 'DELIVERY' && order.status !== 'DELIVERED' && (
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.push(`/delivery-tracking/${orderId}` as any)}
        >
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          <Text style={styles.trackBtnText}>{t('deliveryTracker')}</Text>
        </TouchableOpacity>
      )}

      <GradientButton
        label={t('orderAgain')}
        onPress={reorder}
        style={{ marginBottom: Spacing.md }}
      />

      {(order.status === 'DELIVERED' || order.status === 'COLLECTED') && !rated && (
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>{t('rateOrder')}</Text>
          <Text style={styles.rateQ}>{t('howWasOrder')}</Text>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={32} color={Colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder={t('commentOptional')}
            placeholderTextColor={Colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <GradientButton
            label={submitting ? t('loading') : t('submitRating')}
            onPress={submitRating}
            loading={submitting}
          />
        </GlassCard>
      )}

      {rated && <Text style={styles.ratedText}>✅ Rated {rating}/5</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  badge: { borderRadius: Radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  date: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.md },
  card: { padding: Spacing.md, marginBottom: Spacing.md },
  cardTitle: { color: Colors.secondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: Spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { color: Colors.textPrimary, fontSize: 15 },
  itemMeta: { color: Colors.textSecondary, fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  totalAmount: { color: Colors.secondary, fontSize: 20, fontWeight: '800' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primary, marginBottom: Spacing.md },
  trackBtnText: { color: Colors.primary, fontWeight: '700' },
  rateQ: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  commentInput: { backgroundColor: Colors.elevated, borderRadius: Radius.sm, padding: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, minHeight: 80, textAlignVertical: 'top' },
  ratedText: { color: Colors.successBright, textAlign: 'center', fontSize: 16, fontWeight: '700' },
});
