import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedMode = 'light' | 'dark';

export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  gold: string;
  goldSoft: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
};

/** Islamic classic palette: deep emerald, aged gold, parchment. */
export const palettes: Record<ResolvedMode, Palette> = {
  light: {
    background: '#F6EFDF',
    surface: '#FFFDF6',
    surfaceAlt: '#EFE5CF',
    primary: '#0E4636',
    primaryDark: '#072A21',
    onPrimary: '#FBF3E0',
    gold: '#A8813C',
    goldSoft: '#E7D5AF',
    text: '#26302B',
    muted: '#7B7061',
    border: '#E1D4B9',
    danger: '#9C3B2F',
    success: '#2E6B4F',
  },
  dark: {
    background: '#0D1512',
    surface: '#15201C',
    surfaceAlt: '#1C2A24',
    primary: '#123B2F',
    primaryDark: '#0A231C',
    onPrimary: '#F2E9D6',
    gold: '#D3AE65',
    goldSoft: '#4A3E28',
    text: '#EFE8D9',
    muted: '#9C9284',
    border: '#26332C',
    danger: '#D4796A',
    success: '#79C7A2',
  },
};

export const fonts = {
  display: 'ArefRuqaa_400Regular',
  body: 'Amiri_400Regular',
  bodyBold: 'Amiri_700Bold',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

/** Reading sizes used by the adhkar viewer (multiplied by the user preference). */
export const readingSize = {
  base: Platform.select({ web: 20, default: 21 }) as number,
  lineHeightRatio: 1.95,
};
