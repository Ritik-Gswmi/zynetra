import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  setMode: (mode) => set({ mode }),
  toggle: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
}));

