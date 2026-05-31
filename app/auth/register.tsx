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
    consumerDesc: 'Buy premium meat from local butcheries',
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
    consumerPaywallTitle: 'Premium Access Required',
    consumerPaywallSub: 'Browse and buy from SA\'s best butcheries',
    consumerPaywallPrice: 'R99/month',
    consumerPaywallFeatures: [
      'Access all butcheries & products',
      'Order tracking & history',
      'Exclusive deals & braai bundles',
      'VleisAI™ recipe suggestions',
      'Priority delivery slots',
    ],
    consumerPaywallCTA: 'Subscribe & Create Account',
    consumerPaywallNote: '7-day free trial • Cancel anytime',
  },
  af: {
    title: 'Sluit aan by VleisKraft™',
    step1Title: 'Wie is jy?',
    step1Sub: 'Kies jou rekeningtipe om te begin',
    consumerLabel: 'Verbruiker',
    consumerDesc: 'Koop premium vleis van plaaslike slagteries',
    butcherLabel: 'Slagtery',
    butcherDesc: 'Verkoop jou vleis op VleisKraft™',
    step2Title: 'Jou Besonderhede',
    firstName: 'Voornaam',
    lastName: 'Van',
    email: 'E-posadres',
    phone: 'Telefoonnommer',
    password: 'Wagwoord (min 8 karakters)',
    confirmPassword: 'Bevestig Wagwoord',
    butcheryName: 'Slagterynaam',
    butcheryType: 'Slagterytype',
    butcheryTypes: ['Onafhanklike Slagtery', 'Plaasstal', 'Supermark Deli', 'Aanlyn Slegs', 'Ander'],
    step3Title: 'Kies Jou Pakket',
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
    creating: 'Rekening word geskep...',
    langSwitch: 'EN',
    errors: {
      userType: 'Kies asseblief jou rekeningtipe',
      firstName: 'Voornaam vereis',
      lastName: 'Van vereis',
      email: 'Geldige e-pos vereis',
      phone: 'Selfoonnommer vereis',
      password: 'Wagwoord moet minstens 8 karakters wees',
      passwordMatch: 'Wagwoorde stem nie ooreen nie',
      butcheryName: 'Slagterynaam vereis',
    },
    consumerPaywallTitle: 'Premium Toegang Vereis',
    consumerPaywallSub: 'Blaai en koop by SA se beste slagteries',
    consumerPaywallPrice: 'R99/maand',
    consumerPaywallFeatures: [
      'Toegang tot alle slagteries en produkte',
      'Bestelling opsporing en geskiedenis',
      'Eksklusiewe aanbiedings en braai-bundels',
      'VleisAI™ resepvoorstelle',
      'Prioriteit afleweringsgleuwe',
    ],
    consumerPaywallCTA: 'Inteken & Skep Rekening',
    consumerPaywallNote: '7-dae gratis proeftydperk • Kanselleer enige tyd',
  },
} as const;

type Lang = 'en' | 'af';
type UserType = 'consumer' | 'butcher' | null;
type ButcherPlan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

const BUTCHER_PLANS: { id: ButcherPlan; color: string; popular?: boolean }[] = [
  { id: 'free', color: '#555555' },
  { id: 'starter', color: '#C0392B' },
  { id: 'pro', color: '#8B0000', popular: true },
  { id: 'business', color: '#2c3e50' },
  { id: 'enterprise', color: GOLD },
];

