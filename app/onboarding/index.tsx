import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/GradientButton';
import { Colors, Spacing, Radius } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';

const { width } = Dimensions.get('window');

const slides = (lang: 'af' | 'en') => [
  { icon: 'bag-handle-outline' as const, gradient: ['#C8102E', '#8B0A1E'] as [string,string], title: t('welcomeTitle', lang), sub: t('welcomeSubtitle', lang) },
  { icon: 'cart-outline' as const, gradient: ['#D4A56A', '#B8864A'] as [string,string], title: t('orderTitle', lang), sub: t('orderSubtitle', lang) },
  { icon: 'trophy-outline' as const, gradient: ['#4A7C59', '#27AE60'] as [string,string], title: t('rewardsTitle', lang), sub: t('rewardsSubtitle', lang) },
];

export default function OnboardingScreen() {
  const { language } = useAuthStore();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const s = slides(language);

  const complete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)/home');
  };

  const next = () => {
    if (index < s.length - 1) {
      const ni = index + 1;
      setIndex(ni);
      scrollRef.current?.scrollTo({ x: ni * width, animated: true });
    } else {
      complete();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={complete}>
        <Text style={styles.skipText}>{t('skip', language)}</Text>
      </TouchableOpacity>
      <ScrollView
        ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEnabled={false}
      >
        {s.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <LinearGradient colors={slide.gradient} style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={52} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.sub}>{slide.sub}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {s.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <GradientButton
        onPress={next}
        label={index === s.length - 1 ? t('letsGo', language) : t('next', language)}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', paddingBottom: Spacing.xxl },
  skip: { position: 'absolute', top: 60, right: Spacing.lg, zIndex: 10 },
  skipText: { color: Colors.textSecondary, fontSize: 14 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.md },
  sub: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.elevated },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  btn: { width: width - Spacing.xl * 2 },
});
