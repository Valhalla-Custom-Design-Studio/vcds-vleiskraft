import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
  StatusBar, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API = process.env.EXPO_PUBLIC_API_URL || 'https://vcds-vleiskraft.onrender.com';
const GOLD = '#C9A84C';
const BG = '#0A0A0A';
const SURFACE = '#141414';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = '#888888';
const RED = '#C0392B';

// ─── Bilingual Labels ───────────────────────────────────────────
const L = {
  en: {
    title: 'Join VleisKraft™',
    step1Title: 'Who are you?',
    step1Sub: 'Choose your account type to get started',
    consumerLabel: 'Consumer',
    consumerDesc: 'Browse & buy premium meat from local butcheries — free forever',
    butcherLabel: 'Butchery / Slagtery',
    butcherDesc: 'Sell your meat on VleisKraft™',
    step2Title: 'Your Details',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password (min 8 chars)',
    confirmPassword: 'Confirm Password',
    butcheryName: 'Butchery Name',
    butcheryType: 'Butchery Type',
    butcheryTypes: ['Independent Butchery', 'Farm Stall', 'Supermarket Deli', 'Online Only', 'Other'],
    step3Title: 'Choose Your Plan',
    step3Sub: 'Start free, upgrade anytime',
    planFreeLabel: 'Freemium',
    planFreePrice: 'R0/mo',
    planFreeDesc: 'List up to 10 products, basic analytics',
    planStarterLabel: 'Starter',
    planStarterPrice: 'R3,500/mo',
    planStarterDesc: 'Up to 50 products, order management, WhatsApp alerts',
    planProLabel: 'Pro',
    planProPrice: 'R7,500/mo',
    planProDesc: 'Unlimited products, VleisAI™, campaigns, stockvel',
    planBusinessLabel: 'Business',
    planBusinessPrice: 'R10,000/mo',
    planBusinessDesc: 'Multi-branch, B2B bulk orders, volume pricing, invoicing',
    planEnterpriseLabel: 'Enterprise',
    planEnterprisePrice: 'R15,000/mo',
    planEnterpriseDesc: 'Full suite, dedicated support, custom integrations, API access',
    popular: '⭐ Most Popular',
    next: 'Next',
    back: 'Back',
    createAccount: 'Create Account',
    creating: 'Creating account...',
    langSwitch: 'AF',
    errors: {
      userType: 'Please select your account type',
      firstName: 'First name required',
      lastName: 'Last name required',
      email: 'Valid email required',
      phone: 'Phone number required',
      password: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords do not match',
      butcheryName: 'Butchery name required',
    },
  },
  af: {
    title: 'Sluit aan by VleisKraft™',
    step1Title: 'Wie is jy?',
    step1Sub: 'Kies jou rekening tipe om te begin',
    consumerLabel: 'Verbruiker',
    consumerDesc: 'Blaai en koop premium vleis van plaaslike slagteries — gratis vir altyd',
    butcherLabel: 'Slagtery',
    butcherDesc: 'Verkoop jou vleis op VleisKraft™',
    step2Title: 'Jou Besonderhede',
    firstName: 'Voornaam',
    lastName: 'Van',
    email: 'E-posadres',
    phone: 'Telefoonnommer',
    password: 'Wagwoord (min 8 karakters)',
    confirmPassword: 'Bevestig Wagwoord',
    butcheryName: 'Slagtery Naam',
    butcheryType: 'Slagtery Tipe',
    butcheryTypes: ['Onafhanklike Slagtery', 'Plaasstal', 'Supermark Deli', 'Aanlyn Slegs', 'Ander'],
    step3Title: 'Kies Jou Plan',
    step3Sub: 'Begin gratis, opgradeer enige tyd',
    planFreeLabel: 'Gratis',
    planFreePrice: 'R0/mo',
    planFreeDesc: 'Lys tot 10 produkte, basiese analitiek',
    planStarterLabel: 'Beginners',
    planStarterPrice: 'R3 500/mo',
    planStarterDesc: 'Tot 50 produkte, bestellingbestuur, WhatsApp-kennisgewings',
    planProLabel: 'Pro',
    planProPrice: 'R7 500/mo',
    planProDesc: 'Onbeperkte produkte, VleisAI™, veldtogte, stockvel',
    planBusinessLabel: 'Besigheid',
    planBusinessPrice: 'R10 000/mo',
    planBusinessDesc: 'Multi-tak, B2B grootmaat bestellings, volumepryse, fakturering',
    planEnterpriseLabel: 'Onderneming',
    planEnterprisePrice: 'R15 000/mo',
    planEnterpriseDesc: 'Volle pakket, toegewyde ondersteuning, pasgemaakte integrasies, API-toegang',
    popular: '⭐ Gewildste',
    next: 'Volgende',
    back: 'Terug',
    createAccount: 'Skep Rekening',
    creating: 'Skep rekening...',
    langSwitch: 'EN',
    errors: {
      userType: 'Kies asseblief jou rekening tipe',
      firstName: 'Voornaam vereis',
      lastName: 'Van vereis',
      email: 'Geldige e-pos vereis',
      phone: 'Telefoonnommer vereis',
      password: 'Wagwoord moet ten minste 8 karakters wees',
      passwordMatch: 'Wagwoorde stem nie ooreen nie',
      butcheryName: 'Slagtery naam vereis',
    },
  },
} as const;

