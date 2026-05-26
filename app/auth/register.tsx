import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Switch,
  SafeAreaView, StatusBar, Animated, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ButcherySelector } from '../../src/components/ButcherySelector';

// ─── Types ─────────────────────────────────────────────────────
interface Butchery {
  id: string; name: string; city: string; province: string;
  address?: string; phone?: string; is_verified: boolean; tier: string;
}

type UserType = 'consumer' | 'butchery' | '';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

// ─── Labels ────────────────────────────────────────────────────
const L = {
  en: {
    title: 'Create Account',
    step1: 'Who are you?',
    step2: 'Your Details',
    step3: 'Your Butchery',
    step4: 'Choose Plan',
    consumer: 'Consumer',
    consumerDesc: 'Buy premium meat from local butcheries',
    butchery: 'Butchery',
    butcheryDesc: 'Sell your meat on VleisKraft™',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password (min 8 chars)',
    confirmPassword: 'Confirm Password',
    butcheryName: 'Butchery Name',
    butcheryType: 'Butchery Type',
    regNumber: 'Registration Number (optional)',
    selectButchery: 'Select Your Butchery',
    butcheryHint: 'Choose a butchery near you. You can change this later.',
    next: 'Next',
    back: 'Back',
    submit: 'Create Account',
    lang: 'EN',
    langSwitch: 'AF',
    plans: [
      { id: 'free', label: 'Free', price: 'R0/mo', desc: 'Browse & buy meat' },
      { id: 'starter', label: 'Starter', price: 'R149/mo', desc: '50 products + analytics' },
      { id: 'pro', label: 'Pro', price: 'R499/mo', desc: 'Unlimited + VleisAI™' },
    ],
    butcheryTypes: ['Independent Butchery', 'Farm Stall', 'Supermarket Deli', 'Online Only', 'Other'],
    errors: {
      firstName: 'First name required',
      lastName: 'Last name required',
      email: 'Valid email required',
      phone: 'Phone number required',
      password: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords do not match',
      userType: 'Please select who you are',
      butcheryName: 'Butchery name required',
    },
    success: 'Account created! Welcome to VleisKraft™',
    registering: 'Creating account...',
  },
  af: {
    title: 'Skep Rekening',
    step1: 'Wie is jy?',
    step2: 'Jou Besonderhede',
    step3: 'Jou Slagtery',
    step4: 'Kies Pakket',
    consumer: 'Verbruiker',
    consumerDesc: 'Koop premium vleis van plaaslike slagteries',
    butchery: 'Slagtery',
    butcheryDesc: 'Verkoop jou vleis op VleisKraft™',
    firstName: 'Voornaam',
    lastName: 'Van',
    email: 'E-posadres',
    phone: 'Selfoonnommer',
    password: 'Wagwoord (min 8 karakters)',
    confirmPassword: 'Bevestig Wagwoord',
    butcheryName: 'Slagtery Naam',
    butcheryType: 'Slagtery Tipe',
    regNumber: 'Registrasienommer (opsioneel)',
    selectButchery: 'Kies Jou Slagtery',
    butcheryHint: "Kies 'n slagtery naby jou. Jy kan dit later verander.",
    next: 'Volgende',
    back: 'Terug',
    submit: 'Skep Rekening',
    lang: 'AF',
    langSwitch: 'EN',
    plans: [
      { id: 'free', label: 'Gratis', price: 'R0/md', desc: 'Blaai & koop vleis' },
      { id: 'starter', label: 'Aanvanger', price: 'R149/md', desc: '50 produkte + ontledings' },
      { id: 'pro', label: 'Pro', price: 'R499/md', desc: 'Onbeperk + VleisAI™' },
    ],
    butcheryTypes: ['Onafhanklike Slagtery', 'Plaasstal', 'Supermark Deli', 'Aanlyn Slegs', 'Ander'],
    errors: {
      firstName: 'Voornaam verpligtend',
      lastName: 'Van verpligtend',
      email: 'Geldige e-pos verpligtend',
      phone: 'Selfoonnommer verpligtend',
      password: 'Wagwoord moet minstens 8 karakters wees',
      passwordMatch: 'Wagwoorde stem nie ooreen nie',
      userType: 'Kies asseblief wie jy is',
      butcheryName: 'Slagtery naam verpligtend',
    },
    success: 'Rekening geskep! Welkom by VleisKraft™',
    registering: 'Skep rekening...',
  },
};

