import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from './GradientButton';
import { Colors, Spacing, Radius } from '@/constants/colors';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = 'flame-outline', title, subtitle, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={Colors.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <GradientButton onPress={onCta} label={ctaLabel} style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.elevated, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.lg },
  cta: { minWidth: 200 },
});
