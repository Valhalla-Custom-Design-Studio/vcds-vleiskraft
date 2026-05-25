import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.railway.app";

interface Message { id: string; role: "user" | "assistant"; text: string; }

export default function VleisAIScreen() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", role: "assistant", text: lang === "af" ? "Hallo! Ek is VleisAI™. Vra my enigiets oor vleis, snitte, resepte of pryse. 🥩" : "Hello! I am VleisAI™. Ask me anything about meat, cuts, recipes or prices. 🥩" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send() {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/vleisai/chat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const d = await r.json();
      setMessages(m => [...m, { id: (Date.now()+1).toString(), role: "assistant", text: d.reply || "VleisAI™ is processing..." }]);
    } catch {
      setMessages(m => [...m, { id: (Date.now()+1).toString(), role: "assistant", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd(), 100);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}><Text style={styles.title}>{t("ai.title")}</Text></View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, item.role === "user" ? styles.userText : styles.aiText]}>{item.text}</Text>
          </View>
        )}
      />
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginBottom: 8 }} />}
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder={t("ai.placeholder")} value={input} onChangeText={setInput} onSubmitEditing={send} returnKeyType="send" />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: Colors.white },
  bubble: { maxWidth: "80%", borderRadius: 16, padding: 12, marginBottom: 8 },
  userBubble: { alignSelf: "flex-end", backgroundColor: Colors.primary },
  aiBubble: { alignSelf: "flex-start", backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 14 },
  userText: { color: Colors.white },
  aiText: { color: Colors.text },
  inputRow: { flexDirection: "row", padding: 12, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: Colors.text },
  sendBtn: { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
});
