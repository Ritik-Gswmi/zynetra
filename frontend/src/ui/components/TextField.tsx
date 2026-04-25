import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { useThemeStore } from '../../store/themeStore';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}) {
  useThemeStore((s) => s.mode);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.labelBase, { color: colors.mutedText }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        style={[styles.inputBase, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  labelBase: { marginBottom: 6, fontWeight: '600' },
  inputBase: {
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
});
