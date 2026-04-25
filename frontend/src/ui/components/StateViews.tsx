import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { useThemeStore } from '../../store/themeStore';

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  useThemeStore((s) => s.mode);

  return (
    <Card style={[styles.cardBase, { backgroundColor: colors.surface }]}>
      <Text style={[styles.titleBase, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.bodyBase, { color: colors.mutedText }]}>{message}</Text>
      {onRetry ? <PrimaryButton label="Retry" onPress={onRetry} style={styles.button} /> : null}
    </Card>
  );
}

export function EmptyView({ title, subtitle }: { title: string; subtitle?: string }) {
  useThemeStore((s) => s.mode);

  return (
    <Card style={[styles.cardBase, { backgroundColor: colors.surface }]}>
      <Text style={[styles.titleBase, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.bodyBase, { color: colors.mutedText }]}>{subtitle}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  cardBase: { padding: 16 },
  titleBase: { fontWeight: '700', fontSize: 16 },
  bodyBase: { marginTop: 8, lineHeight: 20 },
  button: { marginTop: 12 },
});
