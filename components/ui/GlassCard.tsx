import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/colors';

interface Props { children: React.ReactNode; style?: ViewStyle; }

export function GlassCard({ children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.glass} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.glass,
  },
});
