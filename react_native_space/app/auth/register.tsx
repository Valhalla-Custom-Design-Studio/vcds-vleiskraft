import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, KeyboardAvoidingView, Platform
} from 'react-native';
import { useI18n } from '../../src/i18n';

const BUTCHERY_TYPES = [
  { en: 'Independent Butchery', af: 'Onafhanklike Slagtery' },
  { en: 'Farm Stall', af: 'Plaasstal' },
  { en: 'Supermarket Deli', af: 'Supermark Deli' },
  { en: 'Online Only', af: 'Aanlyn Slegs' },
  { en: 'Other', af: 'Ander' },
];

const TIERS = [
  { id: 'free', labelEn: 'Free', labelAf: 'Gratis', priceEn: 'R0/mo', priceAf: 'R0/md', descEn: 'Basic shop listing', descAf: 'Basiese winkellysting' },
  { id: 'pro', labelEn: 'Pro', labelAf: 'Pro', priceEn: 'R149/mo', priceAf: 'R149/md', descEn: 'VleisAI™ + analytics', descAf: 'VleisAI™ + ontledings' },
  { id: 'enterprise', labelEn: 'Enterprise', labelAf: 'Onderneming', priceEn: 'R499/mo', priceAf: 'R499/md', descEn: 'Multi-branch + white label', descAf: 'Multi-tak + wit etiket' },
];

export default function RegisterScreen() {
  const { t, lang, toggleLang } = useI18n();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    butcheryName: '', butcheryType: '', phone: '',
    tier: 'free',
  });

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const labels = {
    step1Title: lang === 'af' ? 'Skep Rekening' : 'Create Account',
    step2Title: lang === 'af' ? 'Slagtery Besonderhede' : 'Butchery Details',
    step3Title: lang === 'af' ? 'Kies Pakket' : 'Choose Plan',
    next: lang === 'af' ? 'Volgende' : 'Next',
    back: lang === 'af' ? 'Terug' : 'Back',
    finish: lang === 'af' ? 'Registreer' : 'Register',
    namePlaceholder: lang === 'af' ? 'Volle naam' : 'Full name',
    emailPlaceholder: lang === 'af' ? 'E-posadres' : 'Email address',
    passwordPlaceholder: lang === 'af' ? 'Wagwoord' : 'Password',
    butcheryNamePlaceholder: lang === 'af' ? 'Slagtery naam' : 'Butchery name',
    phonePlaceholder: lang === 'af' ? 'Selfoonnommer' : 'Phone number',
    selectType: lang === 'af' ? 'Kies tipe slagtery' : 'Select butchery type',
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Lang Toggle */}
        <View style={styles.langRow}>
          <Text style={styles.langLabel}>EN</Text>
          <Switch value={lang === 'af'} onValueChange={toggleLang}
            trackColor={{ false: '#555', true: '#B22222' }} thumbColor="#fff"
            accessibilityLabel={lang === 'en' ? 'Switch to Afrikaans' : 'Skakel na Engels'} />
          <Text style={styles.langLabel}>AF</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Step 1 — Account */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>{labels.step1Title}</Text>
            <TextInput style={styles.input} placeholder={labels.namePlaceholder}
              placeholderTextColor="#666" value={form.name} onChangeText={v => set('name', v)} />
            <TextInput style={styles.input} placeholder={labels.emailPlaceholder}
              placeholderTextColor="#666" value={form.email} onChangeText={v => set('email', v)}
              keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder={labels.passwordPlaceholder}
              placeholderTextColor="#666" value={form.password} onChangeText={v => set('password', v)}
              secureTextEntry />
          </View>
        )}

        {/* Step 2 — Butchery */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>{labels.step2Title}</Text>
            <TextInput style={styles.input} placeholder={labels.butcheryNamePlaceholder}
              placeholderTextColor="#666" value={form.butcheryName} onChangeText={v => set('butcheryName', v)} />
            <TextInput style={styles.input} placeholder={labels.phonePlaceholder}
              placeholderTextColor="#666" value={form.phone} onChangeText={v => set('phone', v)}
              keyboardType="phone-pad" />
            <Text style={styles.sectionLabel}>{labels.selectType}</Text>
            {BUTCHERY_TYPES.map((bt, i) => (
              <TouchableOpacity key={i} style={[styles.typeBtn, form.butcheryType === bt.en && styles.typeBtnActive]}
                onPress={() => set('butcheryType', bt.en)} accessibilityRole="radio">
                <Text style={[styles.typeBtnText, form.butcheryType === bt.en && styles.typeBtnTextActive]}>
                  {lang === 'af' ? bt.af : bt.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3 — Tier */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>{labels.step3Title}</Text>
            {TIERS.map(tier => (
              <TouchableOpacity key={tier.id}
                style={[styles.tierCard, form.tier === tier.id && styles.tierCardActive]}
                onPress={() => set('tier', tier.id)} accessibilityRole="radio">
                <View style={styles.tierTop}>
                  <Text style={styles.tierName}>{lang === 'af' ? tier.labelAf : tier.labelEn}</Text>
                  <Text style={styles.tierPrice}>{lang === 'af' ? tier.priceAf : tier.priceEn}</Text>
                </View>
                <Text style={styles.tierDesc}>{lang === 'af' ? tier.descAf : tier.descEn}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 1 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backBtnText}>{labels.back}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={() => step < 3 ? setStep(s => s + 1) : null}>
            <Text style={styles.nextBtnText}>{step === 3 ? labels.finish : labels.next}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  content: { padding: 24, paddingBottom: 40 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 16 },
  langLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 28 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#B22222' },
  stepNum: { color: '#888', fontWeight: '700' },
  stepNumActive: { color: '#fff' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: {
    backgroundColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, color: '#fff', fontSize: 15, marginBottom: 12,
  },
  sectionLabel: { color: '#aaa', fontSize: 13, marginBottom: 8, marginTop: 4 },
  typeBtn: {
    backgroundColor: '#2a2a2a', borderRadius: 10, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#333',
  },
  typeBtnActive: { borderColor: '#B22222', backgroundColor: '#B2222222' },
  typeBtnText: { color: '#ccc', fontSize: 14 },
  typeBtnTextActive: { color: '#fff', fontWeight: '600' },
  tierCard: {
    backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 2, borderColor: '#333',
  },
  tierCardActive: { borderColor: '#B22222' },
  tierTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tierName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tierPrice: { color: '#B22222', fontSize: 16, fontWeight: '700' },
  tierDesc: { color: '#aaa', fontSize: 13 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: {
    flex: 1, backgroundColor: '#333', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  nextBtn: {
    flex: 2, backgroundColor: '#B22222', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
