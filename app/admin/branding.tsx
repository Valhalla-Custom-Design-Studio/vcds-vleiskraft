
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

const PRESET_COLORS = [
  '#C8102E', '#8B0A1E', '#D4A56A', '#1A1A2E', '#16213E',
  '#0F3460', '#533483', '#2D6A4F', '#1B4332', '#6B2D0F',
];

export default function BrandingScreen() {
  const { language } = useAuthStore();
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#C8102E');
  const [accentColor, setAccentColor] = useState('#D4A56A');
  const [tagline, setTagline] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBranding(); }, []);

  const loadBranding = async () => {
    try {
      const { data } = await api.get('/api/tenant/me');
      setPrimaryColor(data.primaryColor ?? '#C8102E');
      setAccentColor(data.accentColor ?? '#D4A56A');
      setTagline(data.tagline ?? '');
      setTenantName(data.name ?? '');
      if (data.logoUrl) setLogo(data.logoUrl);
      if (data.bannerUrl) setBanner(data.bannerUrl);
    } catch {}
  };

  const pickImage = async (type: 'logo' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (type === 'logo') setLogo(asset.uri);
      else setBanner(asset.uri);
    }
  };

  const saveBranding = async () => {
    setLoading(true);
    try {
      await api.patch('/api/tenant/branding', {
        primaryColor,
        accentColor,
        tagline,
        name: tenantName,
        logoBase64: logo?.startsWith('data:') || logo?.startsWith('file:') ? logo : undefined,
        bannerBase64: banner?.startsWith('data:') || banner?.startsWith('file:') ? banner : undefined,
      });
      Alert.alert('✅', t('brandingUpdated', language));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save branding');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 {t('platinumButchery', language)}</Text>
        <Text style={styles.sub}>{t('platinumDesc', language)}</Text>
      </View>

      {/* Preview */}
      <GlassCard style={[styles.preview, { borderColor: primaryColor }]}>
        <Text style={styles.previewLabel}>Live Preview</Text>
        <View style={[styles.previewBanner, { backgroundColor: primaryColor }]}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.previewLogo} />
          ) : (
            <Ionicons name="storefront-outline" size={40} color="#fff" />
          )}
          <Text style={styles.previewName}>{tenantName || 'La Oma™ Slaghuis'}</Text>
          <Text style={[styles.previewTagline, { color: accentColor }]}>{tagline || 'Jou buurt-slaghuis'}</Text>
        </View>
      </GlassCard>

      {/* Butchery Name */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>🏪 Slaghuis Naam</Text>
        <TextInput
          style={styles.input}
          placeholder="La Oma™ Slaghuis"
          placeholderTextColor={Colors.textSecondary}
          value={tenantName}
          onChangeText={setTenantName}
        />
        <TextInput
          style={styles.input}
          placeholder={t('tagline', language)}
          placeholderTextColor={Colors.textSecondary}
          value={tagline}
          onChangeText={setTagline}
        />
      </GlassCard>

      {/* Logo & Banner */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>🖼️ {t('uploadLogo', language)}</Text>
        <View style={styles.imageRow}>
          <TouchableOpacity style={styles.imageBox} onPress={() => pickImage('logo')}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoPreview} />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color={Colors.secondary} />
                <Text style={styles.imageLabel}>Logo (1:1)</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.imageBox, styles.bannerBox]} onPress={() => pickImage('banner')}>
            {banner ? (
              <Image source={{ uri: banner }} style={styles.bannerPreview} />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color={Colors.secondary} />
                <Text style={styles.imageLabel}>Banner (16:9)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Colours */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>🎨 {t('primaryColor', language)}</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorSwatch, { backgroundColor: c }, primaryColor === c && styles.colorSelected]}
              onPress={() => setPrimaryColor(c)}
            />
          ))}
        </View>
        <TextInput
          style={styles.colorInput}
          placeholder="#C8102E"
          placeholderTextColor={Colors.textSecondary}
          value={primaryColor}
          onChangeText={setPrimaryColor}
          autoCapitalize="none"
        />

        <Text style={[styles.cardTitle, { marginTop: Spacing.md }]}>{t('accentColor', language)}</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorSwatch, { backgroundColor: c }, accentColor === c && styles.colorSelected]}
              onPress={() => setAccentColor(c)}
            />
          ))}
        </View>
        <TextInput
          style={styles.colorInput}
          placeholder="#D4A56A"
          placeholderTextColor={Colors.textSecondary}
          value={accentColor}
          onChangeText={setAccentColor}
          autoCapitalize="none"
        />
      </GlassCard>

      <GradientButton label={loading ? t('loading', language) : t('saveBranding', language)} onPress={saveBranding} loading={loading} style={{ marginHorizontal: Spacing.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: 60, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  preview: { marginBottom: Spacing.md, overflow: 'hidden', padding: 0, borderWidth: 2 },
  previewLabel: { color: Colors.textSecondary, fontSize: 11, padding: Spacing.sm, textAlign: 'center' },
  previewBanner: { padding: Spacing.lg, alignItems: 'center', borderRadius: Radius.md },
  previewLogo: { width: 60, height: 60, borderRadius: 30, marginBottom: Spacing.sm },
  previewName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  previewTagline: { fontSize: 13, marginTop: 4 },
  card: { marginBottom: Spacing.md, padding: Spacing.md },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  input: { height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15 },
  imageRow: { flexDirection: 'row', gap: Spacing.md },
  imageBox: { flex: 1, height: 100, backgroundColor: Colors.elevated, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  bannerBox: { flex: 2 },
  logoPreview: { width: '100%', height: '100%', borderRadius: Radius.md },
  bannerPreview: { width: '100%', height: '100%', borderRadius: Radius.md },
  imageLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#fff' },
  colorInput: { height: 44, backgroundColor: Colors.elevated, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, fontSize: 15 },
});