// ─── Step Indicator ────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[styles.stepDot, i < current && styles.stepDotDone, i === current - 1 && styles.stepDotActive]}>
            {i < current - 1 ? (
              <Text style={styles.stepCheck}>✓</Text>
            ) : (
              <Text style={[styles.stepNum, i === current - 1 && styles.stepNumActive]}>{i + 1}</Text>
            )}
          </View>
          {i < total - 1 && <View style={[styles.stepLine, i < current - 1 && styles.stepLineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function RegisterScreen() {
  const [lang, setLang] = useState<'en' | 'af'>('en');
  const t = L[lang];
  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [userType, setUserType] = useState<UserType>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [butcheryName, setButcheryName] = useState('');
  const [butcheryType, setButcheryType] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [selectedButchery, setSelectedButchery] = useState<Butchery | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('free');

  const scrollRef = useRef<ScrollView>(null);

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !userType) e.userType = t.errors.userType;
    if (s === 2) {
      if (!firstName.trim()) e.firstName = t.errors.firstName;
      if (!lastName.trim()) e.lastName = t.errors.lastName;
      if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) e.email = t.errors.email;
      if (!phone.trim()) e.phone = t.errors.phone;
      if (password.length < 8) e.password = t.errors.password;
      if (password !== confirmPassword) e.confirmPassword = t.errors.passwordMatch;
    }
    if (s === 3 && userType === 'butchery' && !butcheryName.trim()) e.butcheryName = t.errors.butcheryName;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    // Skip step 3 (butchery details) for consumers
    const nextStep = step === 2 && userType === 'consumer' ? 4 : step + 1;
    setStep(Math.min(nextStep, totalSteps));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const back = () => {
    const prevStep = step === 4 && userType === 'consumer' ? 2 : step - 1;
    setStep(Math.max(prevStep, 1));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const submit = async () => {
    if (!validate(step)) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        firstName, lastName, email, phone, password,
        preferredLocale: lang,
        userType,
        plan: selectedPlan,
        butcheryId: selectedButchery?.id || null,
      };
      if (userType === 'butchery') {
        body.butcheryName = butcheryName;
        body.butcheryType = butcheryType;
        body.regNumber = regNumber;
      }

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert('✅', t.success, [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]);
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch {
      Alert.alert('Error', 'Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, onChangeText, error, ...props }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#555"
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A14" />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topRow}>
            <Text style={styles.title}>{t.title}</Text>
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => setLang(l => l === 'en' ? 'af' : 'en')}
              accessibilityLabel={`Switch to ${lang === 'en' ? 'Afrikaans' : 'English'}`}
            >
              <Text style={styles.langText}>{t.lang} / {t.langSwitch}</Text>
            </TouchableOpacity>
          </View>

          <StepIndicator current={step} total={totalSteps} />

          {/* ── STEP 1: Who are you? ── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>{t.step1}</Text>
              {errors.userType ? <Text style={styles.fieldError}>{errors.userType}</Text> : null}
              <TouchableOpacity
                style={[styles.typeCard, userType === 'consumer' && styles.typeCardActive]}
                onPress={() => setUserType('consumer')}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ checked: userType === 'consumer' }}
              >
                <Text style={styles.typeEmoji}>🛒</Text>
                <View style={styles.typeText}>
                  <Text style={styles.typeLabel}>{t.consumer}</Text>
                  <Text style={styles.typeDesc}>{t.consumerDesc}</Text>
                </View>
                <View style={[styles.typeRadio, userType === 'consumer' && styles.typeRadioActive]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeCard, userType === 'butchery' && styles.typeCardActive]}
                onPress={() => setUserType('butchery')}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ checked: userType === 'butchery' }}
              >
                <Text style={styles.typeEmoji}>🥩</Text>
                <View style={styles.typeText}>
                  <Text style={styles.typeLabel}>{t.butchery}</Text>
                  <Text style={styles.typeDesc}>{t.butcheryDesc}</Text>
                </View>
                <View style={[styles.typeRadio, userType === 'butchery' && styles.typeRadioActive]} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: Personal Details ── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>{t.step2}</Text>
              <Field label={t.firstName} value={firstName} onChangeText={setFirstName}
                error={errors.firstName} autoCapitalize="words" />
              <Field label={t.lastName} value={lastName} onChangeText={setLastName}
                error={errors.lastName} autoCapitalize="words" />
              <Field label={t.email} value={email} onChangeText={setEmail}
                error={errors.email} keyboardType="email-address" autoCapitalize="none" />
              <Field label={t.phone} value={phone} onChangeText={setPhone}
                error={errors.phone} keyboardType="phone-pad" />
              <Field label={t.password} value={password} onChangeText={setPassword}
                error={errors.password} secureTextEntry />
              <Field label={t.confirmPassword} value={confirmPassword} onChangeText={setConfirmPassword}
                error={errors.confirmPassword} secureTextEntry />
            </View>
          )}

          {/* ── STEP 3: Butchery Details (butchery owners only) ── */}
          {step === 3 && userType === 'butchery' && (
            <View>
              <Text style={styles.stepTitle}>{t.step3}</Text>
              <Field label={t.butcheryName} value={butcheryName} onChangeText={setButcheryName}
                error={errors.butcheryName} autoCapitalize="words" />
              <Text style={styles.fieldLabel}>{t.butcheryType}</Text>
              <View style={styles.typeGrid}>
                {t.butcheryTypes.map(bt => (
                  <TouchableOpacity
                    key={bt}
                    style={[styles.typeChip, butcheryType === bt && styles.typeChipActive]}
                    onPress={() => setButcheryType(bt)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: butcheryType === bt }}
                  >
                    <Text style={[styles.typeChipText, butcheryType === bt && styles.typeChipTextActive]}>{bt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label={t.regNumber} value={regNumber} onChangeText={setRegNumber}
                autoCapitalize="characters" />
            </View>
          )}

          {/* ── STEP 4: Plan + Butchery Selector (consumers) ── */}
          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>{t.step4}</Text>

              {/* Plan cards */}
              {t.plans.map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive]}
                  onPress={() => setSelectedPlan(plan.id)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedPlan === plan.id }}
                >
                  <View style={styles.planLeft}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={styles.planDesc}>{plan.desc}</Text>
                  </View>
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <View style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioActive]} />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Butchery selector — for consumers */}
              {userType === 'consumer' && (
                <View style={styles.butcherySection}>
                  <Text style={styles.sectionLabel}>{t.selectButchery}</Text>
                  <Text style={styles.sectionHint}>{t.butcheryHint}</Text>
                  <ButcherySelector
                    value={selectedButchery}
                    onChange={setSelectedButchery}
                    lang={lang}
                    required={false}
                  />
                </View>
              )}
            </View>
          )}

          {/* Navigation buttons */}
          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={back} activeOpacity={0.8}>
                <Text style={styles.backText}>{t.back}</Text>
              </TouchableOpacity>
            )}
            {step < totalSteps ? (
              <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.8}>
                <Text style={styles.nextText}>{t.next}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, loading && styles.btnDisabled]}
                onPress={submit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.nextText}>{loading ? t.registering : t.submit}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A14' },
  kav: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: '#F5F0FF', fontSize: 26, fontWeight: '800' },
  langBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(178,34,34,0.4)',
    backgroundColor: 'rgba(178,34,34,0.08)',
  },
  langText: { color: '#B22222', fontSize: 13, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { borderColor: '#B22222', backgroundColor: 'rgba(178,34,34,0.15)' },
  stepDotDone: { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)' },
  stepNum: { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  stepNumActive: { color: '#B22222' },
  stepCheck: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#22C55E' },
  stepTitle: { color: '#F5F0FF', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 52, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    color: '#F5F0FF', paddingHorizontal: 16, fontSize: 15,
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 44,
  },
  typeCardActive: { borderColor: '#B22222', backgroundColor: 'rgba(178,34,34,0.1)' },
  typeEmoji: { fontSize: 28, marginRight: 14 },
  typeText: { flex: 1 },
  typeLabel: { color: '#F5F0FF', fontSize: 16, fontWeight: '700' },
  typeDesc: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  typeRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  typeRadioActive: { borderColor: '#B22222', backgroundColor: '#B22222' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    minHeight: 44, justifyContent: 'center',
  },
  typeChipActive: { backgroundColor: '#B22222', borderColor: '#B22222' },
  typeChipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  typeChipTextActive: { color: '#fff', fontWeight: '700' },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 44,
  },
  planCardActive: { borderColor: '#B22222', backgroundColor: 'rgba(178,34,34,0.1)' },
  planLeft: { flex: 1 },
  planLabel: { color: '#F5F0FF', fontSize: 16, fontWeight: '700' },
  planDesc: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  planRight: { alignItems: 'flex-end', gap: 8 },
  planPrice: { color: '#B22222', fontSize: 15, fontWeight: '700' },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  planRadioActive: { borderColor: '#B22222', backgroundColor: '#B22222' },
  butcherySection: { marginTop: 20 },
  sectionLabel: { color: '#F5F0FF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionHint: { color: '#6B7280', fontSize: 13, marginBottom: 12 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  backBtn: {
    flex: 1, height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
  nextBtn: {
    flex: 2, height: 52, borderRadius: 12,
    backgroundColor: '#B22222',
    alignItems: 'center', justifyContent: 'center',
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
