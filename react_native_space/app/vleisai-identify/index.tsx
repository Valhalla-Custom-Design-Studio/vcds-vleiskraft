import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { colors } from '../../src/theme/colors';

export default function VleisAIIdentifyScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function identify() {
    if (!imageUri) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', { uri: imageUri, name: 'meat.jpg', type: 'image/jpeg' } as any);
      const res = await api.post('/vleisai/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch {
      Alert.alert('Error', 'Could not identify meat cut');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer title="VleisAI™ Identify">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Snap or upload a photo to identify any meat cut</Text>
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
          )}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={styles.iconBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.iconBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {imageUri && (
          <TouchableOpacity style={styles.identifyBtn} onPress={identify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.identifyBtnText}>Identify Cut</Text>}
          </TouchableOpacity>
        )}
        {result && (
          <GlassCard style={styles.resultCard}>
            <Text style={styles.resultTitle}>{result.cut_name || 'Unknown Cut'}</Text>
            <Text style={styles.resultSub}>Confidence: {Math.round((result.confidence || 0) * 100)}%</Text>
            {result.description ? <Text style={styles.resultDesc}>{result.description}</Text> : null}
            {result.cooking_tips ? (
              <>
                <Text style={styles.sectionLabel}>Cooking Tips</Text>
                <Text style={styles.resultDesc}>{result.cooking_tips}</Text>
              </>
            ) : null}
            {result.price_range ? <Text style={styles.priceRange}>Est. price: {result.price_range}</Text> : null}
          </GlassCard>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  imageBox: {
    width: 280, height: 280, borderRadius: 16, backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  btnRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  iconBtn: { alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 12, minWidth: 80 },
  iconBtnText: { fontSize: 12, color: colors.text, marginTop: 4 },
  identifyBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: 12, marginBottom: 24,
  },
  identifyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultCard: { width: '100%', padding: 16 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  resultSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  sectionLabel: { fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 4 },
  resultDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  priceRange: { marginTop: 12, fontSize: 14, fontWeight: '600', color: colors.primary },
});
