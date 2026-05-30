export const colors = {
  bg: '#f4f7f6',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  border: '#e2e8f0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  md: 12,
  lg: 16,
  pill: 999,
};

export function scoreColor(score: number): string {
  if (score >= 75) return colors.success;
  if (score >= 50) return colors.accent;
  return colors.danger;
}
