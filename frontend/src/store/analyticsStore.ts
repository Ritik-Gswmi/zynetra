import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type AnalyticsEvent = {
  id: string;
  name: string;
  at: number;
  props?: Record<string, unknown>;
};

type AnalyticsState = {
  events: AnalyticsEvent[];
  hydrate: () => Promise<void>;
  track: (name: string, props?: Record<string, unknown>) => Promise<void>;
  clear: () => Promise<void>;
};

const STORAGE_KEY = 'analytics.v1';
const MAX_EVENTS = 200;

function newId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  events: [],

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { events?: AnalyticsEvent[] };
      if (Array.isArray(parsed.events)) set({ events: parsed.events });
    } catch {
      // Ignore.
    }
  },

  track: async (name, props) => {
    const evt: AnalyticsEvent = { id: newId(), name, at: Date.now(), props };
    const next = [evt, ...get().events].slice(0, MAX_EVENTS);
    set({ events: next });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ events: next }));
    } catch {
      // Ignore.
    }
  },

  clear: async () => {
    set({ events: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  },
}));

