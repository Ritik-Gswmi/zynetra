import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { useThemeStore } from '../../store/themeStore';

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  useThemeStore((s) => s.mode);

  if (!scroll) {
    return <View style={[styles.fixedBase, { backgroundColor: colors.background }]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.scrollBase, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fixedBase: { flex: 1, padding: 16 },
  scrollBase: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
});
