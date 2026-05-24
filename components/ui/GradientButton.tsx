import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Radius } from '@/constants/colors';

interface Props {
  onPress: () => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'gold';
  style?: ViewStyle;
}

export function GradientButton({ onPress, label, loading, disabled, variant = 'primary', style }: Props) {
  const colors: [string, string] = variant === 'gold'
    ? [Colors.secondary, Colors.secondaryDark]
    : [Colors.primary, Colors.primaryDark];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled || loading} style={[styles.wrapper, style]}>
      <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.label}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: Radius.md, overflow: 'hidden' },
  gradient: { height: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
