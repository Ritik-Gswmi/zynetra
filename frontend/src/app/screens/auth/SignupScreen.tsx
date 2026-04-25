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

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  useThemeStore((s) => s.mode);
  const signup = useAuthStore((s) => s.signup);
  const clearError = useAuthStore((s) => s.clearError);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const [name, setName] = useState('');
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
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 8 }}>Create account</Text>
      <Text style={{ color: colors.mutedText, marginBottom: 16 }}>
        Sign up to begin your learning journey.
      </Text>

      <Card>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
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
          label={status === 'loading' ? 'Creating…' : 'Sign up'}
          onPress={() => {
            const nextName = name.trim();
            const nextEmail = email.trim();

            if (!nextName) {
              setLocalError('Name is required');
              return;
            }
            if (nextName.length < 3) {
              setLocalError('Name must be at least 3 characters');
              return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
              setLocalError('Enter a valid email address');
              return;
            }
            if (password.trim().length < 6) {
              setLocalError('Password must be at least 6 characters');
              return;
            }

            setLocalError(null);
            void signup({ name: nextName, email: nextEmail, password });
          }}
          disabled={disabled}
        />
      </Card>

      <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
        <Text style={{ color: colors.mutedText }}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
