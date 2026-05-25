import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
export default function ProfileScreen() {
  const [isAF, setIsAF] = useState(true);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>VK</Text></View>
        <Text style={s.name}>VleisKraft Gebruiker</Text>
        <Text style={s.tier}>Slager Pro</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Taal / Language</Text>
        <View style={s.row}>
          <Text style={s.label}>Afrikaans</Text>
          <Switch value={isAF} onValueChange={setIsAF} trackColor={{ false: "#ccc", true: "#8B0000" }} thumbColor="#fff" accessibilityLabel="Wissel taal" accessibilityRole="switch" />
        </View>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Rekening / Account</Text>
        {["Persoonlike besonderhede", "Betaalmetodes", "Inskrywingsgeskiedenis", "Fakture", "Afmeld"].map(item => (
          <TouchableOpacity key={item} style={s.menuItem} accessibilityRole="button" accessibilityLabel={item}>
            <Text style={s.menuText}>{item}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  header: { backgroundColor: "#8B0000", alignItems: "center", padding: 32 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: "800", color: "#8B0000" },
  name: { fontSize: 18, fontWeight: "700", color: "#fff" },
  tier: { fontSize: 13, color: "#ffcccc", marginTop: 4 },
  section: { backgroundColor: "#fff", margin: 16, borderRadius: 10, overflow: "hidden" },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#666", padding: 12, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, minHeight: 44 },
  label: { fontSize: 16, color: "#1a1a1a" },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0", minHeight: 44 },
  menuText: { fontSize: 15, color: "#1a1a1a" },
  chevron: { fontSize: 20, color: "#ccc" },
});
