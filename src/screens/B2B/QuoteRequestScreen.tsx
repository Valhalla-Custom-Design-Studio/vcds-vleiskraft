import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
export default function QuoteRequestScreen() {
  const [company, setCompany] = useState(""); const [contact, setContact] = useState("");
  const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [requirements, setRequirements] = useState(""); const [volume, setVolume] = useState("");
  const handleSubmit = () => {
    if (!company || !contact || !email || !requirements) { Alert.alert("Fout", "Vul alle verpligte velde in."); return; }
    Alert.alert("Kwotasie Ontvang", "Ons reageer binne 4 werksure / We respond within 4 business hours.");
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.heading}>Kwotasie Versoek / Quote Request</Text>
        {[["Maatskappy naam *", company, setCompany, "Maatskappy", undefined],
          ["Kontakpersoon *", contact, setContact, "Naam", undefined],
          ["E-pos *", email, setEmail, "e-pos@maatskappy.co.za", "email-address"],
          ["Telefoon", phone, setPhone, "+27 xx xxx xxxx", "phone-pad"],
          ["Volume (kg/maand)", volume, setVolume, "bv. 500kg", "numeric"],
        ].map(([label, value, setter, placeholder, keyboard]) => (
          <View key={label as string}>
            <Text style={s.fieldLabel}>{label as string}</Text>
            <TextInput style={s.input} placeholder={placeholder as string} value={value as string} onChangeText={setter as any} keyboardType={keyboard as any} accessibilityLabel={label as string} />
          </View>
        ))}
        <Text style={s.fieldLabel}>Vereistes *</Text>
        <TextInput style={[s.input, { height: 100 }]} placeholder="Beskryf u vleis vereistes" value={requirements} onChangeText={setRequirements} multiline accessibilityLabel="Vereistes" />
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} accessibilityRole="button"><Text style={s.submitText}>Versoek Kwotasie / Request Quote</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" }, content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16, minHeight: 44 },
  submitBtn: { backgroundColor: "#8B0000", borderRadius: 10, padding: 18, alignItems: "center", marginTop: 8, minHeight: 56 }, submitText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
