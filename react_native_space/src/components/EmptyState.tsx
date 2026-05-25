import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

function EmptyStateComponent({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={48} color={Colors.textSecondary} style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  icon: { marginBottom: Spacing.md },
  title: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },
});

export { EmptyStateComponent as EmptyState };
export default EmptyStateComponent;
