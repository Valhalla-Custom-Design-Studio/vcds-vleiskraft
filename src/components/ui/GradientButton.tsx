import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export function GradientButton({ label, onPress, style, loading, disabled, variant = 'primary' }: Props) {
  const isOutline = variant === 'outline';
  const bg = isOutline
    ? 'transparent'
    : variant === 'danger'
    ? Colors.error
    : variant === 'secondary'
    ? Colors.secondary
    : Colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled || loading ? 0.6 : 1 },
        isOutline && { borderWidth: 2, borderColor: Colors.primary },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[styles.label, isOutline && { color: Colors.primary }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
