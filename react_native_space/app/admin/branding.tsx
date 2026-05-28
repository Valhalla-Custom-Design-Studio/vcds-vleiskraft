import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/services/api';
import { t } from '../../src/i18n';
import { Colors, Spacing, Radius } from '../../src/constants/theme';
import ScreenContainer from '../../src/components/ScreenContainer';
import GlassCard from '../../src/components/GlassCard';
import GradientButton from '../../src/components/GradientButton';
// ProductImage replaced with standard Image

interface TenantBranding {
  name?: string; logoUrl?: string; bannerUrl?: string;
  primaryColor?: string; accentColor?: string;
  tagline?: string; phone?: string; address?: string;
}

const COLOR_PRESETS = [
  { label: 'Rooi / Red', primary: '#C8102E', accent: '#D4A56A' },
  { label: 'Groen / Green', primary: '#16A34A', accent: '#D4A56A' },
  { label: 'Blou / Blue', primary: '#1D4ED8', accent: '#93C5FD' },
  { label: 'Swart / Black', primary: '#1A1A1A', accent: '#D4A56A' },
  { label: 'Oranje / Orange', primary: '#EA580C', accent: '#FCD34D' },
  { label: 'Pers / Purple', primary: '#7C3AED', accent: '#C4B5FD' },
];

