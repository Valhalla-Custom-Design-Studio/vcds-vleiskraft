import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useI18n } from "../../../src/i18n";

const GOLD = "#C9A84C";
const BG = "#0A0A0A";
const SURFACE = "#141414";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#FFFFFF";
const MUTED = "#888888";

const TIER_COLORS: Record<string, string> = {
  consumer: "#4CAF50",
  freemium: "#888888",
  starter: "#2196F3",
  pro: "#9C27B0",
  business: "#FF9800",
  enterprise: "#C9A84C",
};

function Row({ icon, label, onPress, danger }: any) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress}>
      <View style={s.rowLeft}>
        <Ionicons name={icon} size={20} color={danger ? "#E74C3C" : GOLD} />
        <Text style={[s.rowLabel, danger && { color: "#E74C3C" }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={MUTED} />
    </TouchableOpacity>
  );
}

export default function ProfileTab() {
  const { t, lang, toggleLang } = useI18n();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then(u => { if (u) setUser(JSON.parse(u)); });
  }, []);

  const tier = user?.tier ?? user?.subscription ?? "consumer";
  const tierColor = TIER_COLORS[tier] ?? GOLD;
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  async function logout() {
    Alert.alert(t("settings.logout"), lang === "af" ? "Is jy seker?" : "Are you sure?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"), style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["token", "user", "cart"]);
          router.replace("/auth/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <LinearGradient colors={["#1A1500", "#0A0A0A"]} style={s.header}>
          <View style={[s.avatar, { borderColor: tierColor }]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>{user ? `${user.firstName} ${user.lastName}` : "—"}</Text>
          <Text style={s.email}>{user?.email ?? "—"}</Text>
          <View style={[s.tierBadge, { backgroundColor: `${tierColor}22`, borderColor: tierColor }]}>
            <Text style={[s.tierText, { color: tierColor }]}>{tier.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
            <Text style={s.langText}>{lang === "en" ? "🇿🇦 Afrikaans" : "🇬🇧 English"}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Account */}
        <Text style={s.section}>{lang === "af" ? "Rekening" : "Account"}</Text>
        <View style={s.card}>
          <Row icon="person-outline" label={t("profile.editProfile")} onPress={() => router.push("/profile/index")} />
          <Row icon="card-outline" label={t("profile.paymentMethods")} onPress={() => router.push("/payments/index")} />
          <Row icon="location-outline" label={t("profile.savedAddresses")} onPress={() => {}} />
          <Row icon="star-outline" label={t("profile.subscription")} onPress={() => router.push("/subscriptions/index")} />
        </View>

        {/* Tools */}
        <Text style={s.section}>{lang === "af" ? "Gereedskap" : "Tools"}</Text>
        <View style={s.card}>
          <Row icon="book-outline" label={t("profile.myDiary")} onPress={() => router.push("/diary/index")} />
          <Row icon="list-outline" label={t("profile.shoppingList")} onPress={() => router.push("/shopping-list/index")} />
          <Row icon="call-outline" label={t("profile.emergencyContacts")} onPress={() => router.push("/emergency-contacts/index")} />
          <Row icon="trophy-outline" label={t("competitions.title")} onPress={() => router.push("/competitions/index")} />
          <Row icon="people-outline" label={t("stockvel.title")} onPress={() => router.push("/stockvel/index")} />
          <Row icon="calendar-outline" label={t("mealPlanner.title")} onPress={() => router.push("/meal-planner/index")} />
        </View>

        {/* Settings */}
        <Text style={s.section}>{t("settings.title")}</Text>
        <View style={s.card}>
          <Row icon="notifications-outline" label={t("settings.notifications")} onPress={() => {}} />
          <Row icon="shield-outline" label={t("settings.privacy")} onPress={() => {}} />
          <Row icon="document-text-outline" label={t("settings.terms")} onPress={() => {}} />
          <Row icon="help-circle-outline" label={t("settings.support")} onPress={() => {}} />
          <Row icon="log-out-outline" label={t("settings.logout")} onPress={logout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0A0A" },
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center", borderWidth: 2, marginBottom: 12 },
  avatarText: { color: GOLD, fontSize: 28, fontWeight: "800" },
  name: { color: TEXT, fontSize: 20, fontWeight: "800", marginBottom: 4 },
  email: { color: MUTED, fontSize: 13, marginBottom: 12 },
  tierBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1, marginBottom: 12 },
  tierText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  langBtn: { backgroundColor: "rgba(201,168,76,0.1)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(201,168,76,0.3)" },
  langText: { color: GOLD, fontSize: 13, fontWeight: "600" },
  section: { color: MUTED, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginTop: 24, marginBottom: 8, marginHorizontal: 20, textTransform: "uppercase" },
  card: { backgroundColor: SURFACE, borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { color: TEXT, fontSize: 14, fontWeight: "600" },
});
