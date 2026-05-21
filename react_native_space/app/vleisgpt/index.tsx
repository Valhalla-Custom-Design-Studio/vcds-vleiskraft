import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import api from '../../src/services/api';
import { Colors, Spacing, FontSize, Radius } from '../../src/constants/theme';
import ScreenContainer from '../../src/components/ScreenContainer';
import GlassCard from '../../src/components/GlassCard';

interface Message { role: string; content: string; suggestedProducts?: any[] }

export default function VleisAIScreen() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: lang === 'AF'
      ? 'Hallo! Ek is VleisAI™ — jou slim slaghuisassistent. Vra my enigiets oor vleis, braai, resepte of bestellings! 🥩'
      : 'Hello! I am VleisAI™ — your smart butchery assistant. Ask me anything about meat, braai, recipes or orders! 🥩'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      if (Platform.OS !== 'web') Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(() => {});
      const res = await api.post('/api/chat', { message: msg });
      const data = res?.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data?.reply ?? (lang === 'AF' ? 'Jammer, ek kon nie antwoord nie. Probeer weer.' : 'Sorry, I could not respond. Please try again.'),
        suggestedProducts: data?.suggestedProducts ?? []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'AF' ? 'Verbindingsfout. Probeer asseblief weer.' : 'Connection error. Please try again.'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, lang]);

  const handleProductPress = (product: any) => {
    if (product?.id) {
      router.push(`/shop/product/${product.id}` as never);
    }
  };

  const renderMsg = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.role === 'assistant' && (
        <View style={styles.botHeader}>
          <Text style={styles.botIcon}>🥩</Text>
          <Text style={styles.botLabel}>VleisAI™</Text>
        </View>
      )}
      <Text style={[styles.msgText, item.role === 'user' && styles.userMsgText]}>
        {item?.content ?? ''}
      </Text>
      {/* Product suggestions — tappable, navigate to product screen */}
      {(item?.suggestedProducts?.length ?? 0) > 0 && (
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>
            {lang === 'AF' ? '🛒 Aanbevole produkte:' : '🛒 Suggested products:'}
          </Text>
          {item.suggestedProducts!.map((p: any, i: number) => (
            <Pressable
              key={i}
              style={styles.sugPill}
              onPress={() => handleProductPress(p)}
              accessibilityRole="button"
              accessibilityLabel={`View product: ${lang === 'AF' ? p?.nameAf : p?.nameEn ?? p?.nameAf}`}
            >
              <Text style={styles.sugText}>
                {lang === 'AF' ? p?.nameAf : p?.nameEn ?? p?.nameAf ?? p?.name ?? ''}
              </Text>
              {p?.price && <Text style={styles.sugPrice}>R{p.price}</Text>}
              <Ionicons name="chevron-forward" size={14} color={Colors.secondary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer title="VleisAI™" showBack>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderMsg}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={Colors.secondary} />
                <Text style={styles.typingText}>VleisAI™ {lang === 'AF' ? 'dink...' : 'is thinking...'}</Text>
              </View>
            ) : null
          }
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={lang === 'AF' ? 'Vra VleisAI™ iets...' : 'Ask VleisAI™ something...'}
            placeholderTextColor={Colors.textSecondary ?? '#888'}
            onSubmitEditing={send}
            returnKeyType="send"
            multiline={false}
            accessibilityLabel="Chat input"
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={20} color={!input.trim() || loading ? '#555' : '#fff'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '88%', borderRadius: 18, padding: 14, marginBottom: 10 },
  aiBubble: { backgroundColor: 'rgba(200,16,46,0.08)', alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(200,16,46,0.15)' },
  userBubble: { backgroundColor: Colors.primary ?? '#C8102E', alignSelf: 'flex-end' },
  botHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  botIcon: { fontSize: 16 },
  botLabel: { color: Colors.secondary ?? '#D4A56A', fontWeight: '700', fontSize: 13 },
  msgText: { color: Colors.textPrimary ?? '#F0F0F0', fontSize: 15, lineHeight: 22 },
  userMsgText: { color: '#fff' },
  suggestions: { marginTop: 10, gap: 6 },
  suggestionsLabel: { color: Colors.secondary ?? '#D4A56A', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  sugPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(212,165,106,0.12)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(212,165,106,0.25)' },
  sugText: { color: Colors.secondary ?? '#D4A56A', fontSize: 13, fontWeight: '600', flex: 1 },
  sugPrice: { color: Colors.textSecondary ?? '#888', fontSize: 12, marginRight: 4 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  typingText: { color: Colors.textSecondary ?? '#888', fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', color: Colors.textPrimary ?? '#F0F0F0', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary ?? '#C8102E', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
});
