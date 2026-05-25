
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function WhatsAppOrderScreen() {
  const { language } = useAuthStore();
  const { addItem } = useCartStore();
  const [text, setText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const process = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/whatsapp/parse-order', { text });
      setResults(data.items ?? data);
    } catch { Alert.alert('Error', 'Could not parse order'); }
    finally { setLoading(false); }
  };

  const addAll = () => {
    results.forEach(item => { if (item.productId) addItem(item.productId, item.quantity ?? 1); });
    Alert.alert('✅', t('addAllToCart', language));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 {t('whatsappOrder', language)}</Text>
        <Text style={styles.sub}>Plak jou WhatsApp bestelling en ons verwerk dit</Text>
      </View>
      <GlassCard style={styles.form}>
        <Text style={styles.label}>{t('pasteWhatsapp', language)}</Text>
        <TextInput
          style={styles.textarea}
          placeholder="1kg Boerewors, 500g Lamb Chops, 2kg Rump..."
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={5}
        />
        <GradientButton label={loading ? t('loading', language) : t('processOrder', language)} onPress={process} loading={loading} />
      </GlassCard>
      {results.length > 0 && (
        <GlassCard style={styles.results}>
          <Text style={styles.resultsTitle}>{t('foundItems', language)}</Text>
          {results.map((item, i) => (
            <View key={i} style={styles.resultItem}>
              <Ionicons name={item.matched ? 'checkmark-circle' : 'help-circle'} size={20} color={item.matched ? Colors.successBright : Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name ?? item.originalText}</Text>
                {item.price && <Text style={styles.itemPrice}>R{item.price} • {item.quantity ?? 1}x</Text>}
              </View>
            </View>
          ))}
          <GradientButton label={t('addToCartBtn', language)} onPress={addAll} style={{ marginTop: Spacing.md }} />
        </GlassCard>
      )}
      <TouchableOpacity style={styles.waBtn} onPress={() => Linking.openURL('https://wa.me/')}>
        <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        <Text style={styles.waBtnText}>Open WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  form: { padding: Spacing.md, marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: Spacing.sm },
  textarea: { backgroundColor: Colors.elevated, borderRadius: Radius.sm, padding: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, fontSize: 15, minHeight: 100, marginBottom: Spacing.md, textAlignVertical: 'top' },
  results: { padding: Spacing.md, marginBottom: Spacing.md },
  resultsTitle: { color: Colors.secondary, fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  itemName: { color: Colors.textPrimary, fontSize: 15 },
  itemPrice: { color: Colors.textSecondary, fontSize: 13 },
  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#25D366' },
  waBtnText: { color: '#25D366', fontWeight: '700', fontSize: 15 },
});
