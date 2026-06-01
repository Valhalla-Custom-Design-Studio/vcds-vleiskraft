import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { PLANS } from "../../api/src/services/payfastSubscription";

// VleisKraft™ Subscription Screen — Bilingual (AF/EN)
// Tiers: Consumer (Free) | Starter R3,500 | Pro R5,000 | Business R7,500 | Enterprise R15,000

const ACCENT = {
  consumer: "#6B7280",
  starter: "#C0392B",
  pro: "#8B0000",
  business: "#2c3e50",
  enterprise: "#F59E0B",
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<"af" | "en">("af");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (plan.tier === "consumer") return;
    setLoading(plan.id);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/payments/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${require("../../src/store/authStore").useAuthStore.getState().token}` },
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const data = await res.json();
      if (data.payment_url) {
        router.push({ pathname: "/payments/index", params: { url: data.payment_url } });
      } else {
        Alert.alert(lang === "af" ? "Fout" : "Error", data.message || (lang === "af" ? "Probeer weer." : "Please try again."));
      }
    } catch {
      Alert.alert(lang === "af" ? "Fout" : "Error", lang === "af" ? "Kon nie inteken nie." : "Could not subscribe.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.langRow}>
        {(["af", "en"] as const).map((l) => (
          <TouchableOpacity key={l} onPress={() => setLang(l)} style={[s.langBtn, lang === l && s.langActive]}>
            <Text style={[s.langText, lang === l && s.langActiveText]}>{l.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.heading}>{lang === "af" ? "Kies Jou Plan" : "Choose Your Plan"}</Text>
      <Text style={s.sub}>{lang === "af" ? "Slaggery-bestuuroplossings vir elke grootte besigheid" : "Butchery management solutions for every business size"}</Text>
      {PLANS.map((plan) => {
        const color = ACCENT[plan.tier as keyof typeof ACCENT] || "#888";
        const name = lang === "af" ? plan.name_af : plan.name_en;
        const features = lang === "af" ? plan.features_af : plan.features_en;
        const isFree = plan.tier === "consumer";
        return (
          <View key={plan.id} style={[s.card, { borderColor: color }]}>
            {plan.tier === "pro" && (
              <View style={[s.badge, { backgroundColor: color }]}>
                <Text style={s.badgeText}>{lang === "af" ? "⭐ Gewild" : "⭐ Popular"}</Text>
              </View>
            )}
            <Text style={[s.tierName, { color }]}>{name}</Text>
            <Text style={s.price}>
              {isFree
                ? (lang === "af" ? "Gratis" : "Free")
                : `R${plan.amount.toLocaleString()}/maand`}
            </Text>
            {plan.trial_days > 0 && (
              <Text style={s.trial}>
                {lang === "af" ? `\u2728 ${plan.trial_days} dae gratis proeftydperk` : `\u2728 ${plan.trial_days}-day free trial`}
              </Text>
            )}
            <Text style={s.branchInfo}>
              {lang === "af"
                ? `Takke: ${plan.max_branches === 99 ? "Onbeperk" : plan.max_branches}
                : `Branches: ${plan.max_branches === 99 ? "Unlimited" : plan.max_branches}`}
            </Text>
            {features.map((f) => (
              <Text key={f} style={s.feature}>\u2713 {f}</Text>
            ))}
            <TouchableOpacity
              style={[s.btn, { backgroundColor: isFree ? "#333" : color }]}
              onPress={() => handleSubscribe(plan)}
              disabled={isFree || loading === plan.id}
            >
              {loading === plan.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>
                  {isFree
                    ? (lang === "af" ? "Huidige Plan" : "Current Plan")
                    : plan.tier === "enterprise"
                    ? (lang === "af" ? "Kontak Ons" : "Contact Us")
                    : (lang === "af" ? "Kies Hierdie" : "Choose This")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, paddingBottom: 40 },
  langRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginBottom: 12 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "#555" },
  langActive: { backgroundColor: "#C0392B", borderColor: "#C0392B" },
  langText: { color: "#888", fontWeight: "600", fontSize: 12 },
  langActiveText: { color: "#fff" },
  heading: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 8 },
  sub: { fontSize: 13, color: "#888", textAlign: "center", marginBottom: 24 },
  card: { backgroundColor: "#111", borderWidth: 2, borderRadius: 16, padding: 20, marginBottom: 16 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  tierName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  price: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 4 },
  trial: { fontSize: 13, color: "#F59E0B", marginBottom: 4 },
  branchInfo: { fontSize: 12, color: "#888", marginBottom: 10 },
  feature: { fontSize: 14, color: "#ccc", marginBottom: 4 },
  btn: { marginTop: 16, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
