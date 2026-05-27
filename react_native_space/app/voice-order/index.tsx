import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GradientButton } from '../../src/components/GradientButton';
import { colors } from '../../src/theme/colors';

export default function VoiceOrderScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  }

  async function stopAndProcess() {
    if (!recording) return;
    setIsRecording(false);
    setIsProcessing(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    try {
      const formData = new FormData();
      formData.append('audio', { uri, name: 'order.m4a', type: 'audio/m4a' } as any);
      const res = await api.post('/voice-order/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscript(res.data.transcript || '');
      setOrderItems(res.data.items || []);
    } catch {
      Alert.alert('Error', 'Could not process voice order');
    } finally {
      setIsProcessing(false);
    }
  }

  async function confirmOrder() {
    try {
      await api.post('/orders', { items: orderItems, source: 'voice' });
      Alert.alert('Order Placed', 'Your voice order has been submitted!', [
        { text: 'OK', onPress: () => router.push('/orders') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not place order');
    }
  }

  return (
    <ScreenContainer title="Voice Order">
      <View style={styles.container}>
        <Text style={styles.subtitle}>Tap the mic and speak your order</Text>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micActive]}
          onPress={isRecording ? stopAndProcess : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={48} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.hint}>
          {isRecording ? 'Recording… tap to stop' : isProcessing ? 'Processing…' : 'Tap to start'}
        </Text>
        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Heard:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        ) : null}
        {orderItems.length > 0 && (
          <View style={styles.itemsBox}>
            <Text style={styles.itemsLabel}>Order Items:</Text>
            {orderItems.map((item, i) => (
              <Text key={i} style={styles.itemRow}>• {item.name} × {item.qty}</Text>
            ))}
            <GradientButton title="Confirm Order" onPress={confirmOrder} style={styles.confirmBtn} />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 32 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40 },
  micButton: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  micActive: { backgroundColor: '#e53935' },
  hint: { marginTop: 16, fontSize: 14, color: colors.textSecondary },
  transcriptBox: { marginTop: 24, padding: 16, backgroundColor: colors.surface, borderRadius: 12, width: '100%' },
  transcriptLabel: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  transcriptText: { color: colors.textSecondary, fontSize: 14 },
  itemsBox: { marginTop: 16, width: '100%' },
  itemsLabel: { fontWeight: '700', color: colors.text, marginBottom: 8 },
  itemRow: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  confirmBtn: { marginTop: 16 },
});
