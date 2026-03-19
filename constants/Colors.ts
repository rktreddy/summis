export const Colors = {
  background: '#0A0A0F',
  card: '#14141F',
  accent: '#7C5CFC',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#1E1E2E',
  inputBg: '#1A1A2E',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  focus: '#7C5CFC',
  sleep: '#6366F1',
  exercise: '#22C55E',
  nutrition: '#F59E0B',
  mindfulness: '#EC4899',
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.accent,
    tabIconDefault: Colors.textSecondary,
    tabIconSelected: Colors.accent,
  },
  dark: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.accent,
    tabIconDefault: Colors.textSecondary,
    tabIconSelected: Colors.accent,
  },
};
