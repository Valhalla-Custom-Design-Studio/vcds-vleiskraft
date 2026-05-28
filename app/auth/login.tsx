import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

const API = process.env.EXPO_PUBLIC_API_URL || "https://vcds-vleiskraft.onrender.com";

const L = {
  en: {
    subtitle: "SA's Premium B2B Meat Marketplace",
    email: 'Email address',
    password: 'Password',
    login: 'Log In',
    register: 'Create Account',
    forgot: 'Forgot password?',
    langLabel: 'AF',
    noAccount: "Don't have an account?",
    errFields: 'Please enter email and password',
    errConn: 'Could not connect to server',
    errCreds: 'Invalid email or password',
  },
  af: {
    subtitle: "SA se Premium B2B Vleis Handelsmerk",
    email: 'E-posadres',
    password: 'Wagwoord',
    login: 'Teken In',
    register: 'Skep Rekening',
    forgot: 'Wagwoord vergeet?',
    langLabel: 'EN',
    noAccount: 'Het jy nie \u2019n rekening nie?',
    errFields: 'Voer e-pos en wagwoord in',
    errConn: 'Kon nie aan bediener koppel nie',
    errCreds: 'Ongeldige e-pos of wagwoord',
  },
} as const;

export default function LoginScreen() {
  const [lang, setLang] = useState<'en' | 'af'>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const l = L[lang];

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('VleisKraft™', l.errFields);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert('VleisKraft™', data.message || l.errCreds);
      }
    } catch {
      Alert.alert('VleisKraft™', l.errConn);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Language toggle */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang((p) => (p === 'en' ? 'af' : 'en'))}
        >
          <Text style={styles.langText}>{l.langLabel}</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🥩</Text>
          </View>
          <Text style={styles.appName}>VleisKraft™</Text>
          <Text style={styles.appSub}>{l.subtitle}</Text>
        </View>

        {/* Email */}
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={l.email}
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={l.password}
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPass((s) => !s)} style={styles.eyeBtn}>
            <Ionicons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot */}
        <TouchableOpacity style={styles.forgotWrap}>
          <Text style={styles.forgotText}>{l.forgot}</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.loginBtnText}>{l.login}</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.registerBtnText}>{l.register}</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By logging in you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  langBtn: {
    alignSelf: 'flex-end',
    marginTop: 56,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  logoWrap: { alignItems: 'center', marginTop: 32, marginBottom: 36 },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoEmoji: { fontSize: 38 },
  appName: { fontSize: 30, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  appSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, color: Colors.text },
  eyeBtn: { padding: 8 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  loginBtnText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textSecondary, fontSize: 13 },
  registerBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  registerBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  termsText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 20,
    lineHeight: 16,
  },
});
