import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { t } from '../../src/i18n';
import { api } from '../../src/services/api';

interface WooStatus {
  connected: boolean;
  productCount?: number;
  customerCount?: number;
  orderCount?: number;
}

export default function WooCommerceScreen() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<WooStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<Record<string, any>>({});

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const { data } = await api.get('/admin/woocommerce/status');
      setStatus(data);
      if (data.url) setUrl(data.url);
    } catch {}
  };

  const saveCredentials = async () => {
    if (!url || !key || !secret) { Alert.alert('Error', 'All fields required'); return; }
    setLoading(true);
    try {
      await api.post('/admin/woocommerce/credentials', { url, consumerKey: key, consumerSecret: secret });
      const { data } = await api.get('/admin/woocommerce/status');
      setStatus(data);
      Alert.alert('✅ Connected!', `WooCommerce connected to ${url}`);
    } catch (e: any) {
      Alert.alert('Connection Failed', e?.message ?? 'Check your credentials');
    } finally { setLoading(false); }
  };

  const runImport = async (type: 'products' | 'customers' | 'orders') => {
    setImporting(type);
    try {
      const { data } = await api.post(`/admin/woocommerce/import/${type}`);
      setImportResult(prev => ({ ...prev, [type]: data }));
      Alert.alert(
        '✅ ' + t('importSuccess'),
        `${data.imported} ${type} imported.`
      );
    } catch (e: any) {
      Alert.alert('Import Failed', e?.message ?? 'Import error');
    } finally { setImporting(null); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 {t('woocommerce')}</Text>
        <Text style={styles.sub}>Sinkroniseer jou WooCommerce winkel</Text>
      </View>

      {/* Connection Status */}
      <GlassCard style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons
            name={status?.connected ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={status?.connected ? Colors.successBright : Colors.error}
          />
          <Text style={[styles.statusText, { color: status?.connected ? Colors.successBright : Colors.error }]}>
            {status?.connected ? 'Verbind / Connected' : 'Nie verbind nie / Not Connected'}
          </Text>
        </View>
        {status?.connected && (
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNum}>{status.productCount ?? 0}</Text><Text style={styles.statLabel}>Products</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{status.customerCount ?? 0}</Text><Text style={styles.statLabel}>Customers</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{status.orderCount ?? 0}</Text><Text style={styles.statLabel}>Orders</Text></View>
          </View>
        )}
      </GlassCard>

      {/* Credentials */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>🔑 Credentials</Text>
        <TextInput style={styles.input} placeholder={t('wooUrl')} placeholderTextColor={Colors.textSecondary} value={url} onChangeText={setUrl} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t('wooKey')} placeholderTextColor={Colors.textSecondary} value={key} onChangeText={setKey} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t('wooSecret')} placeholderTextColor={Colors.textSecondary} value={secret} onChangeText={setSecret} secureTextEntry />
        <GradientButton label={loading ? t('loading') : t('testConnection')} onPress={saveCredentials} loading={loading} />
      </GlassCard>

      {/* Import Actions */}
      {status?.connected && (
        <GlassCard style={styles.card}>
          <Text style={styles.cardTitle}>📥 Import Data</Text>
          <Text style={styles.importNote}>⚠️ {t('productsReplaced')}</Text>
          {(['products', 'customers', 'orders'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.importBtn, importing === type && styles.importBtnActive]}
              onPress={() => runImport(type)}
              disabled={!!importing}
            >
              {importing === type
                ? <ActivityIndicator color={Colors.primary} size="small" />
                : <Ionicons name="cloud-download-outline" size={20} color={Colors.secondary} />
              }
              <View style={{ flex: 1 }}>
                <Text style={styles.importBtnText}>
                  {importing === type ? t('importRunning') : t(`import${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                </Text>
                {importResult[type] && (
                  <Text style={styles.importResult}>
                    ✅ {importResult[type].imported} imported, {importResult[type].skipped ?? 0} skipped
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  statusCard: { marginBottom: Spacing.md, padding: Spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  statusText: { fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.sm },
  stat: { alignItems: 'center' },
  statNum: { color: Colors.secondary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12 },
  card: { marginBottom: Spacing.md, padding: Spacing.md },
  cardTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  input: { height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15 },
  importNote: { color: Colors.warning, fontSize: 12, marginBottom: Spacing.md, fontStyle: 'italic' },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.elevated, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  importBtnActive: { borderColor: Colors.primary },
  importBtnText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  importResult: { color: Colors.successBright, fontSize: 12, marginTop: 2 },
});
