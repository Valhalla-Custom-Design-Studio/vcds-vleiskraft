import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API = process.env.EXPO_PUBLIC_API_URL || "https://api.vleiskraft.co.za";
const Colors = { bg: "#0A0A0A", surface: "#141414", primary: "#C0392B", text: "#FFFFFF", textMuted: "#888", inputBg: "#1E1E1E", inputBorder: "#333" };

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      await SecureStore.setItemAsync("vk_token", res.data.token);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login Failed", e?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.logo}>🥩 VleisKraft™</Text>
      <Text style={s.subtitle}>B2B Meat Marketplace</Text>
      <TextInput style={s.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text style={s.link}>New supplier? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, justifyContent: "center", padding: 24 },
  logo: { fontSize: 32, fontWeight: "bold", color: Colors.primary, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: "center", marginBottom: 40 },
  input: { backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, padding: 16, color: Colors.text, marginBottom: 16, fontSize: 16 },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: Colors.primary, textAlign: "center", fontSize: 14 },
});
