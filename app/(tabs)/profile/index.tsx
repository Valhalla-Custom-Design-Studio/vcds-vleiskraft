import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../../../src/i18n";

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

const GOLD = "#C9A84C";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#FFFFFF";
const MUTED = "#888888";

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsRow = ({
  icon, label, value, onPress, danger = false,
}: {
  icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.rowIcon, { backgroundColor: danger ? "rgba(239,68,68,0.12)" : "rgba(201,168,76,0.12)" }]}>
      <Ionicons name={icon as any} size={18} color={danger ? "#EF4444" : GOLD} />
    </View>
    <Text style={[styles.rowLabel, danger && { color: "#EF4444" }]}>{label}</Text>
    {value && <Text style={styles.rowValue}>{value}</Text>}
    {!danger && <Ionicons name="chevron-forward" size={16} color="#444" style={{ marginLeft: "auto" }} />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [profile, setProfile] = useState({
    first_name: "", last_name: "", email: "", company: "", vat_number: "", phone: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const token = await AsyncStorage.getItem("token");
      const r = await fetch(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      if (r.ok) Alert.alert("✓", "Profiel gestoor");
      else Alert.alert("Fout", "Kon nie stoor nie");
    } catch { Alert.alert("Fout", "Kon nie stoor nie"); }
  }

  async function logout() {
    await AsyncStorage.clear();
    router.replace("/auth/login");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={GOLD} />
          </View>
          <Text style={styles.name}>
            {profile.first_name ? `${profile.first_name} ${profile.last_name}` : "My Profiel"}
          </Text>
          {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        </View>

        {/* REKENING */}
        <SectionHeader title="REKENING" />
        <View style={styles.card}>
          {[
            { key: "first_name", label: "Naam", icon: "person-outline" },
            { key: "last_name", label: "Van", icon: "person-outline" },
            { key: "company", label: "Maatskappy", icon: "business-outline" },
            { key: "vat_number", label: "BTW Nommer", icon: "document-text-outline" },
            { key: "phone", label: "Telefoon", icon: "call-outline" },
          ].map((field, i, arr) => (
            <View key={field.key}>
              <View style={styles.inputRow}>
                <Ionicons name={field.icon as any} size={16} color={MUTED} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={(profile as any)[field.key]}
                    onChangeText={v => setProfile(p => ({ ...p, [field.key]: v }))}
                    placeholderTextColor="#444"
                  />
                </View>
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Stoor Veranderinge</Text>
        </TouchableOpacity>

        {/* INSTELLINGS */}
        <SectionHeader title="INSTELLINGS" />
        <View style={styles.card}>
          <SettingsRow
            icon="language-outline"
            label="Taal"
            value={lang === "en" ? "English" : "Afrikaans"}
            onPress={toggleLang}
          />
        </View>

        {/* GEMEENSKAP */}
        <SectionHeader title="GEMEENSKAP" />
        <View style={styles.card}>
          <SettingsRow icon="star-outline" label="Opgradeer na Pro" onPress={() => router.push("/subscriptions")} />
          <View style={styles.divider} />
          <SettingsRow icon="help-circle-outline" label="Hulp & Ondersteuning" onPress={() => {}} />
        </View>

        {/* REKENING AKSIES */}
        <SectionHeader title="REKENING AKSIES" />
        <View style={styles.card}>
          <SettingsRow icon="log-out-outline" label="Teken Uit" onPress={logout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(201,168,76,0.12)",
    borderWidth: 1, borderColor: `${GOLD}44`,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  name: { fontSize: 20, fontWeight: "700", color: TEXT, marginBottom: 4 },
  email: { fontSize: 13, color: MUTED },
  sectionHeader: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
    textTransform: "uppercase", color: GOLD,
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16, backgroundColor: SURFACE,
    borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    overflow: "hidden",
  },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  inputLabel: { fontSize: 11, color: MUTED, marginBottom: 2 },
  input: { fontSize: 15, color: TEXT, padding: 0 },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rowLabel: { fontSize: 15, color: TEXT, flex: 1 },
  rowValue: { fontSize: 13, color: MUTED, marginRight: 8 },
  saveBtn: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: GOLD,
    borderRadius: 12, paddingVertical: 14, alignItems: "center",
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#000" },
});