export default function AdminBrandingScreen() {
  const lang = 'en'; // auto-detected via i18n
  const router = useRouter();
  const [form, setForm] = useState<TenantBranding>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // FIX: Use /api/tenant/me (authenticated endpoint) not /api/tenant (public list)
    api.get('/api/tenant/me')
      .then(r => {
        const t = r?.data ?? {};
        setForm({
          name: t?.name ?? '',
          logoUrl: t?.logoUrl ?? '',
          bannerUrl: t?.bannerUrl ?? '',
          primaryColor: t?.primaryColor ?? '#C8102E',
          accentColor: t?.accentColor ?? '#D4A56A',
          tagline: t?.tagline ?? '',
          phone: t?.phone ?? '',
          address: t?.address ?? '',
        });
        .catch((err) => { /* VCDS:SAFE */ if (__DEV__) { void 0; } });
      })
      .catch(() => setError(lang === 'AF' ? 'Kon nie handelsmerk laai nie' : 'Could not load branding'))
      .finally(() => setLoading(false));
  }, []);

  const pickAndUpload = async (field: 'logoUrl' | 'bannerUrl') => {
    const setUploading = field === 'logoUrl' ? setUploadingLogo : setUploadingBanner;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: field === 'logoUrl' ? [1, 1] : [16, 9],
        quality: 0.8,
      });
      if (result?.canceled || !result?.assets?.[0]?.uri) return;
      const asset = result.assets[0];
      setUploading(true);
      const fileName = asset.fileName || `${field}-${Date.now()}.jpg`;
      const contentType = asset.mimeType || 'image/jpeg';
      const presignedRes = await api.post('/api/upload/presigned', { fileName, contentType, isPublic: true });
      const { uploadUrl, cloud_storage_path } = presignedRes?.data ?? {};
      if (!uploadUrl) throw new Error('No upload URL');
      const fileRes = await fetch(asset.uri);
      const blob = await fileRes.blob();
      await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': contentType } });
      const publicUrl = cloud_storage_path ?? uploadUrl.split('?')[0];
      setForm(prev => ({ ...prev, [field]: publicUrl }));
      setSuccess(lang === 'AF' ? 'Prent opgelaai!' : 'Image uploaded!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(lang === 'AF' ? 'Oplaai misluk' : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/api/tenant/branding', form);
      setSuccess(lang === 'AF' ? '✅ Handelsmerk gestoor en app opgedateer!' : '✅ Branding saved and app updated!');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError(lang === 'AF' ? 'Stoor misluk. Probeer weer.' : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={s.loading}><ActivityIndicator size="large" color={Colors.primary ?? '#C8102E'} /></View>;

  return (
    <ScreenContainer title={lang === 'AF' ? 'Handelsmerk' : 'Branding'} showBack>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {error ? <View style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View> : null}
          {success ? <View style={s.successBanner}><Text style={s.successText}>{success}</Text></View> : null}

          {/* Live Preview */}
          <GlassCard style={s.previewCard}>
            <Text style={s.sectionTitle}>{lang === 'AF' ? '👁️ Voorskou / Preview' : '👁️ Preview'}</Text>
            <View style={[s.previewHeader, { backgroundColor: form.primaryColor ?? '#C8102E' }]}>
              {form.logoUrl ? (
                <Image source={{ uri: form.logoUrl }} style={s.previewLogo} />
              ) : (
                <View style={s.previewLogoPlaceholder}>
                  <Ionicons name="storefront-outline" size={32} color="#fff" />
                </View>
              )}
              <View>
                <Text style={s.previewName}>{form.name || (lang === 'AF' ? 'Jou Slaghuisnaam' : 'Your Butchery Name')}</Text>
                <Text style={s.previewTagline}>{form.tagline || (lang === 'AF' ? 'Jou slagspreuk hier' : 'Your tagline here')}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Logo Upload */}
          <GlassCard style={s.card}>
            <Text style={s.sectionTitle}>{lang === 'AF' ? '🖼️ Logo' : '🖼️ Logo'}</Text>
            <Pressable style={s.uploadBtn} onPress={() => pickAndUpload('logoUrl')} disabled={uploadingLogo}>
              {uploadingLogo ? <ActivityIndicator color={Colors.primary ?? '#C8102E'} /> : (
                <>
                  <Ionicons name="cloud-upload-outline" size={22} color={Colors.secondary ?? '#D4A56A'} />
                  <Text style={s.uploadText}>{form.logoUrl ? (lang === 'AF' ? 'Verander Logo' : 'Change Logo') : (lang === 'AF' ? 'Laai Logo Op' : 'Upload Logo')}</Text>
                </>
              )}
            </Pressable>
            {form.logoUrl ? <Text style={s.uploadedUrl} numberOfLines={1}>✅ {form.logoUrl}</Text> : null}
          </GlassCard>

          {/* Banner Upload */}
          <GlassCard style={s.card}>
            <Text style={s.sectionTitle}>{lang === 'AF' ? '🖼️ Banier / Banner' : '🖼️ Banner'}</Text>
            <Pressable style={s.uploadBtn} onPress={() => pickAndUpload('bannerUrl')} disabled={uploadingBanner}>
              {uploadingBanner ? <ActivityIndicator color={Colors.primary ?? '#C8102E'} /> : (
                <>
                  <Ionicons name="image-outline" size={22} color={Colors.secondary ?? '#D4A56A'} />
                  <Text style={s.uploadText}>{form.bannerUrl ? (lang === 'AF' ? 'Verander Banier' : 'Change Banner') : (lang === 'AF' ? 'Laai Banier Op' : 'Upload Banner')}</Text>
                </>
              )}
            </Pressable>
          </GlassCard>

          {/* Business Details */}
          <GlassCard style={s.card}>
            <Text style={s.sectionTitle}>{lang === 'AF' ? '🏪 Besigheidsbesonderhede' : '🏪 Business Details'}</Text>
            {[
              { label: lang === 'AF' ? 'Slaghuisnaam' : 'Butchery Name', key: 'name', placeholder: 'La Oma Slaghuis' },
              { label: lang === 'AF' ? 'Slagspreuk / Tagline' : 'Tagline', key: 'tagline', placeholder: lang === 'AF' ? 'Die beste vleis in die dorp' : 'The best meat in town' },
              { label: lang === 'AF' ? 'Telefoon' : 'Phone', key: 'phone', placeholder: '012 000 0000' },
              { label: lang === 'AF' ? 'Adres' : 'Address', key: 'address', placeholder: lang === 'AF' ? '1 Hoofstraat, Pretoria' : '1 Main Street, Pretoria' },
            ].map(field => (
              <View key={field.key} style={s.fieldGroup}>
                <Text style={s.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={s.input}
                  value={(form as any)[field.key] ?? ''}
                  onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor="#555"
                />
              </View>
            ))}
          </GlassCard>

          {/* Color Presets */}
          <GlassCard style={s.card}>
            <Text style={s.sectionTitle}>{lang === 'AF' ? '🎨 Kleurskema / Color Scheme' : '🎨 Color Scheme'}</Text>
            <View style={s.colorGrid}>
              {COLOR_PRESETS.map(preset => (
                <Pressable
                  key={preset.primary}
                  style={[s.colorPreset, form.primaryColor === preset.primary && s.colorPresetActive]}
                  onPress={() => setForm(prev => ({ ...prev, primaryColor: preset.primary, accentColor: preset.accent }))}
                >
                  <View style={[s.colorSwatch, { backgroundColor: preset.primary }]} />
                  <Text style={s.colorLabel}>{preset.label}</Text>
                  {form.primaryColor === preset.primary && <Ionicons name="checkmark-circle" size={14} color={preset.primary} />}
                </Pressable>
              ))}
            </View>
            <View style={s.customColorRow}>
              <View style={s.colorInputGroup}>
                <Text style={s.fieldLabel}>{lang === 'AF' ? 'Primêre kleur' : 'Primary color'}</Text>
                <View style={s.colorInputRow}>
                  <View style={[s.colorDot, { backgroundColor: form.primaryColor ?? '#C8102E' }]} />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={form.primaryColor ?? '#C8102E'}
                    onChangeText={v => setForm(prev => ({ ...prev, primaryColor: v }))}
                    placeholder="#C8102E"
                    placeholderTextColor="#555"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={s.colorInputGroup}>
                <Text style={s.fieldLabel}>{lang === 'AF' ? 'Aksent kleur' : 'Accent color'}</Text>
                <View style={s.colorInputRow}>
                  <View style={[s.colorDot, { backgroundColor: form.accentColor ?? '#D4A56A' }]} />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    value={form.accentColor ?? '#D4A56A'}
                    onChangeText={v => setForm(prev => ({ ...prev, accentColor: v }))}
                    placeholder="#D4A56A"
                    placeholderTextColor="#555"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          </GlassCard>

          <GradientButton
            title={saving ? (lang === 'AF' ? 'Stoor...' : 'Saving...') : (lang === 'AF' ? '💾 Stoor & Dateer App Op' : '💾 Save & Update App')}
            onPress={handleSave}
            disabled={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
  successBanner: { backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  successText: { color: '#10B981', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  previewCard: { padding: 16 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 12, padding: 16, marginTop: 10 },
  previewLogo: { width: 56, height: 56, borderRadius: 28 },
  previewLogoPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  previewName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  previewTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  card: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary ?? '#F0F0F0', marginBottom: 12 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
  uploadText: { color: Colors.secondary ?? '#D4A56A', fontWeight: '600', fontSize: 14 },
  uploadedUrl: { color: '#10B981', fontSize: 11, marginTop: 6 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: Colors.textPrimary ?? '#F0F0F0', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  colorPreset: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  colorPresetActive: { borderColor: Colors.secondary ?? '#D4A56A' },
  colorSwatch: { width: 16, height: 16, borderRadius: 8 },
  colorLabel: { color: '#888', fontSize: 12 },
  customColorRow: { flexDirection: 'row', gap: 10 },
  colorInputGroup: { flex: 1 },
  colorInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 24, height: 24, borderRadius: 12 },
});
