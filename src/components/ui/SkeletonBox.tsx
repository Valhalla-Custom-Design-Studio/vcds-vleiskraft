import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface Props {
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export function SkeletonBox({ width = '100%', height = 20, style, borderRadius = 6 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, backgroundColor: '#D1D5DB', borderRadius, opacity },
        style,
      ]}
    />
  );
}
