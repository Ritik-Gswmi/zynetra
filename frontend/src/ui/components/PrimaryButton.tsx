import React from 'react';
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { useThemeStore } from '../../store/themeStore';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  useThemeStore((s) => s.mode);

  const requestedBg = (StyleSheet.flatten(style) as ViewStyle | undefined)?.backgroundColor as string | undefined;
  const backgroundColor = requestedBg ?? colors.primary;

  const isPrimaryBg = !requestedBg || requestedBg === colors.primary;
  const labelColor = isPrimaryBg ? 'white' : disabled ? colors.mutedText : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={[styles.labelBase, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },
  labelBase: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
