import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function FullScreenLoading({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
      {label ? <Text style={{ marginTop: 10, color: colors.mutedText }}>{label}</Text> : null}
    </View>
  );
}

