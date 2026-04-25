import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemeStore } from '../../store/themeStore';
import { colors } from '../theme/colors';

export function ThemeToggle({ style }: { style?: ViewStyle }) {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null, style]}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
    >
      <View style={[styles.innerBase, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.iconBase, { color: colors.text }]}>{mode === 'dark' ? '\u263E' : '\u263C'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 6 },
  pressed: { opacity: 0.9 },
  innerBase: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBase: { fontSize: 18, fontWeight: '700' },
});
