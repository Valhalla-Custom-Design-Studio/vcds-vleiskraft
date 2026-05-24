import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import { ProductImage } from '@/components/shop/ProductImage';

export default function CartScreen() {
  const { language } = useAuthStore();
  const { items, fetchCart, updateItem, removeItem, clearCart, subtotal } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  if (items.length === 0) {
    return <EmptyState icon="cart-outline" title={t('cartEmpty', language)} ctaLabel={t('startShopping', language)} onCta={() => router.push('/(tabs)/shop')} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('cart', language)}</Text>
        <TouchableOpacity onPress={() => Alert.alert(t('cart', language), 'Verwyder alles?', [{ text: 'Ja', onPress: clearCart, style: 'destructive' }, { text: 'Nee', style: 'cancel' }])}>
          <Text style={styles.clear}>Verwyder Alles</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items} keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProductImage uri={item.product.imageUrl} size={64} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{language === 'af' ? item.product.nameAf : item.product.nameEn}</Text>
              <Text style={styles.price}>R{(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
            <View style={styles.qty}>
              <TouchableOpacity onPress={() => updateItem(item.id, item.quantity - 1)} style={styles.qtyBtn}><Ionicons name="remove" size={16} color={Colors.textPrimary} /></TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateItem(item.id, item.quantity + 1)} style={styles.qtyBtn}><Ionicons name="add" size={16} color={Colors.textPrimary} /></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.row}><Text style={styles.subLabel}>{t('subtotal', language)}</Text><Text style={styles.subVal}>R{subtotal().toFixed(2)}</Text></View>
        <GradientButton onPress={() => router.push('/checkout' as any)} label={t('checkout', language)} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  clear: { color: Colors.error, fontSize: 13 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  price: { color: Colors.secondary, fontSize: 15, fontWeight: '700' },
  qty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 32, height: 32, backgroundColor: Colors.elevated, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  subLabel: { color: Colors.textSecondary, fontSize: 16 },
  subVal: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
});
