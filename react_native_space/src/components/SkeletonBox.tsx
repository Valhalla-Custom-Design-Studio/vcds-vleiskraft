import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';

interface Props {
  height?: number;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

function SkeletonBoxComponent({ height = 60, width, style, borderRadius }: Props) {
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
    <Animated.View
      style={[
        styles.box,
        { height, width: width as any, borderRadius: borderRadius ?? Radius.md, opacity: anim },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: Colors.elevated },
});

export { SkeletonBoxComponent as SkeletonBox };
export default SkeletonBoxComponent;
