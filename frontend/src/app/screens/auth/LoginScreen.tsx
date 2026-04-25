import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { colors } from '../../../ui/theme/colors';
import { Card } from '../../../ui/components/Card';
import { useThemeStore } from '../../../store/themeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  useThemeStore((s) => s.mode);
  const login = useAuthStore((s) => s.login);
  const clearError = useAuthStore((s) => s.clearError);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const disabled = useMemo(() => status === 'loading', [status]);

  useEffect(() => {
    setLocalError(null);
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!localError && !error) return;
    const t = setTimeout(() => {
      setLocalError(null);
      clearError();
    }, 3000);
    return () => clearTimeout(t);
  }, [localError, error, clearError]);

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 }}>Welcome back</Text>
      <Text style={{ color: colors.mutedText, marginBottom: 16 }}>Login to continue your learning journey.</Text>

      <Card>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {localError || error ? (
          <Text style={{ color: colors.danger, marginBottom: 10 }}>{localError ?? error}</Text>
        ) : null}
        <PrimaryButton
          label={status === 'loading' ? 'Logging in...' : 'Login'}
          onPress={() => {
            const nextEmail = email.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
              setLocalError('Enter a valid email address');
              return;
            }
            if (!password.trim()) {
              setLocalError('Password is required');
              return;
            }
            setLocalError(null);
            void login({ email: nextEmail, password });
          }}
          disabled={disabled}
        />
      </Card>

      <PrimaryButton
        label="Continue as guest"
        onPress={() => navigation.navigate('Tabs')}
        style={{ marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      />

      <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
        <Text style={{ color: colors.mutedText }}>New here?</Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
