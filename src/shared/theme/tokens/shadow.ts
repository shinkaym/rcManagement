export const shadow = {
  subtle: '0 2px 6px rgba(0, 0, 0, 0.10)',
  button: '0 4px 8px rgba(0, 0, 0, 0.15)',
  card: '0 4px 12px rgba(0, 0, 0, 0.10)',
  medium: '0 6px 16px rgba(0, 0, 0, 0.15)',
  fab: '0 6px 16px rgba(0, 0, 0, 0.18)',
  lifted: '0 8px 18px rgba(0, 0, 0, 0.15)',
  strong: '0 8px 20px rgba(0, 0, 0, 0.16)',
  surface: '0 8px 24px rgba(0, 0, 0, 0.15)',
  elevated: '0 10px 20px rgba(0, 0, 0, 0.15)',
  popover: '0 10px 24px rgba(17, 24, 39, 0.06)',
  floating: '0 12px 24px rgba(0, 0, 0, 0.24)',
  dialog: '0 16px 40px rgba(17, 24, 39, 0.16)',
  hero: '0 18px 36px rgba(0, 0, 0, 0.16)',
  panel: '0 18px 40px rgba(0, 0, 0, 0.22)',
  bottomBar: '0 -2px 16px rgba(0, 0, 0, 0.08)',
  sheet: '0 -12px 24px rgba(0, 0, 0, 0.14)',
  accentMuted: '0 8px 18px rgba(245, 124, 0, 0.24)',
  accent: '0 8px 18px rgba(245, 124, 0, 0.28)',
  accentSoft: '0 10px 20px rgba(245, 124, 0, 0.22)',
  accentStrong: '0 10px 24px rgba(245, 124, 0, 0.26)',
  accentButton: '0 6px 16px rgba(245, 124, 0, 0.28)',
  focusRing: '0 0 0 2px rgba(245, 124, 0, 0.12)',
} as const;

export function createFocusRingShadow(color: string) {
  return `0 0 0 2px ${color}`;
}
