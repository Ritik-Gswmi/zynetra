import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../../ui/components/Screen';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { TextField } from '../../../ui/components/TextField';
import { useReminderStore } from '../../../store/reminderStore';
import { useThemeStore } from '../../../store/themeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderWizard'>;

type Step = 1 | 2;
type FrequencyUI = 'daily' | 'weekly' | 'once';

export function ReminderWizardScreen({ navigation }: Props) {
  useThemeStore((s) => s.mode);
  const enabled = useReminderStore((s) => s.enabled);
  const setEnabled = useReminderStore((s) => s.setEnabled);
  const savedName = useReminderStore((s) => s.name);
  const savedHour = useReminderStore((s) => s.hour);
  const savedMinute = useReminderStore((s) => s.minute);
  const savedFrequency = useReminderStore((s) => s.frequency);
  const saveAll = useReminderStore((s) => s.saveAll);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(savedName || 'Learning reminder');

  const [hour, setHour] = useState(savedHour);
  const [minute, setMinute] = useState(savedMinute);

  const [freq, setFreq] = useState<FrequencyUI>(
    savedFrequency.type === 'days' ? 'weekly' : savedFrequency.type,
  );
  const [days, setDays] = useState<number[]>(savedFrequency.type === 'days' ? savedFrequency.days : []);

  const timeLabel = useMemo(() => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, [hour, minute]);

  const weeklyDaySet = useMemo(() => new Set(days), [days]);

  const header = step === 1 ? 'Step 1 of 2' : 'Step 2 of 2';

  return (
    <Screen>
      <Text style={{ color: colors.mutedText, fontWeight: '800', marginBottom: 10 }}>{header}</Text>

      {step === 1 ? (
        <Card>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Reminder name</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>Give your reminder a name.</Text>
          <View style={{ marginTop: 12 }}>
            <TextField label="Name" value={name} onChangeText={setName} placeholder="Learning reminder" />
          </View>

          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Next"
              onPress={() => {
                if (!name.trim()) {
                  Alert.alert('Name required', 'Please enter a reminder name.');
                  return;
                }
                setStep(2);
              }}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>Frequency</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Pill label="Daily" selected={freq === 'daily'} onPress={() => setFreq('daily')} />
            <Pill label="Weekly" selected={freq === 'weekly'} onPress={() => setFreq('weekly')} />
            <Pill label="Once" selected={freq === 'once'} onPress={() => setFreq('once')} />
          </View>

          <View style={{ marginTop: 16 }}>
            <Row label="Time" value={timeLabel} actionLabel="Edit" onPressAction={() => {
              // simple time adjustments without extra deps
              const next = (hour * 60 + minute + 30) % (24 * 60);
              setHour(Math.floor(next / 60));
              setMinute(next % 60);
            }} />
          </View>

          {freq === 'weekly' ? (
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: colors.mutedText, fontWeight: '800', marginBottom: 8 }}>Day</Text>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, idx) => {
                const selected = weeklyDaySet.has(idx);
                return (
                  <Pressable
                    key={d}
                    onPress={() => {
                      const next = new Set(weeklyDaySet);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      setDays(Array.from(next));
                    }}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{d}</Text>
                    <Text style={{ color: selected ? colors.primary : 'transparent', fontWeight: '900' }}>{'\u2713'}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
            <PrimaryButton
              label="Previous"
              onPress={() => setStep(1)}
              style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            />
            <PrimaryButton
              label="Save"
              onPress={async () => {
                try {
                  const trimmed = name.trim();
                  if (!trimmed) throw new Error('Name is required');

                  if (freq === 'weekly' && days.length === 0) throw new Error('Select at least one day');

                  const frequency =
                    freq === 'weekly' ? ({ type: 'days', days } as const) : ({ type: freq } as const);

                  await saveAll({ name: trimmed, hour, minute, frequency, enabled: true });
                  if (!enabled) await setEnabled(true);
                  navigation.goBack();
                } catch (e) {
                  Alert.alert('Could not save', e instanceof Error ? e.message : 'Failed');
                }
              }}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}

function Pill(props: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: props.selected ? colors.primary : colors.border,
        backgroundColor: props.selected ? 'rgba(124,92,255,0.18)' : colors.surface,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: props.selected ? colors.text : colors.mutedText, fontWeight: '900' }}>{props.label}</Text>
    </Pressable>
  );
}

function Row(props: { label: string; value: string; actionLabel: string; onPressAction: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={{ color: colors.mutedText, fontWeight: '800' }}>{props.label}</Text>
        <Text style={{ color: colors.text, marginTop: 6, fontWeight: '900' }}>{props.value}</Text>
      </View>
      <Pressable onPress={props.onPressAction} hitSlop={10}>
        <Text style={{ color: colors.primary, fontWeight: '900' }}>{props.actionLabel}</Text>
      </Pressable>
    </View>
  );
}
