import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadToR2 } from '../services/r2Storage';
import { track, Events } from '../services/posthog';
import { captureError } from '../services/sentry';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

interface CutResult {
  cut: string;
  confidence: number;
  description: string;
  cookingMethods: string[];
  priceRange: string;
  afrikaansName: string;
}

export default function CarcassAIScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<CutResult | null>(null);

  async function pickImage(source: 'camera' | 'gallery') {
    const fn = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      await analyseImage(res.assets[0].uri);
    }
  }

  async function analyseImage(uri: string) {
    setIsAnalysing(true);
    try {
      // Upload to R2 first
      const token = ''; // pulled from auth context in real impl
      const { url } = await uploadToR2(uri, 'carcass', token);

      // Send to VleisAI™ for identification
      const res = await fetch(`${API_BASE}/api/vleisai/identify-cut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!res.ok) throw new Error('Identifikasie misluk');
      const data: CutResult = await res.json();
      setResult(data);
      track(Events.CARCASS_AI_USED, { cut: data.cut, confidence: data.confidence });
    } catch (e) {
      captureError(e, { screen: 'CarcassAI' });
      Alert.alert('Identifikasie misluk', 'Probeer 'n duideliker foto');
    } finally {
      setIsAnalysing(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🥩 Karkass AI™</Text>
      <Text style={styles.subtitle}>Neem 'n foto van enige vleissnit — ons identifiseer dit onmiddellik</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera" size={64} color="#6B21A8" />
          <Text style={styles.placeholderText}>Geen foto gekies nie</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage('camera')}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage('gallery')}>
          <Ionicons name="images" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Galery</Text>
        </TouchableOpacity>
      </View>

      {isAnalysing && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#D4A017" />
          <Text style={styles.loadingText}>VleisAI™ analiseer jou snit...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.cutName}>{result.cut}</Text>
            <Text style={styles.afrikaans}>({result.afrikaansName})</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{Math.round(result.confidence * 100)}% seker</Text>
            </View>
          </View>
          <Text style={styles.description}>{result.description}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>🍳 Kookmetodes</Text>
          <View style={styles.tagRow}>
            {result.cookingMethods.map((m, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{m}</Text></View>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>💰 Prysreeks</Text>
          <Text style={styles.priceText}>{result.priceRange}</Text>
          <TouchableOpacity style={styles.orderBtn}>
            <Text style={styles.orderBtnText}>🛒 Bestel Hierdie Snit</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Hoe werk dit?</Text>
        <Text style={styles.infoText}>VleisAI™ gebruik gevorderde beeldherkenning om meer as 50 vleissnitte te identifiseer — van T-bone tot brisket, van lamsrib tot varkpens.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0612' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F5F0FF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#C4B5D4', marginBottom: 24 },
  preview: { width: '100%', height: 240, borderRadius: 16, marginBottom: 16 },
  placeholder: { width: '100%', height: 200, backgroundColor: 'rgba(107,33,168,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(107,33,168,0.3)', borderStyle: 'dashed' },
  placeholderText: { color: '#8B7BA0', marginTop: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6B21A8', borderRadius: 12, padding: 14 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  loadingCard: { alignItems: 'center', padding: 24, gap: 12 },
  loadingText: { color: '#C4B5D4' },
  resultCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resultHeader: { marginBottom: 12 },
  cutName: { fontSize: 22, fontWeight: 'bold', color: '#F5F0FF' },
  afrikaans: { fontSize: 14, color: '#C4B5D4', marginBottom: 8 },
  confidenceBadge: { backgroundColor: '#22C55E', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  confidenceText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  description: { color: '#C4B5D4', fontSize: 14, lineHeight: 22 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },
  sectionLabel: { color: '#D4A017', fontWeight: 'bold', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: 'rgba(107,33,168,0.3)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#C4B5D4', fontSize: 12 },
  priceText: { color: '#F5F0FF', fontSize: 16, fontWeight: 'bold' },
  orderBtn: { backgroundColor: '#D4A017', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  orderBtnText: { color: '#0B0612', fontWeight: 'bold', fontSize: 16 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  infoTitle: { color: '#D4A017', fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#8B7BA0', fontSize: 13, lineHeight: 20 },
});
