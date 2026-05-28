import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/colors';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

function EmptyStateComponent({ icon, title, subtitle, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={48} color={Colors.textSecondary} style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {ctaLabel && onCta ? (
        <TouchableOpacity style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  icon: { marginBottom: Spacing.md },
  title: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },
  cta: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 8 },
  ctaText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});

export { EmptyStateComponent as EmptyState };
export default EmptyStateComponent;
