import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, ActivityIndicator, Platform,
  KeyboardAvoidingView, SafeAreaView, StatusBar,
  Animated, Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SA_PROVINCES = [
  'Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Mpumalanga', 'Limpopo', 'Northern Cape', 'North West',
];

interface Butchery {
  id: string;
  name: string;
  city: string;
  province: string;
  address?: string;
  phone?: string;
  is_verified: boolean;
  tier: string;
  logo_url?: string;
}

interface Props {
  value?: Butchery | null;
  onChange: (butchery: Butchery | null) => void;
  lang?: 'en' | 'af';
  required?: boolean;
  userProvince?: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com';

const labels = {
  en: {
    title: 'Select Your Butchery',
    search: 'Search butcheries...',
    province: 'Filter by province',
    allProvinces: 'All Provinces',
    nearby: 'Nearby Butcheries',
    inProvince: 'Butcheries in Your Province',
    allButcheries: 'All Butcheries',
    noResults: 'No butcheries found',
    noResultsHint: 'Try a different province or search term',
    optional: 'Optional — you can change this later in your profile',
    skip: 'Skip for now',
    select: 'Select',
    selected: 'Selected',
    change: 'Change Butchery',
    verified: 'Verified',
    loading: 'Loading butcheries...',
    error: 'Failed to load butcheries',
    retry: 'Retry',
    close: 'Close',
  },
  af: {
    title: 'Kies Jou Slagtery',
    search: 'Soek slagteries...',
    province: 'Filter per provinsie',
    allProvinces: 'Alle Provinsies',
    nearby: 'Nabyste Slagteries',
    inProvince: 'Slagteries in Jou Provinsie',
    allButcheries: 'Alle Slagteries',
    noResults: 'Geen slagteries gevind nie',
    noResultsHint: "Probeer 'n ander provinsie of soekterm",
    optional: 'Opsioneel — jy kan dit later in jou profiel verander',
    skip: 'Slaan oor vir nou',
    select: 'Kies',
    selected: 'Gekies',
    change: 'Verander Slagtery',
    verified: 'Geverifieer',
    loading: 'Laai slagteries...',
    error: 'Kon nie slagteries laai nie',
    retry: 'Probeer Weer',
    close: 'Sluit',
  },
};

export function ButcherySelector({ value, onChange, lang = 'en', required = false, userProvince }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [butcheries, setButcheries] = useState<Butchery[]>([]);
  const [filtered, setFiltered] = useState<Butchery[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>(userProvince || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const t = labels[lang];

  const fetchButcheries = useCallback(async (province?: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (province) params.set('province', province);
      const res = await fetch(`${API_BASE}/api/butcheries?${params}`);
      const data = await res.json();
      if (data.success) {
        setButcheries(data.butcheries);
        setFiltered(data.butcheries);
      } else {
        setError(t.error);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  useEffect(() => {
    if (modalVisible) {
      fetchButcheries(selectedProvince || undefined);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, selectedProvince]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(butcheries);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(butcheries.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.province.toLowerCase().includes(q)
    ));
  }, [search, butcheries]);

  const handleSelect = (b: Butchery) => {
    onChange(b);
    setModalVisible(false);
    setSearch('');
  };

  const handleSkip = () => {
    onChange(null);
    setModalVisible(false);
    setSearch('');
  };

  const renderItem = ({ item }: { item: Butchery }) => (
    <TouchableOpacity
      style={[styles.item, value?.id === item.id && styles.itemSelected]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${t.select} ${item.name}`}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.city} · {item.province}</Text>
        {item.address ? <Text style={styles.itemAddr} numberOfLines={1}>{item.address}</Text> : null}
      </View>
      <View style={styles.itemRight}>
        {item.is_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ {t.verified}</Text>
          </View>
        )}
        {value?.id === item.id && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Trigger Button */}
      <TouchableOpacity
        style={[styles.trigger, value && styles.triggerSelected]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={value ? `${t.change}: ${value.name}` : t.title}
      >
        {value ? (
          <View style={styles.triggerContent}>
            <View>
              <Text style={styles.triggerName}>{value.name}</Text>
              <Text style={styles.triggerSub}>{value.city} · {value.province}</Text>
            </View>
            <Text style={styles.triggerChange}>{t.change}</Text>
          </View>
        ) : (
          <Text style={styles.triggerPlaceholder}>
            {required ? '🏪 ' : '🏪 '}{t.title}
          </Text>
        )}
      </TouchableOpacity>

      {!required && (
        <Text style={styles.optionalHint}>{t.optional}</Text>
      )}

      {/* Modal — uses Modal with transparent + slide animation
          to avoid clashing with Android/iOS system overlays,
          number pickers, date pickers, and address pickers */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setModalVisible(false)} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <SafeAreaView style={styles.sheetInner}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}
                  accessibilityLabel={t.close}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search — uses KeyboardAvoidingView to prevent
                  keyboard from covering input on both platforms */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
              >
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t.search}
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                    accessibilityLabel={t.search}
                  />
                </View>
              </KeyboardAvoidingView>

              {/* Province filter — horizontal scroll, no overlap with list */}
              <View style={styles.provinceRow}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ label: t.allProvinces, value: '' }, ...SA_PROVINCES.map(p => ({ label: p, value: p }))]}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.provinceChip, selectedProvince === item.value && styles.provinceChipActive]}
                      onPress={() => {
                        setSelectedProvince(item.value);
                        setSearch('');
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <Text style={[styles.provinceChipText, selectedProvince === item.value && styles.provinceChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                />
              </View>

              {/* List */}
              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator color="#B22222" size="large" />
                  <Text style={styles.loadingText}>{t.loading}</Text>
                </View>
              ) : error ? (
                <View style={styles.center}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => fetchButcheries(selectedProvince || undefined)}>
                    <Text style={styles.retryText}>{t.retry}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.list}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View style={styles.center}>
                      <Text style={styles.emptyText}>{t.noResults}</Text>
                      <Text style={styles.emptyHint}>{t.noResultsHint}</Text>
                    </View>
                  }
                />
              )}

              {/* Skip button — not required */}
              {!required && (
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                  <Text style={styles.skipText}>{t.skip}</Text>
                </TouchableOpacity>
              )}
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(178,34,34,0.3)',
    backgroundColor: 'rgba(178,34,34,0.06)',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 4,
  },
  triggerSelected: {
    borderColor: '#B22222',
    backgroundColor: 'rgba(178,34,34,0.1)',
  },
  triggerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerName: { color: '#F5F0FF', fontSize: 15, fontWeight: '600' },
  triggerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  triggerChange: { color: '#B22222', fontSize: 13, fontWeight: '600' },
  triggerPlaceholder: { color: '#9CA3AF', fontSize: 15 },
  optionalHint: { color: '#6B7280', fontSize: 12, marginBottom: 8, paddingHorizontal: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: {
    backgroundColor: '#0F0F1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    minHeight: SCREEN_HEIGHT * 0.5,
    borderTopWidth: 1,
    borderColor: 'rgba(178,34,34,0.2)',
  },
  sheetInner: { flex: 1 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: '#F5F0FF', fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  closeText: { color: '#9CA3AF', fontSize: 16 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    color: '#F5F0FF', paddingHorizontal: 16, fontSize: 15,
  },
  provinceRow: { paddingVertical: 8 },
  provinceChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  provinceChipActive: { backgroundColor: '#B22222', borderColor: '#B22222' },
  provinceChipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  provinceChipTextActive: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 44,
  },
  itemSelected: { borderColor: '#B22222', backgroundColor: 'rgba(178,34,34,0.1)' },
  itemLeft: { flex: 1 },
  itemName: { color: '#F5F0FF', fontSize: 15, fontWeight: '600' },
  itemSub: { color: '#9CA3AF', fontSize: 13, marginTop: 2 },
  itemAddr: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  verifiedBadge: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  verifiedText: { color: '#22C55E', fontSize: 11, fontWeight: '600' },
  selectedBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#B22222', alignItems: 'center', justifyContent: 'center',
  },
  selectedText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: 14 },
  errorText: { color: '#EF4444', fontSize: 15, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: '#B22222', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptyHint: { color: '#6B7280', fontSize: 13, textAlign: 'center', marginTop: 8 },
  skipBtn: {
    margin: 16, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  skipText: { color: '#9CA3AF', fontSize: 15 },
});
