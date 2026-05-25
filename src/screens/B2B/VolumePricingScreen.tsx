import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { formatZAR } from "../../utils/formatZAR";
const TIERS = [
  { min: 0, max: 49, label: "0 – 49 kg", discount: 0 },
  { min: 50, max: 199, label: "50 – 199 kg", discount: 5 },
  { min: 200, max: 499, label: "200 – 499 kg", discount: 10 },
  { min: 500, max: 999, label: "500 – 999 kg", discount: 15 },
  { min: 1000, max: 9999, label: "1 000+ kg", discount: 20 },
];
const BASE = 9500;
export default function VolumePricingScreen() {
  const [qty, setQty] = useState("100");
  const q = parseFloat(qty) || 0;
  const tier = TIERS.find(t => q >= t.min && q <= t.max) || TIERS[0];
  const discounted = BASE * (1 - tier.discount / 100);
  const total = Math.round(discounted * q);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Volume Pryse / Volume Pricing</Text>
      <View style={s.calcCard}>
        <Text style={s.calcLabel}>Bereken jou prys / Calculate your price</Text>
        <TextInput style={s.input} value={qty} onChangeText={setQty} keyboardType="numeric" placeholder="Hoeveelheid in kg" accessibilityLabel="Hoeveelheid" />
        {[["Korting / Discount", `${tier.discount}%`], ["Prys per kg", formatZAR(Math.round(discounted))], ["Totaal / Total", formatZAR(total)]].map(([label, value]) => (
          <View key={label} style={[s.row, label === "Totaal / Total" && s.totalRow]}>
            <Text style={label === "Totaal / Total" ? s.totalLabel : s.rowLabel}>{label}</Text>
            <Text style={label === "Totaal / Total" ? s.totalValue : s.rowValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={s.table}>
        <View style={[s.tableRow, s.tableHeader]}>
          {["Volume", "Korting", "Prys/kg"].map(h => <Text key={h} style={[s.cell, s.headerCell]}>{h}</Text>)}
        </View>
        {TIERS.map(t => (
          <View key={t.label} style={[s.tableRow, tier.label === t.label && s.activeRow]}>
            <Text style={s.cell}>{t.label}</Text>
            <Text style={s.cell}>{t.discount}%</Text>
            <Text style={s.cell}>{formatZAR(Math.round(BASE * (1 - t.discount / 100)))}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 20 },
  calcCard: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: "#8B0000" },
  calcLabel: { fontSize: 15, fontWeight: "700", color: "#8B0000", marginBottom: 12 },
  input: { backgroundColor: "#f9f9f9", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, minHeight: 44 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { fontSize: 14, color: "#555" }, rowValue: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#eee", marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: "800", color: "#8B0000" }, totalValue: { fontSize: 18, fontWeight: "800", color: "#8B0000" },
  table: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden" },
  tableRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  tableHeader: { backgroundColor: "#8B0000" }, headerCell: { color: "#fff", fontWeight: "700" },
  cell: { flex: 1, fontSize: 14, color: "#1a1a1a" }, activeRow: { backgroundColor: "#fff5f5" },
});
