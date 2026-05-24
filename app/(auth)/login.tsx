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

export default function LoginScreen() {
  const { login, language } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { shakeAnim, shake } = useShake();

  const handleLogin = async () => {
    if (!email || !password) { shake(); setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home');
    } catch {
      setError('Invalid email or password');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#1A0000', '#0D0D0D']} style={styles.bg} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🥩 La Oma™</Text>
          <Text style={styles.tagline}>Jou buurt-slaghuis, nou in jou sak.</Text>
        </View>
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.title}>{t('signIn', language)}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            style={styles.input} placeholder={t('email', language)}
            placeholderTextColor={Colors.textSecondary}
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
          />
          <TextInput
            style={styles.input} placeholder={t('password', language)}
            placeholderTextColor={Colors.textSecondary}
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <GradientButton onPress={handleLogin} label={t('signIn', language)} loading={loading} style={styles.btn} />
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>{t('noAccount', language)}</Text>
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
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { fontSize: 40, marginBottom: Spacing.sm },
  tagline: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
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
