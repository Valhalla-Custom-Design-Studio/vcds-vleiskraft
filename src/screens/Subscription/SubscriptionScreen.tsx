import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import TierCard from "../../components/TierCard";
import { formatZAR } from "../../utils/formatZAR";
const TIERS = [
  { id: "free", name: "Gratis / Free", nameEn: "Free", price: 0, features: ["Blaai katalogus", "5 produkte"], cta: "Huidige plan", disabled: true, color: "#666" },
  { id: "braai", name: "Braai Meester", nameEn: "Braai Master", price: 14900, features: ["Volledige katalogus", "Onbeperkte bestellings", "VleisAI wenke"], cta: "Kies Braai Meester", disabled: false, color: "#c0392b" },
  { id: "pro", name: "Slager Pro", nameEn: "Butcher Pro", price: 49900, features: ["Alles in Braai Meester", "POS integrasie", "Voorraad bestuur", "Verslae"], cta: "Kies Slager Pro", disabled: false, color: "#8B0000" },
  { id: "b2b", name: "B2B Groothandel", nameEn: "B2B Wholesale", price: 350000, features: ["Alles in Slager Pro", "Grootmaat bestellings", "Fakture & Kwotasies", "Afleweringskedule"], cta: "Kontak ons", disabled: false, color: "#2c3e50" },
];
export default function SubscriptionScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Kies jou plan / Choose your plan</Text>
      {TIERS.map(t => (
        <TierCard key={t.id} title={t.name} price={t.price === 0 ? "Gratis" : `${formatZAR(t.price)}/maand`}
          features={t.features} ctaLabel={t.cta} onPress={() => t.id === "b2b" ? Alert.alert("B2B", "Ons sal u kontak.") : null}
          disabled={t.disabled} accentColor={t.color} />
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({ heading: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", marginBottom: 20 } });
