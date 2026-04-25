import { useThemeStore } from '../../store/themeStore';

export const darkColors = {
  background: '#0B1220',
  surface: '#0F1A2E',
  card: '#111F36',
  text: '#EAF0FF',
  mutedText: 'rgba(234,240,255,0.80)',
  primary: '#6D5BFF',
  danger: '#FF4D6D',
  border: 'rgba(255,255,255,0.10)',
} as const;

export const lightColors = {
  background: '#F6F8FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  mutedText: 'rgba(15,23,42,0.78)',
  primary: '#6D5BFF',
  danger: '#E11D48',
  border: 'rgba(15,23,42,0.12)',
} as const;

export type AppColors = typeof darkColors;

export function getColors() {
  return useThemeStore.getState().mode === 'dark' ? darkColors : lightColors;
}

export const colors: AppColors = {
  get background() {
    return getColors().background;
  },
  get surface() {
    return getColors().surface;
  },
  get card() {
    return getColors().card;
  },
  get text() {
    return getColors().text;
  },
  get mutedText() {
    return getColors().mutedText;
  },
  get primary() {
    return getColors().primary;
  },
  get danger() {
    return getColors().danger;
  },
  get border() {
    return getColors().border;
  },
} as AppColors;
