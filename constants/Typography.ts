import { TextStyle } from 'react-native';
import { Colors } from './Colors';

/**
 * Consistent typography scale.
 * Use these presets for text styles instead of ad-hoc font sizes.
 */
export const Typography = {
  /** Screen titles — 28px, extra bold */
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  } as TextStyle,

  /** Section headings — 22px, bold */
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  } as TextStyle,

  /** Card titles, section labels — 18px, semi-bold */
  subheading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  } as TextStyle,

  /** Primary body text — 16px */
  body: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  } as TextStyle,

  /** Secondary body text — 15px */
  bodySmall: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  } as TextStyle,

  /** Captions, labels — 14px */
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
  } as TextStyle,

  /** Small text, badges — 12px */
  small: {
    fontSize: 12,
    color: Colors.textSecondary,
  } as TextStyle,

  /** Large display numbers (scores, timers) — 48px */
  display: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text,
  } as TextStyle,

  /** Medium numbers (stats) — 24px */
  stat: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  } as TextStyle,
} as const;
