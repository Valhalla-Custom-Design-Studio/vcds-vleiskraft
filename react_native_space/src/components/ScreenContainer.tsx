import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ViewStyle, StyleProp } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenContainer({ children, title, showBack, style }: Props) {
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, style]}>
      {(title || showBack) && (
        <View style={styles.header}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { marginRight: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
});
