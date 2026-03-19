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
