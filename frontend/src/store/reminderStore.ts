import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { cancelLearningReminder, scheduleDailyLearningReminder } from '../lib/notifications';

type ReminderFrequency = { type: 'daily' } | { type: 'once' } | { type: 'days'; days: number[] }; // days: 0 (Sun) .. 6 (Sat)

type ReminderState = {
  enabled: boolean;
  name: string;
  hour: number;
  minute: number;
  frequency: ReminderFrequency;
  hydrate: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (params: { hour: number; minute: number }) => Promise<void>;
  setFrequency: (frequency: ReminderFrequency) => Promise<void>;
  setName: (name: string) => Promise<void>;
  saveAll: (params: {
    enabled: boolean;
    name: string;
    hour: number;
    minute: number;
    frequency: ReminderFrequency;
  }) => Promise<void>;
};

const STORAGE_KEY = 'learningReminder.v1';

export const useReminderStore = create<ReminderState>((set, get) => ({
  enabled: false,
  name: 'Learning reminder',
  hour: 20,
  minute: 0,
  frequency: { type: 'daily' },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as any;
      const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : get().name;
      const hour = typeof parsed.hour === 'number' ? Math.max(0, Math.min(23, parsed.hour)) : get().hour;
      const minute = typeof parsed.minute === 'number' ? Math.max(0, Math.min(59, parsed.minute)) : get().minute;
      const enabled = Boolean(parsed.enabled);
      const frequency = normalizeFrequency(parsed.frequency) ?? get().frequency;
      set({ enabled, name, hour, minute, frequency });
    } catch {
      // Ignore.
    }
  },

  setEnabled: async (enabled) => {
    set({ enabled });
    const { hour, minute, frequency } = get();
    try {
      if (enabled) await scheduleDailyLearningReminder({ hour, minute, frequency });
      else await cancelLearningReminder();
    } finally {
      try {
        const { name } = get();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, name, hour, minute, frequency }));
      } catch {
        // Ignore.
      }
    }
  },

  setTime: async ({ hour, minute }) => {
    const safeHour = Math.max(0, Math.min(23, hour));
    const safeMinute = Math.max(0, Math.min(59, minute));
    set({ hour: safeHour, minute: safeMinute });
    const { enabled, frequency } = get();
    try {
      if (enabled) await scheduleDailyLearningReminder({ hour: safeHour, minute: safeMinute, frequency });
    } finally {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ enabled, name: get().name, hour: safeHour, minute: safeMinute, frequency }),
        );
      } catch {
        // Ignore.
      }
    }
  },

  setFrequency: async (frequency) => {
    const safe = normalizeFrequency(frequency) ?? get().frequency;
    set({ frequency: safe });
    const { enabled, hour, minute } = get();
    try {
      if (enabled) await scheduleDailyLearningReminder({ hour, minute, frequency: safe });
    } finally {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ enabled, name: get().name, hour, minute, frequency: safe }),
        );
      } catch {
        // Ignore.
      }
    }
  },

  setName: async (name) => {
    const trimmed = String(name ?? '').trim() || 'Learning reminder';
    set({ name: trimmed });
    try {
      const { enabled, hour, minute, frequency } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, name: trimmed, hour, minute, frequency }));
    } catch {
      // Ignore.
    }
  },

  saveAll: async ({ enabled, name, hour, minute, frequency }) => {
    const safeName = String(name ?? '').trim() || 'Learning reminder';
    const safeHour = Math.max(0, Math.min(23, hour));
    const safeMinute = Math.max(0, Math.min(59, minute));
    const safeFreq = normalizeFrequency(frequency) ?? get().frequency;
    set({ enabled: Boolean(enabled), name: safeName, hour: safeHour, minute: safeMinute, frequency: safeFreq });

    try {
      if (enabled) await scheduleDailyLearningReminder({ hour: safeHour, minute: safeMinute, frequency: safeFreq });
      else await cancelLearningReminder();
    } finally {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ enabled: Boolean(enabled), name: safeName, hour: safeHour, minute: safeMinute, frequency: safeFreq }),
        );
      } catch {
        // Ignore.
      }
    }
  },
}));

function normalizeFrequency(freq: unknown): ReminderFrequency | null {
  if (!freq || typeof freq !== 'object') return null;
  const type = (freq as any).type;
  if (type === 'daily') return { type: 'daily' };
  if (type === 'once') return { type: 'once' };
  if (type === 'days') {
    const daysRaw = (freq as any).days;
    if (!Array.isArray(daysRaw)) return { type: 'days', days: [] };
    const days = Array.from(new Set(daysRaw.filter((d: any) => typeof d === 'number' && d >= 0 && d <= 6).map((d: any) => Math.floor(d))));
    return { type: 'days', days };
  }
  return null;
}
