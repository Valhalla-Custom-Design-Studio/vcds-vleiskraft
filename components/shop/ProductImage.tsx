import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/colors';

interface Props { uri?: string; size?: number; }

export function ProductImage({ uri, size = 80 }: Props) {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Ionicons name="restaurant-outline" size={size * 0.4} color={Colors.secondary} />
        <View style={styles.goldBar} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { width: size, height: size }]}
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  goldBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.secondary },
  image: { borderRadius: Radius.md },
});
