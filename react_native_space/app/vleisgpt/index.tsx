import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Switch, ActivityIndicator
} from 'react-native';
import { useI18n } from '../../../src/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function VleisAIScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: lang === 'af'
        ? 'Hallo! Ek is VleisAI™. Vra my enigiets oor vleis, snitte, resepte of pryse. 🥩'
        : 'Hello! I am VleisAI™. Ask me anything about meat, cuts, recipes or prices. 🥩',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/vleisgpt/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, lang }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply ?? (lang === 'af' ? 'Fout — probeer weer.' : 'Error — please try again.'),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: lang === 'af' ? 'Verbindingsfout. Probeer weer.' : 'Connection error. Please try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header with Language Toggle ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VleisAI™</Text>
        <View style={styles.langRow} accessibilityRole="switch">
          <Text style={styles.langLabel}>EN</Text>
          <Switch
            value={lang === 'af'}
            onValueChange={toggleLang}
            trackColor={{ false: '#555', true: '#B22222' }}
            thumbColor="#fff"
            accessibilityLabel={lang === 'en' ? 'Switch to Afrikaans' : 'Skakel na Engels'}
          />
          <Text style={styles.langLabel}>AF</Text>
        </View>
      </View>

      {/* ── Chat Messages ── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.chatContent}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble,
          ]}>
            <Text style={[
              styles.bubbleText,
              item.role === 'user' ? styles.userText : styles.aiText,
            ]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#B22222" />
          <Text style={styles.typingText}>
            {lang === 'af' ? 'VleisAI™ tik...' : 'VleisAI™ is typing...'}
          </Text>
        </View>
      )}

      {/* ── Input Bar ── */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={
            lang === 'af'
              ? 'Vra oor vleis, snitte, resepte...'
              : 'Ask about meat, cuts, recipes...'
          }
          placeholderTextColor="#666"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          accessibilityLabel={lang === 'af' ? 'Tik jou vraag' : 'Type your question'}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim()}
          accessibilityRole="button"
          accessibilityLabel={lang === 'af' ? 'Stuur boodskap' : 'Send message'}
        >
          <Text style={styles.sendText}>
            {lang === 'af' ? 'Stuur' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  chatContent: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 10,
  },
  userBubble: { backgroundColor: '#B22222', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#2a2a2a', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#eee' },
  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  typingText: { color: '#888', fontSize: 13 },
  inputRow: {
    flexDirection: 'row', padding: 12, gap: 8,
    backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#333',
  },
  input: {
    flex: 1, backgroundColor: '#2a2a2a', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#B22222', borderRadius: 24,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#555' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