type Lang = 'en' | 'af';
type UserType = 'consumer' | 'butcher' | null;
type Plan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export default function RegisterScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [butcheryName, setButcheryName] = useState('');
  const [butcheryType, setButcheryType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const l = L[lang];

  // Consumers skip step 3 (no plan selection needed — free forever)
  const totalSteps = userType === 'consumer' ? 2 : 3;

  function toggleLang() {
    setLang(prev => prev === 'en' ? 'af' : 'en');
  }

  function animateStep(fn: () => void) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      fn();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  function handleNext() {
    if (step === 1) {
      if (!userType) { Alert.alert('', l.errors.userType); return; }
      animateStep(() => setStep(2));
    } else if (step === 2) {
      if (!firstName.trim()) { Alert.alert('', l.errors.firstName); return; }
      if (!lastName.trim()) { Alert.alert('', l.errors.lastName); return; }
      if (!email.includes('@')) { Alert.alert('', l.errors.email); return; }
      if (!phone.trim()) { Alert.alert('', l.errors.phone); return; }
      if (password.length < 8) { Alert.alert('', l.errors.password); return; }
      if (password !== confirmPassword) { Alert.alert('', l.errors.passwordMatch); return; }
      if (userType === 'butcher' && !butcheryName.trim()) { Alert.alert('', l.errors.butcheryName); return; }
      // Consumers go straight to account creation — no plan step
      if (userType === 'consumer') {
        handleCreate();
      } else {
        animateStep(() => setStep(3));
      }
    }
  }

  function handleBack() {
    if (step > 1) animateStep(() => setStep(s => s - 1));
    else router.back();
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const body: Record<string, string> = {
        firstName, lastName, email, phone, password,
        userType: userType!,
        ...(userType === 'butcher' ? { butcheryName, butcheryType, plan: selectedPlan } : {}),
      };
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userType', userType!);
      if (userType === 'butcher') await AsyncStorage.setItem('plan', selectedPlan);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const plans: { id: Plan; label: string; price: string; desc: string; popular?: boolean; color: string }[] = [
    { id: 'free',       label: l.planFreeLabel,       price: l.planFreePrice,       desc: l.planFreeDesc,       color: '#555' },
    { id: 'starter',    label: l.planStarterLabel,    price: l.planStarterPrice,    desc: l.planStarterDesc,    color: RED },
    { id: 'pro',        label: l.planProLabel,        price: l.planProPrice,        desc: l.planProDesc,        popular: true, color: '#8B0000' },
    { id: 'business',   label: l.planBusinessLabel,   price: l.planBusinessPrice,   desc: l.planBusinessDesc,   color: '#1a3a5c' },
    { id: 'enterprise', label: l.planEnterpriseLabel, price: l.planEnterprisePrice, desc: l.planEnterpriseDesc, color: GOLD },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleBack} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{l.title}</Text>
          <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
            <Text style={s.langText}>{l.langSwitch}</Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={s.stepRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[s.stepDot, step > i && s.stepDotActive, step === i + 1 && s.stepDotCurrent]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* ── STEP 1: Who are you? ── */}
            {step === 1 && (
              <View>
                <Text style={s.stepTitle}>{l.step1Title}</Text>
                <Text style={s.stepSub}>{l.step1Sub}</Text>

                <TouchableOpacity
                  style={[s.typeCard, userType === 'consumer' && s.typeCardActive]}
                  onPress={() => setUserType('consumer')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={userType === 'consumer' ? ['#1a2a1a', '#0f1f0f'] : [SURFACE, SURFACE]}
                    style={s.typeCardInner}
                  >
                    <View style={[s.typeIcon, userType === 'consumer' && { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                      <Ionicons name="storefront" size={28} color={userType === 'consumer' ? GOLD : MUTED} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.typeRow}>
                        <Text style={[s.typeLabel, userType === 'consumer' && { color: GOLD }]}>{l.consumerLabel}</Text>
                        <View style={s.freeBadge}>
                          <Text style={s.freeBadgeText}>GRATIS</Text>
                        </View>
                      </View>
                      <Text style={s.typeDesc}>{l.consumerDesc}</Text>
                    </View>
                    {userType === 'consumer' && <Ionicons name="checkmark-circle" size={22} color={GOLD} />}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.typeCard, userType === 'butcher' && s.typeCardActive]}
                  onPress={() => setUserType('butcher')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={userType === 'butcher' ? ['#2a1a1a', '#1f0f0f'] : [SURFACE, SURFACE]}
                    style={s.typeCardInner}
                  >
                    <View style={[s.typeIcon, userType === 'butcher' && { backgroundColor: 'rgba(192,57,43,0.15)' }]}>
                      <Ionicons name="cut" size={28} color={userType === 'butcher' ? RED : MUTED} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.typeLabel, userType === 'butcher' && { color: RED }]}>{l.butcherLabel}</Text>
                      <Text style={s.typeDesc}>{l.butcherDesc}</Text>
                    </View>
                    {userType === 'butcher' && <Ionicons name="checkmark-circle" size={22} color={RED} />}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2: Details ── */}
            {step === 2 && (
              <View>
                <Text style={s.stepTitle}>{l.step2Title}</Text>
                <View style={s.row}>
                  <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder={l.firstName} placeholderTextColor={MUTED} value={firstName} onChangeText={setFirstName} />
                  <TextInput style={[s.input, { flex: 1 }]} placeholder={l.lastName} placeholderTextColor={MUTED} value={lastName} onChangeText={setLastName} />
                </View>
                <TextInput style={s.input} placeholder={l.email} placeholderTextColor={MUTED} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={s.input} placeholder={l.phone} placeholderTextColor={MUTED} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TextInput style={s.input} placeholder={l.password} placeholderTextColor={MUTED} value={password} onChangeText={setPassword} secureTextEntry />
                <TextInput style={s.input} placeholder={l.confirmPassword} placeholderTextColor={MUTED} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                {userType === 'butcher' && (
                  <>
                    <TextInput style={s.input} placeholder={l.butcheryName} placeholderTextColor={MUTED} value={butcheryName} onChangeText={setButcheryName} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                      {l.butcheryTypes.map(t => (
                        <TouchableOpacity key={t} onPress={() => setButcheryType(t)} style={[s.pill, butcheryType === t && s.pillActive]}>
                          <Text style={[s.pillText, butcheryType === t && { color: GOLD }]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
                {/* Consumer info banner — no payment ever */}
                {userType === 'consumer' && (
                  <View style={s.infoBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={s.infoBannerText}>
                      {lang === 'en'
                        ? 'VleisKraft™ is completely free for consumers — no card required, ever.'
                        : 'VleisKraft™ is heeltemal gratis vir verbruikers — geen kaart ooit nodig nie.'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ── STEP 3: Butcher Plan Selection ── */}
            {step === 3 && userType === 'butcher' && (
              <View>
                <Text style={s.stepTitle}>{l.step3Title}</Text>
                <Text style={s.stepSub}>{l.step3Sub}</Text>
                {plans.map(plan => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[s.planCard, selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 }]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                  >
                    <View style={s.planHeader}>
                      <View style={[s.planDot, { backgroundColor: plan.color }]} />
                      <Text style={s.planName}>{plan.label}</Text>
                      {plan.popular && <View style={s.popularBadge}><Text style={s.popularText}>{l.popular}</Text></View>}
                      <Text style={[s.planPrice, { color: plan.color }]}>{plan.price}</Text>
                    </View>
                    <Text style={s.planDesc}>{plan.desc}</Text>
                    {selectedPlan === plan.id && (
                      <View style={s.planCheck}>
                        <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </Animated.View>
        </ScrollView>

        {/* CTA Button */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.cta}
            onPress={step < (userType === 'consumer' ? 2 : 3) ? handleNext : handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[GOLD, '#a07830']} style={s.ctaGrad}>
              {loading
                ? <ActivityIndicator color={BG} />
                : <Text style={s.ctaText}>
                    {step === totalSteps ? l.createAccount : l.next}
                  </Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontSize: 17, fontWeight: '700' },
  langBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  langText: { color: GOLD, fontSize: 12, fontWeight: '700' },
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  stepDotActive: { backgroundColor: GOLD },
  stepDotCurrent: { width: 24, backgroundColor: GOLD },
  scroll: { padding: 20, paddingBottom: 40 },
  stepTitle: { color: TEXT, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  stepSub: { color: MUTED, fontSize: 14, marginBottom: 20 },
  typeCard: { borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 14, overflow: 'hidden' },
  typeCardActive: { borderColor: GOLD },
  typeCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  typeIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeLabel: { color: TEXT, fontSize: 16, fontWeight: '700' },
  typeDesc: { color: MUTED, fontSize: 13, lineHeight: 18 },
  freeBadge: { backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)' },
  freeBadgeText: { color: '#4CAF50', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  input: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 14, color: TEXT, fontSize: 15, marginBottom: 12 },
  row: { flexDirection: 'row' },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, marginRight: 8, backgroundColor: SURFACE },
  pillActive: { borderColor: GOLD, backgroundColor: 'rgba(201,168,76,0.1)' },
  pillText: { color: MUTED, fontSize: 13 },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(76,175,80,0.08)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)', marginTop: 4 },
  infoBannerText: { color: '#4CAF50', fontSize: 13, flex: 1, lineHeight: 18 },
  planCard: { backgroundColor: SURFACE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 12 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  planName: { color: TEXT, fontSize: 15, fontWeight: '700', flex: 1 },
  planPrice: { fontSize: 15, fontWeight: '800' },
  planDesc: { color: MUTED, fontSize: 13, lineHeight: 18 },
  planCheck: { position: 'absolute', top: 12, right: 12 },
  popularBadge: { backgroundColor: 'rgba(201,168,76,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  popularText: { color: GOLD, fontSize: 10, fontWeight: '700' },
  footer: { padding: 16, paddingBottom: 24 },
  cta: { borderRadius: 14, overflow: 'hidden' },
  ctaGrad: { padding: 16, alignItems: 'center' },
  ctaText: { color: BG, fontSize: 16, fontWeight: '800' },
});
