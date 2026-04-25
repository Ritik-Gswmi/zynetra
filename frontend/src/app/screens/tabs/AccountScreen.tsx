import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../../ui/components/Screen';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { TextField } from '../../../ui/components/TextField';
import { scheduleLessonReminder } from '../../../lib/notifications';

export function AccountScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'> }) {
  const status = useAuthStore((s) => s.status);
  const authed = status === 'authenticated';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);


  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const reminderRow = useMemo(
    () => ({
      title: 'Learning reminders',
      subtitle: 'Schedule learning reminders',
    }),
    [],
  );

  return (
    <Screen>
      {!authed ? (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Guest mode</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>Login to enroll, track progress, and sync your profile.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <PrimaryButton label="Login" onPress={() => props.navigation.navigate('Login')} style={{ flex: 1 }} />
            <PrimaryButton
              label="Sign up"
              onPress={() => props.navigation.navigate('Signup')}
              style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            />
          </View>
        </Card>
      ) : (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Profile</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>Edit your profile details.</Text>

          <View style={{ marginTop: 12 }}>
            <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" />
            <PrimaryButton
              label="Save profile"
              onPress={async () => {
                try {
                  await updateProfile({ name: name.trim(), email: email.trim() });
                  Alert.alert('Saved', 'Your profile was updated.');
                } catch (e) {
                  Alert.alert('Failed', e instanceof Error ? e.message : 'Failed to update profile');
                }
              }}
              style={{ marginTop: 10 }}
            />
            <PrimaryButton
              label="Logout"
              onPress={async () => logout()}
              style={{ marginTop: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            />
          </View>
        </Card>
      )}

      <Card style={{ marginBottom: 12 }}>
        <Pressable
          onPress={() => props.navigation.navigate('LearningReminders')}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>{reminderRow.title}</Text>
            <Text style={{ color: colors.mutedText, marginTop: 6 }}>{reminderRow.subtitle}</Text>
          </View>
          <Text style={{ color: colors.mutedText, fontWeight: '900', fontSize: 18 }}>{'\u203A'}</Text>
        </Pressable>

        <Pressable
          onPress={() => scheduleLessonReminder({ courseId: 'foundations', lessonId: 'tokens', secondsFromNow: 10 })}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Test reminder (10s)</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
