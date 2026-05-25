import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, Alert, Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { track, Events } from '../services/posthog';
import { captureError } from '../services/sentry';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

interface ParsedOrder {
  items: { name: string; qty: number; unit: string }[];
  notes: string;
}

export default function VoiceOrderScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Mikrofoon toegang geweier'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setTranscript('');
      setParsedOrder(null);
      startPulse();
    } catch (e) {
      captureError(e, { screen: 'VoiceOrder', action: 'startRecording' });
      Alert.alert('Kon nie opneem nie', String(e));
    }
  }

  async function stopRecording() {
    if (!recording) return;
    stopPulse();
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error('No recording URI');

      // Upload audio to API for transcription
      const formData = new FormData();
      formData.append('audio', { uri, name: 'order.m4a', type: 'audio/m4a' } as any);

      const res = await fetch(`${API_BASE}/api/voice-order/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setTranscript(data.transcript || '');
      setParsedOrder(data.parsedOrder || null);
      track(Events.VOICE_ORDER_USED, { itemCount: data.parsedOrder?.items?.length });
    } catch (e) {
      captureError(e, { screen: 'VoiceOrder', action: 'stopRecording' });
      Alert.alert('Transkripsie misluk', String(e));
    } finally {
      setIsProcessing(false);
    }
  }

  async function confirmOrder() {
    if (!parsedOrder) return;
    try {
      const res = await fetch(`${API_BASE}/api/voice-order/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedOrder.items, notes: parsedOrder.notes }),
      });
      if (!res.ok) throw new Error('Order failed');
      Alert.alert('✅ Bestelling Geplaas!', 'Jou stem-bestelling is ontvang.');
      setParsedOrder(null);
      setTranscript('');
    } catch (e) {
      captureError(e, { screen: 'VoiceOrder', action: 'confirmOrder' });
      Alert.alert('Bestelling misluk', String(e));
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🎙️ Stem Bestelling™</Text>
      <Text style={styles.subtitle}>Praat jou bestelling — ons verstaan Afrikaans & Engels</Text>

      <View style={styles.micContainer}>
        <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }] }]} />
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={48} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {isRecording ? '🔴 Opname... Tik om te stop' : isProcessing ? 'Verwerk...' : 'Tik om te begin praat'}
      </Text>

      {isProcessing && <ActivityIndicator size="large" color="#D4A017" style={{ marginTop: 24 }} />}

      {transcript ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Transkripsie</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {parsedOrder ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛒 Geparseerde Bestelling</Text>
          {parsedOrder.items.map((item, i) => (
            <Text key={i} style={styles.itemText}>• {item.qty} {item.unit} {item.name}</Text>
          ))}
          {parsedOrder.notes ? <Text style={styles.notesText}>Nota: {parsedOrder.notes}</Text> : null}
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmOrder}>
            <Text style={styles.confirmBtnText}>✅ Bevestig Bestelling</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.examplesCard}>
        <Text style={styles.cardTitle}>💡 Voorbeelde</Text>
        <Text style={styles.exampleText}>"Ek wil graag 2kg beesvleis en 1kg hoender bestel"</Text>
        <Text style={styles.exampleText}>"Give me 500g boerewors and a pack of ribs"</Text>
        <Text style={styles.exampleText}>"Ek wil 3 T-bone steaks hê, medium dik gesny"</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0612' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F5F0FF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#C4B5D4', textAlign: 'center', marginBottom: 40 },
  micContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  micRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(212,160,23,0.2)' },
  micButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#6B21A8', alignItems: 'center', justifyContent: 'center' },
  micButtonActive: { backgroundColor: '#DC2626' },
  hint: { color: '#C4B5D4', fontSize: 14, marginBottom: 24 },
  card: { width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { color: '#D4A017', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  transcriptText: { color: '#F5F0FF', fontSize: 14, lineHeight: 22 },
  itemText: { color: '#F5F0FF', fontSize: 14, marginBottom: 4 },
  notesText: { color: '#C4B5D4', fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  confirmBtn: { backgroundColor: '#22C55E', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  examplesCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  exampleText: { color: '#8B7BA0', fontSize: 13, marginBottom: 6, fontStyle: 'italic' },
});
