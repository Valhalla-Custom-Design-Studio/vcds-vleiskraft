import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

interface Props {
  label?: string;
  title?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function GradientButtonComponent({ label, title, onPress, loading, disabled, style }: Props) {
  const text = label ?? title ?? '';
  return (
    <TouchableOpacity
      style={[styles.btn, (loading || disabled) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={styles.label}>{text}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnDisabled: { opacity: 0.5 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export { GradientButtonComponent as GradientButton };
export default GradientButtonComponent;
