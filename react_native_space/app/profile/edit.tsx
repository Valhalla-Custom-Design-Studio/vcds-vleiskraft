import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/hooks/useAuth';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GradientButton } from '../../src/components/GradientButton';
import { colors } from '../../src/theme/colors';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth() as any;
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name, phone, email });
      if (refreshUser) await refreshUser();
      Alert.alert('Saved', 'Profile updated', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Error', 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer title="Edit Profile">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textSecondary} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="email@example.com" placeholderTextColor={colors.textSecondary} />
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+27 000 000 0000" placeholderTextColor={colors.textSecondary} />
        <GradientButton title={saving ? 'Saving…' : 'Save Changes'} onPress={save} disabled={saving} style={styles.btn} />
        <TouchableOpacity onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  btn: { marginTop: 32 },
  cancel: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
});
