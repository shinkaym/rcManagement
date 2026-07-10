import { darkTheme } from './dark';
import { lightTheme } from './light';
import { shadow } from './tokens/shadow';
import { spacing } from './tokens/spacing';
import { radius } from './tokens/radius';
import { typography } from './tokens/typography';

export const themes = {
  light: { ...lightTheme, spacing, radius, shadow, typography },
  dark: { ...darkTheme, spacing, radius, shadow, typography },
} as const;

export type AppTheme = (typeof themes)['light'];
