import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';
import api from '@/lib/api';

interface Message { id: string; role: 'user'|'assistant'; content: string; }

export default function SupportScreen() {
  const { language } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([{ id: '0', role: 'assistant', content: t('supportGreeting', language) }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, msg]); setInput(''); setLoading(true);
    try {
      const { data } = await api.post('/api/support/message', { message: msg.content, history });
      setMessages(prev => [...prev, { id: Date.now().toString()+'a', role: 'assistant', content: data.response }]);
    } catch { setMessages(prev => [...prev, { id: Date.now().toString()+'e', role: 'assistant', content: 'Sorry, something went wrong.' }]); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}><Text style={styles.title}>💬 {t('supportTitle', language)}</Text></View>
      <FlatList data={messages} keyExtractor={m => m.id} contentContainerStyle={styles.msgs}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.ai]}>
            <Text style={[styles.text, item.role === 'user' ? styles.userText : styles.aiText]}>{item.content}</Text>
          </View>
        )} />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Type a message..." placeholderTextColor={Colors.textSecondary} value={input} onChangeText={setInput} />
        <TouchableOpacity style={styles.send} onPress={send}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  msgs: { padding: Spacing.md, gap: Spacing.sm },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: Spacing.md },
  user: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  ai: { alignSelf: 'flex-start', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  text: { fontSize: 15 },
  userText: { color: '#fff' },
  aiText: { color: Colors.textPrimary },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.elevated, borderRadius: Radius.md, paddingHorizontal: Spacing.md, color: Colors.textPrimary, fontSize: 15, height: 48, borderWidth: 1, borderColor: Colors.border },
  send: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
});
