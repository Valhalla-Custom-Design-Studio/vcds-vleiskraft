import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';

interface Flag { key: string; label: string; enabled: boolean; description?: string; }

export default function AdminFeaturesScreen() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/feature-flags').then(r => setFlags(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function toggle(key: string, value: boolean) {
    try {
      await api.patch(`/admin/feature-flags/${key}`, { enabled: value });
      setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: value } : f));
    } catch {
      Alert.alert('Error', 'Could not update feature flag');
    }
  }

  if (loading) return <ScreenContainer title="Feature Flags"><ActivityIndicator style={{ marginTop: 40 }} /></ScreenContainer>;

  return (
    <ScreenContainer title="Feature Flags">
      <FlatList
        data={flags}
        keyExtractor={i => i.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>{item.label}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              </View>
              <Switch
                value={item.enabled}
                onValueChange={v => toggle(item.key, v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No feature flags configured</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1, marginRight: 12 },
  label: { fontSize: 15, fontWeight: '700', color: colors.text },
  desc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
