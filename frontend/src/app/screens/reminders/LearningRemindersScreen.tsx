import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../../ui/components/Screen';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useReminderStore } from '../../../store/reminderStore';
import { useThemeStore } from '../../../store/themeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'LearningReminders'>;

export function LearningRemindersScreen({ navigation }: Props) {
  useThemeStore((s) => s.mode);
  const enabled = useReminderStore((s) => s.enabled);
  const name = useReminderStore((s) => s.name);
  const hour = useReminderStore((s) => s.hour);
  const minute = useReminderStore((s) => s.minute);
  const frequency = useReminderStore((s) => s.frequency);

  const timeLabel = useMemo(() => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, [hour, minute]);
  const freqLabel = useMemo(() => {
    if (frequency.type === 'daily') return 'Daily';
    if (frequency.type === 'once') return 'Once';
    const days = new Set(frequency.days);
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].filter((_, idx) => days.has(idx));
    return names.length ? `Weekly (${names.join(', ')})` : 'Weekly';
  }, [frequency]);

  return (
    <Screen>
      <Card style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Your reminder</Text>
        <Text style={{ color: colors.mutedText, marginTop: 6 }}>
          {enabled ? 'Enabled' : 'Disabled'} • {freqLabel} • {timeLabel}
        </Text>

        <View style={{ marginTop: 12 }}>
          <Pressable
            onPress={() => navigation.navigate('ReminderWizard')}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '900' }}>{name || 'Learning reminder'}</Text>
              <Text style={{ color: colors.mutedText, marginTop: 4 }} numberOfLines={1}>
                {freqLabel} at {timeLabel}
              </Text>
            </View>
            <Text style={{ color: colors.mutedText, fontWeight: '900', fontSize: 18 }}>{'\u203A'}</Text>
          </Pressable>
        </View>
      </Card>

      <PrimaryButton label="Add / Edit reminder" onPress={() => navigation.navigate('ReminderWizard')} />
    </Screen>
  );
}
