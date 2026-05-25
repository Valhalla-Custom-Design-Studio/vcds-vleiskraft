import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { formatZAR } from "../../utils/formatZAR";
const INVOICES = [
  { id: "INV-2026-041", date: "2026-05-18", due: "2026-06-17", amount: 780000, status: "Onbetaald" },
  { id: "INV-2026-038", date: "2026-05-10", due: "2026-06-09", amount: 1240000, status: "Betaal" },
  { id: "INV-2026-031", date: "2026-04-28", due: "2026-05-28", amount: 320000, status: "Betaal" },
];
export default function InvoiceScreen() {
  const handlePay = (inv: typeof INVOICES[0]) => {
    if (inv.status === "Betaal") { Alert.alert("Reeds betaal", "Hierdie faktuur is reeds betaal."); return; }
    Alert.alert("Betaal Faktuur", `${inv.id}
${formatZAR(inv.amount)}

Gaan voort met PayFast?`, [
      { text: "Kanselleer", style: "cancel" }, { text: "Betaal", onPress: () => Alert.alert("PayFast", "Herlei na PayFast...") },
    ]);
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <FlatList data={INVOICES} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={s.card} accessibilityRole="text" accessibilityLabel={`Faktuur ${item.id}, ${formatZAR(item.amount)}, ${item.status}`}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.id}>{item.id}</Text>
              <Text style={[s.status, item.status === "Betaal" ? s.paid : s.unpaid]}>{item.status}</Text>
            </View>
            <Text style={s.date}>Datum: {item.date} | Vervaldatum: {item.due}</Text>
            <Text style={s.amount}>{formatZAR(item.amount)}</Text>
            <TouchableOpacity style={[s.payBtn, item.status === "Betaal" && s.payBtnDisabled]} onPress={() => handlePay(item)} accessibilityRole="button" disabled={item.status === "Betaal"}>
              <Text style={s.payBtnText}>{item.status === "Betaal" ? "Betaal ✓" : "Betaal Nou / Pay Now"}</Text>
            </TouchableOpacity>
          </View>
        )} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} />
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, borderLeftWidth: 4, borderLeftColor: "#8B0000" },
  id: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  status: { fontSize: 13, fontWeight: "600", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  paid: { backgroundColor: "#d5f5e3", color: "#27ae60" }, unpaid: { backgroundColor: "#fde8e8", color: "#c0392b" },
  date: { fontSize: 12, color: "#666", marginTop: 4 }, amount: { fontSize: 20, fontWeight: "800", color: "#8B0000", marginTop: 6 },
  payBtn: { backgroundColor: "#8B0000", borderRadius: 8, padding: 12, alignItems: "center", marginTop: 12, minHeight: 44 },
  payBtnDisabled: { backgroundColor: "#ccc" }, payBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
