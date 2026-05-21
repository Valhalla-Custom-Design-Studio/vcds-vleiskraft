import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { formatZAR } from "../../utils/formatZAR";
interface OrderLine { product: string; quantity: string; unit: string; }
export default function BulkOrderScreen() {
  const [lines, setLines] = useState<OrderLine[]>([{ product: "", quantity: "", unit: "kg" }]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const addLine = () => setLines(p => [...p, { product: "", quantity: "", unit: "kg" }]);
  const removeLine = (i: number) => setLines(p => p.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof OrderLine, value: string) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  const handleSubmit = () => {
    if (!lines.every(l => l.product && l.quantity)) { Alert.alert("Fout", "Vul alle velde in."); return; }
    if (!deliveryDate) { Alert.alert("Fout", "Kies afleweringsdatum."); return; }
    Alert.alert("Bestelling Ontvang", "Kwotasie binne 2 uur / Quote within 2 hours.");
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.heading}>Grootmaat Bestelling / Bulk Order</Text>
        <Text style={s.sub}>Minimum 50kg | Aflewering binne 48 uur</Text>
        {lines.map((line, i) => (
          <View key={i} style={s.lineCard}>
            <Text style={s.lineLabel}>Produk {i + 1}</Text>
            <TextInput style={s.input} placeholder="Produk naam" value={line.product} onChangeText={v => updateLine(i, "product", v)} accessibilityLabel={`Produk ${i+1}`} />
            <View style={{ flexDirection: "row" }}>
              <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder="Hoeveelheid" value={line.quantity} onChangeText={v => updateLine(i, "quantity", v)} keyboardType="numeric" accessibilityLabel="Hoeveelheid" />
              <TextInput style={[s.input, { width: 60 }]} placeholder="kg" value={line.unit} onChangeText={v => updateLine(i, "unit", v)} accessibilityLabel="Eenheid" />
            </View>
            {lines.length > 1 && <TouchableOpacity onPress={() => removeLine(i)} accessibilityRole="button"><Text style={s.remove}>− Verwyder</Text></TouchableOpacity>}
          </View>
        ))}
        <TouchableOpacity style={s.addBtn} onPress={addLine} accessibilityRole="button"><Text style={s.addBtnText}>+ Voeg produk by</Text></TouchableOpacity>
        <Text style={s.fieldLabel}>Afleweringsdatum</Text>
        <TextInput style={s.input} placeholder="JJJJ-MM-DD" value={deliveryDate} onChangeText={setDeliveryDate} accessibilityLabel="Afleweringsdatum" />
        <Text style={s.fieldLabel}>Notas</Text>
        <TextInput style={[s.input, { height: 80 }]} placeholder="Spesiale vereistes" value={notes} onChangeText={setNotes} multiline accessibilityLabel="Notas" />
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} accessibilityRole="button"><Text style={s.submitText}>Dien Bestelling In / Submit Order</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" }, content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 4 }, sub: { fontSize: 13, color: "#666", marginBottom: 20 },
  lineCard: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#8B0000" },
  lineLabel: { fontSize: 13, fontWeight: "700", color: "#8B0000", marginBottom: 8 },
  input: { backgroundColor: "#f9f9f9", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 8, minHeight: 44 },
  remove: { color: "#c0392b", fontSize: 13 }, addBtn: { borderWidth: 2, borderColor: "#8B0000", borderStyle: "dashed", borderRadius: 10, padding: 14, alignItems: "center", marginBottom: 20 },
  addBtnText: { color: "#8B0000", fontWeight: "700", fontSize: 15 }, fieldLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  submitBtn: { backgroundColor: "#8B0000", borderRadius: 10, padding: 18, alignItems: "center", marginTop: 8, minHeight: 56 }, submitText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
