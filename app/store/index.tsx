import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function StoreScreen() {
  const { language } = useAuthStore();
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => { api.get('/api/tenant/me').then(r => setTenant(r.data)).catch(() => {}); }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📍 {t('storeInfo', language)}</Text>
      {tenant && (
        <>
          <GlassCard style={styles.card}>
            <Text style={styles.name}>{tenant.name}</Text>
            <Text style={styles.info}>{tenant.address}</Text>
            <Text style={styles.info}>{tenant.phone}</Text>
            <Text style={styles.info}>{tenant.contactEmail}</Text>
          </GlassCard>
          <TouchableOpacity style={styles.dirBtn} onPress={() => Linking.openURL(`https://maps.google.com/?q=${tenant.lat},${tenant.lng}`)}>
            <Ionicons name="navigate-outline" size={20} color="#fff" />
            <Text style={styles.dirText}>{t('getDirections', language)}</Text>
          </TouchableOpacity>
          <GlassCard style={styles.card}>
            <Text style={styles.hoursTitle}>{t('operatingHours', language)}</Text>
            {tenant.operatingHours && Object.entries(tenant.operatingHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.day}>{day}</Text>
                <Text style={styles.hours}>{hours as string}</Text>
              </View>
            ))}
          </GlassCard>
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: 80, gap: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  card: { gap: 4 },
  name: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  info: { color: Colors.textSecondary, fontSize: 14 },
  dirBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: 12, padding: 16 },
  dirText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hoursTitle: { color: Colors.secondary, fontSize: 15, fontWeight: '700', marginBottom: Spacing.sm },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { color: Colors.textSecondary, fontSize: 13 },
  hours: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});
