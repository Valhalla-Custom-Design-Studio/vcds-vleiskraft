import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { GradientButton } from '@/components/ui/GradientButton';
import { useShake } from '@/hooks/useShake';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { t } from '@/locales';

export default function RegisterScreen() {
  const { register, language } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { shakeAnim, shake } = useShake();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) { shake(); setError('All fields required'); return; }
    if (form.password !== form.confirm) { shake(); setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email.trim().toLowerCase(), phone: form.phone, password: form.password });
      router.replace('/onboarding');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Registration failed');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'firstName', label: t('firstName', language), opts: {} },
    { key: 'lastName', label: t('lastName', language), opts: {} },
    { key: 'email', label: t('email', language), opts: { keyboardType: 'email-address' as const, autoCapitalize: 'none' as const } },
    { key: 'phone', label: t('phone', language), opts: { keyboardType: 'phone-pad' as const } },
    { key: 'password', label: t('password', language), opts: { secureTextEntry: true } },
    { key: 'confirm', label: t('confirmPassword', language), opts: { secureTextEntry: true } },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1A0000', '#0D0D0D']} style={styles.bg} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.title}>{t('register', language)}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {fields.map(({ key, label, opts }) => (
            <TextInput
              key={key} style={styles.input} placeholder={label}
              placeholderTextColor={Colors.textSecondary}
              value={form[key as keyof typeof form]}
              onChangeText={(v) => update(key, v)}
              {...opts}
            />
          ))}
          <GradientButton onPress={handleRegister} label={t('register', language)} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>{t('haveAccount', language)}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  form: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: Spacing.lg, textAlign: 'center' },
  error: { color: Colors.error, fontSize: 13, marginBottom: Spacing.sm, textAlign: 'center' },
  input: {
    height: 52, backgroundColor: Colors.elevated, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, fontSize: 15,
  },
  btn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  link: { alignItems: 'center' },
  linkText: { color: Colors.secondary, fontSize: 14 },
});
