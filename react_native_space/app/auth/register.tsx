import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useShake } from '../../src/hooks/useShake';
import { Colors, Spacing, FontSize, Radius } from '../../src/constants/theme';
import GradientButton from '../../src/components/GradientButton';
import ScreenContainer from '../../src/components/ScreenContainer';
import api from '../../src/services/api';

type AccountType = 'consumer' | 'butchery';

const BUTCHERY_TIERS = [
  { id: 'starter', label: 'Beginners / Starter', price: 3500, desc: 'Tot 500 produkte, 1 gebruiker, basiese analitiek' },
  { id: 'growth', label: 'Groei / Growth', price: 7500, desc: 'Onbeperkte produkte, 5 gebruikers, VleisAI™, kampanjes' },
  { id: 'enterprise', label: 'Onderneming / Enterprise', price: 15000, desc: 'Multi-tak, API toegang, toegewyde ondersteuning' },
];

const PAYFAST_LIVE = 'https://www.payfast.co.za/eng/process';
const MERCHANT_ID = '11910323';
const MERCHANT_KEY = 'f61uspt7vtdta';
const APP_ORIGIN = 'https://vleiskraft-api.abacusai.app';

export default function RegisterScreen() {
  const { signup } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();
  const { shakeAnim, shake } = useShake();

  // Step management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>('consumer');
  const [selectedTier, setSelectedTier] = useState('starter');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [butcheryName, setButcheryName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');

  // Butchery list for consumer selection
  const [butcheries, setButcheries] = useState<any[]>([]);
  const [selectedButchery, setSelectedButchery] = useState<string | null>(null);
  const [loadingButcheries, setLoadingButcheries] = useState(false);

  useEffect(() => {
    if (accountType === 'consumer') {
      setLoadingButcheries(true);
      api.get('/api/tenant').then(r => {
        setButcheries(r?.data?.items ?? r?.data ?? []);
      }).catch(() => {}).finally(() => setLoadingButcheries(false));
    }
  }, [accountType]);

  const triggerError = (msg: string) => {
    setError(msg);
    shake();
    if (Platform.OS !== 'web') Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Error);
  };

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      triggerError(lang === 'AF' ? 'Vul asb alle velde in' : 'Please fill in all fields');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      triggerError(lang === 'AF' ? 'Ongeldige e-posadres' : 'Invalid email address');
      return false;
    }
    if (password !== confirmPw) {
      triggerError(lang === 'AF' ? 'Wagwoorde stem nie ooreen nie' : 'Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      triggerError(lang === 'AF' ? 'Wagwoord moet minstens 6 karakters wees' : 'Password must be at least 6 characters');
      return false;
    }
    if (accountType === 'butchery' && !butcheryName.trim()) {
      triggerError(lang === 'AF' ? 'Voer jou slaghuisnaam in' : 'Enter your butchery name');
      return false;
    }
    return true;
  };

  const handlePayFastPayment = async () => {
    const tier = BUTCHERY_TIERS.find(t => t.id === selectedTier)!;
    setPaymentLoading(true);
    try {
      const res = await api.post('/api/payments/checkout', {
        amount: tier.price,
        item_name: `VleisKraft™ ${tier.label} — Maandelikse Intekening`,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        metadata: { accountType: 'butchery', tier: selectedTier, butcheryName: butcheryName.trim() },
      });
      if (res?.data?.redirectUrl) {
        await Linking.openURL(res.data.redirectUrl);
      } else {
        Alert.alert(lang === 'AF' ? 'Fout' : 'Error', lang === 'AF' ? 'Kon nie betaling begin nie' : 'Could not initiate payment');
      }
    } catch {
      Alert.alert(lang === 'AF' ? 'Fout' : 'Error', lang === 'AF' ? 'Betalingsdiens onbeskikbaar' : 'Payment service unavailable');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        accountType,
        butcheryName: accountType === 'butchery' ? butcheryName.trim() : undefined,
        tenantId: accountType === 'consumer' ? selectedButchery ?? undefined : undefined,
        subscriptionTier: accountType === 'butchery' ? selectedTier : 'free',
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? (lang === 'AF' ? 'Registrasie het misluk' : 'Registration failed');
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary ?? '#F0F0F0'} />
          </Pressable>

          {/* Header */}
          <Text style={styles.heading}>
            {lang === 'AF' ? 'Skep Rekening' : 'Create Account'}
          </Text>

          {/* Step Indicator */}
          <View style={styles.stepRow}>
            {[1,2,3].map(n => (
              <View key={n} style={styles.stepItem}>
                <View style={[styles.stepDot, step >= n && styles.stepDotActive]}>
                  <Text style={[styles.stepNum, step >= n && styles.stepNumActive]}>{n}</Text>
                </View>
                {n < 3 && <View style={[styles.stepLine, step > n && styles.stepLineActive]} />}
              </View>
            ))}
          </View>

          {/* ── STEP 1: Account Type ── */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>
                {lang === 'AF' ? 'Kies jou rekeningtipe' : 'Choose your account type'}
              </Text>
              <TouchableOpacity
                style={[styles.typeCard, accountType === 'consumer' && styles.typeCardActive]}
                onPress={() => setAccountType('consumer')}
              >
                <Text style={styles.typeIcon}>🛒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, accountType === 'consumer' && styles.typeLabelActive]}>
                    {lang === 'AF' ? 'Verbruiker / Consumer' : 'Consumer'}
                  </Text>
                  <Text style={styles.typeSub}>
                    {lang === 'AF' ? 'Koop vleis by jou plaaslike slaghuise — GRATIS' : 'Buy meat from local butcheries — FREE'}
                  </Text>
                </View>
                {accountType === 'consumer' && <Ionicons name="checkmark-circle" size={22} color={Colors.primary ?? '#C8102E'} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeCard, accountType === 'butchery' && styles.typeCardActive]}
                onPress={() => setAccountType('butchery')}
              >
                <Text style={styles.typeIcon}>🏪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, accountType === 'butchery' && styles.typeLabelActive]}>
                    {lang === 'AF' ? 'Slaghuisbestuurder / Butchery' : 'Butchery'}
                  </Text>
                  <Text style={styles.typeSub}>
                    {lang === 'AF' ? 'Bestuur jou slaghuisplatform — vanaf R3,500/maand' : 'Manage your butchery platform — from R3,500/month'}
                  </Text>
                </View>
                {accountType === 'butchery' && <Ionicons name="checkmark-circle" size={22} color={Colors.primary ?? '#C8102E'} />}
              </TouchableOpacity>

              <GradientButton title={lang === 'AF' ? 'Volgende / Next' : 'Next'} onPress={() => setStep(2)} />
            </View>
          )}

          {/* ── STEP 2: Personal Details ── */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>
                {lang === 'AF' ? 'Persoonlike besonderhede' : 'Personal details'}
              </Text>

              {[
                { label: lang === 'AF' ? 'Voornaam' : 'First Name', value: firstName, setter: setFirstName, placeholder: lang === 'AF' ? 'Jan' : 'John' },
                { label: lang === 'AF' ? 'Van' : 'Last Name', value: lastName, setter: setLastName, placeholder: lang === 'AF' ? 'van der Merwe' : 'Smith' },
                { label: lang === 'AF' ? 'E-posadres' : 'Email', value: email, setter: setEmail, placeholder: 'jan@voorbeeld.co.za', keyboard: 'email-address' as any },
                { label: lang === 'AF' ? 'Selfoon' : 'Phone', value: phone, setter: setPhone, placeholder: '082 000 0000', keyboard: 'phone-pad' as any },
              ].map(field => (
                <View key={field.label} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#555"
                    keyboardType={field.keyboard}
                    autoCapitalize="none"
                  />
                </View>
              ))}

              {accountType === 'butchery' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{lang === 'AF' ? 'Slaghuisnaam' : 'Butchery Name'}</Text>
                  <TextInput
                    style={styles.input}
                    value={butcheryName}
                    onChangeText={setButcheryName}
                    placeholder={lang === 'AF' ? 'Bv: La Oma Slaghuis' : 'E.g.: La Oma Butchery'}
                    placeholderTextColor="#555"
                  />
                </View>
              )}

              {accountType === 'consumer' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{lang === 'AF' ? 'Kies jou slaghuise (opsioneel)' : 'Select your butchery (optional)'}</Text>
                  {loadingButcheries ? (
                    <ActivityIndicator color={Colors.primary ?? '#C8102E'} />
                  ) : (
                    <ScrollView style={styles.butcheryList} nestedScrollEnabled>
                      {butcheries.map((b: any) => (
                        <TouchableOpacity
                          key={b.id}
                          style={[styles.butcheryItem, selectedButchery === b.id && styles.butcheryItemActive]}
                          onPress={() => setSelectedButchery(selectedButchery === b.id ? null : b.id)}
                        >
                          <Text style={[styles.butcheryName, selectedButchery === b.id && styles.butcheryNameActive]}>{b.name}</Text>
                          {b.address && <Text style={styles.butcheryAddr}>{b.address}</Text>}
                          {selectedButchery === b.id && <Ionicons name="checkmark-circle" size={18} color={Colors.primary ?? '#C8102E'} />}
                        </TouchableOpacity>
                      ))}
                      {butcheries.length === 0 && (
                        <Text style={styles.noButcheries}>{lang === 'AF' ? 'Geen slaghuise beskikbaar nie' : 'No butcheries available'}</Text>
                      )}
                    </ScrollView>
                  )}
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{lang === 'AF' ? 'Wagwoord' : 'Password'}</Text>
                <View style={styles.pwRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPw}
                    placeholder="••••••••"
                    placeholderTextColor="#555"
                  />
                  <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off' : 'eye'} size={20} color="#888" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{lang === 'AF' ? 'Bevestig wagwoord' : 'Confirm Password'}</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry={!showPw}
                  placeholder="••••••••"
                  placeholderTextColor="#555"
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
                  <Text style={styles.backStepText}>{lang === 'AF' ? 'Terug' : 'Back'}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <GradientButton
                    title={lang === 'AF' ? 'Volgende / Next' : 'Next'}
                    onPress={() => { if (validateStep1()) setStep(3); }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ── STEP 3: Plan & Payment ── */}
          {step === 3 && (
            <View>
              {accountType === 'consumer' ? (
                <View>
                  <Text style={styles.stepTitle}>{lang === 'AF' ? 'Gratis rekening — bevestig' : 'Free account — confirm'}</Text>
                  <View style={styles.freeCard}>
                    <Text style={styles.freeIcon}>🎉</Text>
                    <Text style={styles.freeTitle}>{lang === 'AF' ? 'Verbruikersrekening is GRATIS!' : 'Consumer account is FREE!'}</Text>
                    <Text style={styles.freeSub}>{lang === 'AF' ? 'Geen betaling benodig nie. Registreer en begin koop.' : 'No payment required. Register and start shopping.'}</Text>
                  </View>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(2)}>
                      <Text style={styles.backStepText}>{lang === 'AF' ? 'Terug' : 'Back'}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <GradientButton
                        title={loading ? (lang === 'AF' ? 'Registreer...' : 'Registering...') : (lang === 'AF' ? 'Skep Rekening' : 'Create Account')}
                        onPress={handleRegister}
                        disabled={loading}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.stepTitle}>{lang === 'AF' ? 'Kies jou plan' : 'Choose your plan'}</Text>
                  {BUTCHERY_TIERS.map(tier => (
                    <TouchableOpacity
                      key={tier.id}
                      style={[styles.tierCard, selectedTier === tier.id && styles.tierCardActive]}
                      onPress={() => setSelectedTier(tier.id)}
                    >
                      <View style={styles.tierHeader}>
                        <Text style={[styles.tierLabel, selectedTier === tier.id && styles.tierLabelActive]}>{tier.label}</Text>
                        <Text style={styles.tierPrice}>R{tier.price.toLocaleString()}/mo</Text>
                      </View>
                      <Text style={styles.tierDesc}>{tier.desc}</Text>
                      {selectedTier === tier.id && <Ionicons name="checkmark-circle" size={18} color={Colors.primary ?? '#C8102E'} style={{ marginTop: 8 }} />}
                    </TouchableOpacity>
                  ))}

                  <View style={styles.paymentNote}>
                    <Ionicons name="lock-closed" size={16} color="#10B981" />
                    <Text style={styles.paymentNoteText}>
                      {lang === 'AF'
                        ? 'Betaling via PayFast — veilig en geënkripteer. Jy sal aangeteken word na suksesvolle betaling.'
                        : 'Payment via PayFast — secure and encrypted. You will be logged in after successful payment.'}
                    </Text>
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(2)}>
                      <Text style={styles.backStepText}>{lang === 'AF' ? 'Terug' : 'Back'}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <GradientButton
                        title={paymentLoading ? 'PayFast...' : (lang === 'AF' ? '💳 Betaal & Registreer' : '💳 Pay & Register')}
                        onPress={handlePayFastPayment}
                        disabled={paymentLoading}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          <Pressable onPress={() => router.push('/auth/login' as never)} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              {lang === 'AF' ? 'Het jy reeds 'n rekening? Teken in' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  backBtn: { marginBottom: 16, padding: 4, alignSelf: 'flex-start' },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary ?? '#F0F0F0', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  stepDotActive: { backgroundColor: Colors.primary ?? '#C8102E', borderColor: Colors.primary ?? '#C8102E' },
  stepNum: { color: '#888', fontWeight: '700', fontSize: 14 },
  stepNumActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary ?? '#C8102E' },
  stepTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary ?? '#F0F0F0', marginBottom: 16 },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  typeCardActive: { borderColor: Colors.primary ?? '#C8102E', backgroundColor: 'rgba(200,16,46,0.08)' },
  typeIcon: { fontSize: 28 },
  typeLabel: { color: Colors.textPrimary ?? '#F0F0F0', fontWeight: '700', fontSize: 15 },
  typeLabelActive: { color: Colors.primary ?? '#C8102E' },
  typeSub: { color: '#888', fontSize: 12, marginTop: 2 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', color: Colors.textPrimary ?? '#F0F0F0', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pwRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  butcheryList: { maxHeight: 200, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  butcheryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  butcheryItemActive: { backgroundColor: 'rgba(200,16,46,0.08)' },
  butcheryName: { color: Colors.textPrimary ?? '#F0F0F0', fontWeight: '600', fontSize: 14, flex: 1 },
  butcheryNameActive: { color: Colors.primary ?? '#C8102E' },
  butcheryAddr: { color: '#888', fontSize: 12, flex: 1 },
  noButcheries: { color: '#888', fontSize: 13, padding: 12, textAlign: 'center' },
  tierCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  tierCardActive: { borderColor: Colors.primary ?? '#C8102E', backgroundColor: 'rgba(200,16,46,0.08)' },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { color: Colors.textPrimary ?? '#F0F0F0', fontWeight: '700', fontSize: 15 },
  tierLabelActive: { color: Colors.primary ?? '#C8102E' },
  tierPrice: { color: Colors.secondary ?? '#D4A56A', fontWeight: '800', fontSize: 16 },
  tierDesc: { color: '#888', fontSize: 12, marginTop: 6, lineHeight: 18 },
  paymentNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 10, padding: 12, marginVertical: 14, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  paymentNoteText: { color: '#10B981', fontSize: 12, flex: 1, lineHeight: 18 },
  freeCard: { alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  freeIcon: { fontSize: 40, marginBottom: 10 },
  freeTitle: { color: '#10B981', fontWeight: '700', fontSize: 18, textAlign: 'center' },
  freeSub: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 6 },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backStepBtn: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center' },
  backStepText: { color: '#888', fontWeight: '600', fontSize: 14 },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: Colors.secondary ?? '#D4A56A', fontSize: 14 },
});
