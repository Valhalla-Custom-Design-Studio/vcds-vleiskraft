import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../../src/i18n';
import { useSubscription } from '../../../src/hooks/useSubscription';
import { ButcherPaywallGate } from '../../../src/components/ButcherPaywallGate';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.onrender.com';
const GOLD = '#C9A84C';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = '#888888';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

function VleisGPTContent() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API}/api/vleisai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: userMsg.content, history: updated.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: data.reply || data.message || 'Geen antwoord.' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Fout — probeer weer.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LinearGradient colors={['#0A0A0A', '#111111']} style={{ flex: 1 }}>
          <View style={s.header}>
            <Text style={s.title}>🤖 VleisGPT™</Text>
            <Text style={s.sub}>{lang === 'af' ? 'AI-aangedrewe vleiskenner' : 'AI-powered meat expert'}</Text>
          </View>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyIcon}>🥩</Text>
                <Text style={s.emptyText}>{lang === 'af' ? 'Vra my enigiets oor vleis...' : 'Ask me anything about meat...'}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.aiBubble]}>
                <Text style={[s.bubbleText, item.role === 'user' && { color: '#000' }]}>{item.content}</Text>
              </View>
            )}
          />
          {loading && <ActivityIndicator color={GOLD} style={{ marginBottom: 8 }} />}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={input}
              onChangeText={setInput}
              placeholder={lang === 'af' ? 'Tik jou vraag...' : 'Type your question...'}
              placeholderTextColor={MUTED}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity style={s.sendBtn} onPress={send} disabled={loading}>
              <Ionicons name="send" size={20} color={loading ? MUTED : '#000'} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function VleisGPTScreen() {
  const [token, setToken] = React.useState<string | null>(null);
  const [butcherTier, setButcherTier] = React.useState<any>('free');
  React.useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
    AsyncStorage.getItem('plan').then(p => { if (p) setButcherTier(p); });
  }, []);

  return (
    <ButcherPaywallGate required="starter" currentTier={butcherTier} featureName="VleisGPT™">
      <VleisGPTContent />
    </ButcherPaywallGate>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  title: { color: GOLD, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  sub: { color: MUTED, fontSize: 13, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: MUTED, fontSize: 15, textAlign: 'center' },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: GOLD },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  bubbleText: { color: TEXT, fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: BORDER },
  input: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    color: TEXT, fontSize: 14, borderWidth: 1, borderColor: BORDER,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
});
