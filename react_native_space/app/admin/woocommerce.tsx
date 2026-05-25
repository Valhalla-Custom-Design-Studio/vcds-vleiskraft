import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../src/constants/theme';

export default function WooCommerceSettings() {
  const [url, setUrl] = useState('');
  const [ck, setCk] = useState('');
  const [cs, setCs] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/woocommerce/config`, {
      headers: { Authorization: `Bearer ${global.authToken}` },
    }).then(r => r.json()).then(d => {
      setUrl(d.url || '');
      setCk(d.consumer_key || '');
      setCs(d.consumer_secret || '');
      setSyncEnabled(d.sync_enabled || false);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/woocommerce/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${global.authToken}` },
        body: JSON.stringify({ url, consumer_key: ck, consumer_secret: cs, sync_enabled: syncEnabled }),
      });
      if (res.ok) Alert.alert('Saved', 'WooCommerce config updated.');
      else Alert.alert('Error', 'Save failed.');
    } catch (_) { Alert.alert('Error', 'Network error.'); }
    setLoading(false);
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/admin/woocommerce/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${global.authToken}` },
      });
      const d = await res.json();
      Alert.alert('Sync Complete', `${d.synced || 0} products synced.`);
    } catch (_) { Alert.alert('Error', 'Sync failed.'); }
    setSyncing(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: Spacing.lg, paddingTop: 60 }}>
      <Text style={s.title}>WooCommerce Integration</Text>

      <Text style={s.label}>Store URL</Text>
      <TextInput style={s.input} value={url} onChangeText={setUrl} placeholder="https://yourstore.co.za" placeholderTextColor={Colors.textSecondary} autoCapitalize="none" />

      <Text style={s.label}>Consumer Key</Text>
      <TextInput style={s.input} value={ck} onChangeText={setCk} placeholder="ck_..." placeholderTextColor={Colors.textSecondary} autoCapitalize="none" secureTextEntry />

      <Text style={s.label}>Consumer Secret</Text>
      <TextInput style={s.input} value={cs} onChangeText={setCs} placeholder="cs_..." placeholderTextColor={Colors.textSecondary} autoCapitalize="none" secureTextEntry />

      <TouchableOpacity style={s.toggle} onPress={() => setSyncEnabled(!syncEnabled)}>
        <Ionicons name={syncEnabled ? 'toggle' : 'toggle-outline'} size={32} color={syncEnabled ? Colors.success : Colors.textSecondary} />
        <Text style={s.toggleLabel}>Auto-sync products</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btn} onPress={save} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Configuration</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={triggerSync} disabled={syncing}>
        {syncing ? <ActivityIndicator color={Colors.primary} /> : (
          <><Ionicons name="sync-outline" size={18} color={Colors.primary} /><Text style={[s.btnText, { color: Colors.primary }]}> Sync Now</Text></>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSize.md, marginBottom: Spacing.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.md },
  toggleLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  btnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
