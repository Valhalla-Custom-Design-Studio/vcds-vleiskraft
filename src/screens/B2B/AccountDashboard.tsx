import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { formatZAR } from "../../utils/formatZAR";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
type Nav = NativeStackNavigationProp<RootStackParamList>;
const STATS = [
  { label: "Hierdie maand", value: 2340000, sub: "3 bestellings" },
  { label: "Uitstaande", value: 780000, sub: "1 faktuur" },
  { label: "Jaar tot datum", value: 18900000, sub: "24 bestellings" },
];
const ORDERS = [
  { id: "ORD-2026-041", date: "2026-05-18", status: "Afgelewer", total: 780000 },
  { id: "ORD-2026-038", date: "2026-05-10", status: "Afgelewer", total: 1240000 },
  { id: "ORD-2026-031", date: "2026-04-28", status: "Afgelewer", total: 320000 },
];
export default function AccountDashboard() {
  const nav = useNavigation<Nav>();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ flexDirection: "row", padding: 12, gap: 8 }}>
        {STATS.map(s => (
          <View key={s.label} style={st.statCard} accessibilityRole="text" accessibilityLabel={`${s.label}: ${formatZAR(s.value)}`}>
            <Text style={st.statValue}>{formatZAR(s.value)}</Text>
            <Text style={st.statLabel}>{s.label}</Text>
            <Text style={st.statSub}>{s.sub}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 }}>
        {([["Nuwe Bestelling", "BulkOrder"], ["Kwotasie", "QuoteRequest"], ["Fakture", "Invoices"], ["Aflewering", "DeliveryScheduler"]] as [string, keyof RootStackParamList][]).map(([label, screen]) => (
          <TouchableOpacity key={label} style={st.actionBtn} onPress={() => nav.navigate(screen)} accessibilityRole="button" accessibilityLabel={label}>
            <Text style={st.actionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={st.sectionTitle}>Onlangse Bestellings</Text>
      {ORDERS.map(o => (
        <View key={o.id} style={st.orderCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={st.orderId}>{o.id}</Text>
            <Text style={st.orderStatus}>{o.status}</Text>
          </View>
          <Text style={st.orderDate}>{o.date}</Text>
          <Text style={st.orderTotal}>{formatZAR(o.total)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const st = StyleSheet.create({
  statCard: { flex: 1, backgroundColor: "#8B0000", borderRadius: 10, padding: 12, alignItems: "center" },
  statValue: { fontSize: 14, fontWeight: "800", color: "#fff" }, statLabel: { fontSize: 10, color: "#ffcccc", textAlign: "center", marginTop: 2 }, statSub: { fontSize: 11, color: "#ffaaaa" },
  actionBtn: { flex: 1, minWidth: "45%", backgroundColor: "#fff", borderRadius: 10, padding: 16, alignItems: "center", borderLeftWidth: 3, borderLeftColor: "#8B0000", minHeight: 56 },
  actionText: { fontSize: 14, fontWeight: "700", color: "#8B0000" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#333", paddingHorizontal: 16, marginBottom: 8, textTransform: "uppercase" },
  orderCard: { backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 14 },
  orderId: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" }, orderStatus: { fontSize: 13, color: "#27ae60", fontWeight: "600" },
  orderDate: { fontSize: 12, color: "#666", marginTop: 2 }, orderTotal: { fontSize: 16, fontWeight: "800", color: "#8B0000", marginTop: 4 },
});
