import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

export default function KoleKykScreen() {
  const { language } = useAuthStore();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pick = async (camera: boolean) => {
    const fn = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const r = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.7 });
    if (!r.canceled) setImage(r.assets[0].uri);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/braai-brein/kole-kyk', { imageUrl: image });
      setResult(data);
    } catch { Alert.alert('Error', t('tryAgain', language)); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔥 {t('coalCheck', language)}</Text>
      <Text style={styles.sub}>AI bepaal of jou kole gereed is om te braai</Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickBtn} onPress={() => pick(true)}>
          <Ionicons name="camera-outline" size={24} color={Colors.secondary} />
          <Text style={styles.pickText}>{t('takePhoto', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickBtn} onPress={() => pick(false)}>
          <Ionicons name="image-outline" size={24} color={Colors.secondary} />
          <Text style={styles.pickText}>{t('pickPhoto', language)}</Text>
        </TouchableOpacity>
      </View>
      {image && <Image source={{ uri: image }} style={styles.preview} />}
      {image && <GradientButton onPress={analyze} label={loading ? t('analyzing', language) : t('analyze', language)} loading={loading} style={styles.btn} />}
      {result && (
        <GlassCard style={styles.result}>
          <Text style={styles.resultTitle}>{t('readiness', language)}: {result.readiness}</Text>
          <Text style={styles.resultSub}>{t('temperature', language)}: {result.temperature}</Text>
          <Text style={styles.resultSub}>{t('recommendation', language)}: {result.recommendation}</Text>
          {result.tips?.map((tip: string, i: number) => <Text key={i} style={styles.tip}>• {tip}</Text>)}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.lg },
  pickerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  pickBtn: { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  pickText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  preview: { width: '100%', height: 220, borderRadius: Radius.lg, marginBottom: Spacing.md },
  btn: { marginBottom: Spacing.md },
  result: { gap: 6 },
  resultTitle: { color: Colors.secondary, fontSize: 18, fontWeight: '700' },
  resultSub: { color: Colors.textPrimary, fontSize: 15 },
  tip: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
});
