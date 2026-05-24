import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/colors';

interface Props { width?: number | string; height?: number; style?: ViewStyle; }

export function SkeletonBox({ width = '100%', height = 20, style }: Props) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.box, { width: width as number, height, opacity: anim }, style]} />
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.elevated, borderRadius: Radius.sm },
});
