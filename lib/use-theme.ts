import { useColorScheme } from 'react-native';

import { FONT_STEPS, useStore } from '@/lib/store';
import { fonts, palettes, type Palette, type ResolvedMode } from '@/constants/theme';

export type Theme = {
  mode: ResolvedMode;
  colors: Palette;
  fonts: typeof fonts;
  fontScale: number;
};

export function useTheme(): Theme {
  const system = useColorScheme();
  const { preferences } = useStore();
  const mode: ResolvedMode =
    preferences.themeMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : preferences.themeMode;

  return {
    mode,
    colors: palettes[mode],
    fonts,
    fontScale: FONT_STEPS[preferences.fontStep] ?? 1,
  };
}
