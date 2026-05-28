import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Colors } from "../../../src/theme/colors";
import { useI18n } from "../../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

export default function ProfileScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", company: "", vat_number: "", phone: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setProfile(await r.json());
    } catch {}
  }

  async function save() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (r.ok) Alert.alert("✓", "Profile saved");
      else Alert.alert(t("common.error"), t("common.failedToSave"));
    } catch { Alert.alert(t("common.error"), t("common.failedToSave")); }
  }

  async function logout() {
    await AsyncStorage.clear();
    router.replace("/auth/login");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}><Text style={styles.title}>{t("profile.title")}</Text></View>
      <View style={styles.body}>
        {[
          { key: "first_name", label: t("auth.firstName") },
          { key: "last_name", label: t("auth.lastName") },
          { key: "company", label: t("profile.company") },
          { key: "vat_number", label: t("profile.vatNumber") },
          { key: "phone", label: t("profile.phone") },
        ].map(f => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput style={styles.input} value={(profile as any)[f.key]} onChangeText={v => setProfile(p => ({ ...p, [f.key]: v }))} />
          </View>
        ))}
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveBtnText}>{t("common.save")}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLang}><Text style={styles.langBtnText}>{lang === "en" ? "Switch to Afrikaans" : "Skakel na Engels"}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutText}>{t("settings.logout")}</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 56, backgroundColor: Colors.primary },
  title: { fontSize: 22, fontWeight: "700", color: Colors.white },
  body: { padding: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: 15, color: Colors.text, backgroundColor: Colors.surface },
  saveBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  langBtn: { backgroundColor: Colors.surface, padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8, borderWidth: 1, borderColor: Colors.border },
  langBtnText: { color: Colors.text, fontWeight: "600" },
  logoutBtn: { backgroundColor: "#FEE2E2", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 16 },
  logoutText: { color: Colors.error, fontWeight: "700" },
});
