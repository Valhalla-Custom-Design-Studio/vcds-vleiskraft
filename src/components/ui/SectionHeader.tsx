import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  color?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, color = '#C9A84C' }) => (
  <Text style={[styles.header, { color }]}>{title}</Text>
);

const styles = StyleSheet.create({
  header: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
});
