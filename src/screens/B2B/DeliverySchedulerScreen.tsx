import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
const SLOTS = ["07:00 – 09:00", "09:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00"];
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr"];
export default function DeliverySchedulerScreen() {
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const handleConfirm = () => {
    if (!day || !slot || !address) { Alert.alert("Fout", "Kies dag, tydgleuf en voer adres in."); return; }
    Alert.alert("Aflewering Bevestig", `${day} | ${slot}
${address}

Ons kontak u 1 uur voor aflewering.`);
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Afleweringskedule / Delivery Schedule</Text>
      <Text style={s.sectionLabel}>Dag / Day</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        {DAYS.map(d => (
          <TouchableOpacity key={d} style={[s.dayBtn, day === d && s.dayBtnActive]} onPress={() => setDay(d)} accessibilityRole="button" accessibilityState={{ selected: day === d }}>
            <Text style={[s.dayText, day === d && s.dayTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.sectionLabel}>Tydgleuf / Time Slot</Text>
      {SLOTS.map(sl => (
        <TouchableOpacity key={sl} style={[s.slotBtn, slot === sl && s.slotBtnActive]} onPress={() => setSlot(sl)} accessibilityRole="button" accessibilityState={{ selected: slot === sl }}>
          <Text style={[s.slotText, slot === sl && s.slotTextActive]}>{sl}</Text>
          {slot === sl && <Text style={{ color: "#8B0000", fontSize: 18, fontWeight: "800" }}>✓</Text>}
        </TouchableOpacity>
      ))}
      <Text style={s.sectionLabel}>Aflewer adres</Text>
      <TextInput style={s.input} placeholder="Straat, Stad, Poskode" value={address} onChangeText={setAddress} accessibilityLabel="Aflewer adres" />
      <Text style={s.sectionLabel}>Spesiale instruksies</Text>
      <TextInput style={[s.input, { height: 80 }]} placeholder="bv. Bel voor aflewering" value={instructions} onChangeText={setInstructions} multiline accessibilityLabel="Instruksies" />
      <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} accessibilityRole="button"><Text style={s.confirmText}>Bevestig Aflewering / Confirm Delivery</Text></TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 10, marginTop: 8 },
  dayBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: "#ddd", alignItems: "center", minHeight: 44 },
  dayBtnActive: { borderColor: "#8B0000", backgroundColor: "#8B0000" },
  dayText: { fontWeight: "700", color: "#555" }, dayTextActive: { color: "#fff" },
  slotBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 16, marginBottom: 8, borderWidth: 2, borderColor: "#eee", minHeight: 52 },
  slotBtnActive: { borderColor: "#8B0000", backgroundColor: "#fff5f5" },
  slotText: { fontSize: 15, color: "#333" }, slotTextActive: { color: "#8B0000", fontWeight: "700" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16, minHeight: 44 },
  confirmBtn: { backgroundColor: "#8B0000", borderRadius: 10, padding: 18, alignItems: "center", marginTop: 8, minHeight: 56 }, confirmText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
