import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

export default function VleisGPTScreen() {
  const { language } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: t('vleisgptGreeting', language) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/vleisgpt/chat', { message: userMsg.content, history });
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Oops! Something went wrong. Try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>🥩 VleisGPT™</Text>
        <Text style={styles.sub}>Jou AI slagter assistent</Text>
      </View>
      <FlatList
        ref={flatRef} data={messages} keyExtractor={m => m.id}
        contentContainerStyle={styles.msgs}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.aiText]}>{item.content}</Text>
          </View>
        )}
      />
      {loading && (
        <View style={styles.typingRow}>
          <Text style={styles.typing}>VleisGPT tik...</Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input} placeholder={t('vleisgptPlaceholder', language)}
          placeholderTextColor={Colors.textSecondary} value={input} onChangeText={setInput}
          multiline returnKeyType="send" onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13 },
  msgs: { padding: Spacing.md, gap: Spacing.sm },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xs },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: Colors.textPrimary },
  typingRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  typing: { color: Colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.elevated, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: Colors.textPrimary, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 44, height: 44, backgroundColor: Colors.primary, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
});