export default function RegisterScreen() {
  const [lang, setLang] = useState<Lang>('af');
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [selectedPlan, setSelectedPlan] = useState<ButcherPlan>('free');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [butcheryName, setButcheryName] = useState('');
  const [butcheryType, setButcheryType] = useState('');
  const [showPass, setShowPass] = useState(false);

  const l = L[lang];

  const getPlanLabel = (id: ButcherPlan) => {
    const map: Record<ButcherPlan, string> = {
      free: l.planFreeLabel, starter: l.planStarterLabel, pro: l.planProLabel,
      business: l.planBusinessLabel, enterprise: l.planEnterpriseLabel,
    };
    return map[id];
  };
  const getPlanPrice = (id: ButcherPlan) => {
    const map: Record<ButcherPlan, string> = {
      free: l.planFreePrice, starter: l.planStarterPrice, pro: l.planProPrice,
      business: l.planBusinessPrice, enterprise: l.planEnterprisePrice,
    };
    return map[id];
  };
  const getPlanDesc = (id: ButcherPlan) => {
    const map: Record<ButcherPlan, string> = {
      free: l.planFreeDesc, starter: l.planStarterDesc, pro: l.planProDesc,
      business: l.planBusinessDesc, enterprise: l.planEnterpriseDesc,
    };
    return map[id];
  };

  function validateStep2() {
    if (!firstName.trim()) { Alert.alert('VleisKraft™', l.errors.firstName); return false; }
    if (!lastName.trim()) { Alert.alert('VleisKraft™', l.errors.lastName); return false; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('VleisKraft™', l.errors.email); return false; }
    if (!phone.trim()) { Alert.alert('VleisKraft™', l.errors.phone); return false; }
    if (password.length < 8) { Alert.alert('VleisKraft™', l.errors.password); return false; }
    if (password !== confirmPassword) { Alert.alert('VleisKraft™', l.errors.passwordMatch); return false; }
    if (userType === 'butcher' && !butcheryName.trim()) { Alert.alert('VleisKraft™', l.errors.butcheryName); return false; }
    return true;
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const body: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        userType,
        language: lang,
      };
      if (userType === 'butcher') {
        body.butcheryName = butcheryName.trim();
        body.butcheryType = butcheryType;
        body.plan = selectedPlan;
      } else {
        body.plan = 'consumer_premium';
      }

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('userType', userType || '');
        await AsyncStorage.setItem('plan', body.plan);
        if (userType === 'consumer' || (userType === 'butcher' && selectedPlan !== 'free')) {
          router.replace('/payments/index');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('VleisKraft™', data.message || 'Registration failed');
      }
    } catch {
      Alert.alert('VleisKraft™', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 1: User Type Selection ───────────────────────────
  const renderStep1 = () => (
    <View style={s.stepContainer}>
      <Text style={s.stepTitle}>{l.step1Title}</Text>
      <Text style={s.stepSub}>{l.step1Sub}</Text>

      <TouchableOpacity
        style={[s.typeCard, userType === 'consumer' && s.typeCardActive]}
        onPress={() => setUserType('consumer')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={userType === 'consumer' ? ['rgba(201,168,76,0.15)', 'rgba(201,168,76,0.05)'] : ['rgba(255,255,255,0.04)', 'transparent']}
          style={s.typeCardGrad}
        >
          <View style={s.typeIconWrap}>
            <Text style={s.typeIcon}>🛒</Text>
          </View>
          <View style={s.typeTextWrap}>
            <Text style={[s.typeLabel, userType === 'consumer' && { color: GOLD }]}>{l.consumerLabel}</Text>
            <Text style={s.typeDesc}>{l.consumerDesc}</Text>
            <View style={s.paywallBadge}>
              <Ionicons name="lock-closed" size={11} color={GOLD} />
              <Text style={s.paywallBadgeText}>R99/mo • 7-day free trial</Text>
            </View>
          </View>
          {userType === 'consumer' && <Ionicons name="checkmark-circle" size={24} color={GOLD} />}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.typeCard, userType === 'butcher' && s.typeCardActive]}
        onPress={() => setUserType('butcher')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={userType === 'butcher' ? ['rgba(192,57,43,0.15)', 'rgba(192,57,43,0.05)'] : ['rgba(255,255,255,0.04)', 'transparent']}
          style={s.typeCardGrad}
        >
          <View style={s.typeIconWrap}>
            <Text style={s.typeIcon}>🔪</Text>
          </View>
          <View style={s.typeTextWrap}>
            <Text style={[s.typeLabel, userType === 'butcher' && { color: RED }]}>{l.butcherLabel}</Text>
            <Text style={s.typeDesc}>{l.butcherDesc}</Text>
            <View style={[s.paywallBadge, { borderColor: 'rgba(192,57,43,0.4)' }]}>
              <Ionicons name="storefront" size={11} color={RED} />
              <Text style={[s.paywallBadgeText, { color: RED }]}>Freemium → R3,500 → R15,000/mo</Text>
            </View>
          </View>
          {userType === 'butcher' && <Ionicons name="checkmark-circle" size={24} color={RED} />}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.nextBtn, !userType && s.nextBtnDisabled]}
        onPress={() => {
          if (!userType) { Alert.alert('VleisKraft™', l.errors.userType); return; }
          setStep(2);
        }}
        disabled={!userType}
      >
        <LinearGradient colors={userType ? [GOLD, '#A07830'] : ['#333', '#222']} style={s.nextBtnGrad}>
          <Text style={s.nextBtnText}>{l.next}</Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ─── Step 2: Details ────────────────────────────────────────
  const renderStep2 = () => (
    <View style={s.stepContainer}>
      <Text style={s.stepTitle}>{l.step2Title}</Text>

      <View style={s.row2}>
        <TextInput style={[s.input, { flex: 1, marginRight: 8 }]} placeholder={l.firstName} placeholderTextColor={MUTED}
          value={firstName} onChangeText={setFirstName} />
        <TextInput style={[s.input, { flex: 1 }]} placeholder={l.lastName} placeholderTextColor={MUTED}
          value={lastName} onChangeText={setLastName} />
      </View>
      <TextInput style={s.input} placeholder={l.email} placeholderTextColor={MUTED}
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={s.input} placeholder={l.phone} placeholderTextColor={MUTED}
        value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      {userType === 'butcher' && (
        <>
          <TextInput style={s.input} placeholder={l.butcheryName} placeholderTextColor={MUTED}
            value={butcheryName} onChangeText={setButcheryName} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {l.butcheryTypes.map((bt) => (
              <TouchableOpacity key={bt} onPress={() => setButcheryType(bt)}
                style={[s.pill, butcheryType === bt && s.pillActive]}>
                <Text style={[s.pillText, butcheryType === bt && s.pillTextActive]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <View style={s.passWrap}>
        <TextInput style={[s.input, { flex: 1 }]} placeholder={l.password} placeholderTextColor={MUTED}
          value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
          <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={MUTED} />
        </TouchableOpacity>
      </View>
      <TextInput style={s.input} placeholder={l.confirmPassword} placeholderTextColor={MUTED}
        value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <View style={s.btnRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={18} color={MUTED} />
          <Text style={s.backBtnText}>{l.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nextBtnSmall}
          onPress={() => { if (validateStep2()) { userType === 'butcher' ? setStep(3) : handleSubmit(); } }}>
          <LinearGradient colors={[GOLD, '#A07830']} style={s.nextBtnGrad}>
            {loading ? <ActivityIndicator color="#000" /> : (
              <>
                <Text style={s.nextBtnText}>{userType === 'butcher' ? l.next : l.createAccount}</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Step 3: Butcher Plan Selection ─────────────────────────
  const renderStep3 = () => (
    <View style={s.stepContainer}>
      <Text style={s.stepTitle}>{l.step3Title}</Text>
      <Text style={s.stepSub}>{l.step3Sub}</Text>

      {BUTCHER_PLANS.map((plan) => {
        const isSelected = selectedPlan === plan.id;
        return (
          <TouchableOpacity key={plan.id} onPress={() => setSelectedPlan(plan.id)} activeOpacity={0.85}>
            <LinearGradient
              colors={isSelected ? [`${plan.color}22`, `${plan.color}08`] : ['rgba(255,255,255,0.03)', 'transparent']}
              style={[s.planCard, isSelected && { borderColor: plan.color, borderWidth: 1.5 }]}
            >
              {plan.popular && (
                <View style={[s.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={s.popularText}>{l.popular}</Text>
                </View>
              )}
              <View style={s.planRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.planLabel, { color: isSelected ? plan.color : TEXT }]}>{getPlanLabel(plan.id)}</Text>
                  <Text style={s.planPrice}>{getPlanPrice(plan.id)}</Text>
                  <Text style={s.planDesc}>{getPlanDesc(plan.id)}</Text>
                </View>
                <View style={[s.planRadio, isSelected && { borderColor: plan.color, backgroundColor: plan.color }]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}

      <View style={s.btnRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={18} color={MUTED} />
          <Text style={s.backBtnText}>{l.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nextBtnSmall} onPress={handleSubmit} disabled={loading}>
          <LinearGradient colors={[GOLD, '#A07830']} style={s.nextBtnGrad}>
            {loading ? <ActivityIndicator color="#000" /> : (
              <>
                <Text style={s.nextBtnText}>{l.createAccount}</Text>
                <Ionicons name="checkmark" size={18} color="#000" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <LinearGradient colors={['#C9A84C', '#8B0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.logoWrap}>
              <Text style={s.logoText}>VK</Text>
            </LinearGradient>
            <Text style={s.appTitle}>VleisKraft™</Text>
            <Text style={s.appSub}>SA se Premium Vleis Handelsmerk</Text>
          </View>

          {/* Lang toggle */}
          <View style={s.langRow}>
            {(['af', 'en'] as Lang[]).map((l2) => (
              <TouchableOpacity key={l2} onPress={() => setLang(l2)} style={[s.langBtn, lang === l2 && s.langBtnActive]}>
                <Text style={[s.langBtnText, lang === l2 && { color: GOLD }]}>{l2.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Step indicator */}
          <View style={s.stepIndicator}>
            {[1, 2, userType === 'butcher' ? 3 : null].filter(Boolean).map((n, i) => (
              <React.Fragment key={n}>
                <View style={[s.stepDot, step >= (n as number) && s.stepDotActive]}>
                  <Text style={[s.stepDotText, step >= (n as number) && { color: '#000' }]}>{n}</Text>
                </View>
                {i < (userType === 'butcher' ? 2 : 1) && <View style={[s.stepLine, step > (n as number) && s.stepLineActive]} />}
              </React.Fragment>
            ))}
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <TouchableOpacity onPress={() => router.push('/auth/login')} style={s.loginLink}>
            <Text style={s.loginLinkText}>
              {lang === 'af' ? 'Het jy reeds \'n rekening? ' : 'Already have an account? '}
              <Text style={{ color: GOLD }}>{lang === 'af' ? 'Teken in' : 'Log in'}</Text>
            </Text>
          </TouchableOpacity>
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
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 16 },
  logoWrap: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#000' },
  appTitle: { fontSize: 26, fontWeight: '800', color: TEXT, letterSpacing: 1 },
  appSub: { fontSize: 13, color: MUTED, marginTop: 4 },
  langRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  langBtnActive: { borderColor: GOLD, backgroundColor: 'rgba(201,168,76,0.12)' },
  langBtnText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingHorizontal: 40 },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: SURFACE },
  stepDotActive: { borderColor: GOLD, backgroundColor: GOLD },
  stepDotText: { fontSize: 13, fontWeight: '700', color: MUTED },
  stepLine: { flex: 1, height: 1.5, backgroundColor: BORDER, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: GOLD },
  stepContainer: { paddingHorizontal: 20 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 6 },
  stepSub: { fontSize: 14, color: MUTED, marginBottom: 20 },
  typeCard: { borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 14, overflow: 'hidden' },
  typeCardActive: { borderColor: GOLD },
  typeCardGrad: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  typeIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  typeIcon: { fontSize: 26 },
  typeTextWrap: { flex: 1 },
  typeLabel: { fontSize: 17, fontWeight: '700', color: TEXT, marginBottom: 3 },
  typeDesc: { fontSize: 13, color: MUTED, marginBottom: 6 },
  paywallBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  paywallBadgeText: { fontSize: 11, color: GOLD, fontWeight: '600' },
  input: { backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: TEXT, fontSize: 15, marginBottom: 12 },
  row2: { flexDirection: 'row', marginBottom: 0 },
  passWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eyeBtn: { position: 'absolute', right: 16, padding: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORDER, marginRight: 8, backgroundColor: SURFACE },
  pillActive: { borderColor: RED, backgroundColor: 'rgba(192,57,43,0.15)' },
  pillText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: RED },
  planCard: { borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 12, padding: 18, overflow: 'hidden' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planLabel: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  planPrice: { fontSize: 22, fontWeight: '900', color: TEXT, marginBottom: 4 },
  planDesc: { fontSize: 13, color: MUTED, lineHeight: 18 },
  planRadio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: BORDER, alignItems: 'center', justifyContent: 'center' },
  popularBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  popularText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: BORDER },
  backBtnText: { color: MUTED, fontSize: 15, fontWeight: '600' },
  nextBtn: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  nextBtnSmall: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  nextBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },
  loginLink: { alignItems: 'center', marginTop: 24 },
  loginLinkText: { color: MUTED, fontSize: 14 },
});
