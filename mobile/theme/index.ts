import { ThemeMode } from '../types';
export * from './colors';
export * from './motion';

export interface ThemeColors {
  background: string;
  card: string;
  cardSecondary: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  accent: string;
  income: string;
  incomeBg: string;
  expense: string;
  expenseBg: string;
  cash: string;
  cashBg: string;
  warning: string;
  glassSurface: string;
  tabBar: string;
  inputBg: string;
  statusBar: 'light' | 'dark';
}

export const themes: Record<'galaxy' | 'dark' | 'light', ThemeColors> = {
  galaxy: {
    background: '#0D0D11',
    card: '#13131A',
    cardSecondary: '#4A121A',
    border: 'rgba(74, 18, 26, 0.35)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FBFBFB',
    textSecondary: '#8E929D',
    textMuted: '#5A5D6B',
    primary: '#D32F2F',
    primaryGlow: 'rgba(211, 47, 47, 0.35)',
    secondary: '#4A121A',
    accent: '#E53935',
    income: '#10B981',
    incomeBg: 'rgba(16, 185, 129, 0.15)',
    expense: '#E53935',
    expenseBg: 'rgba(229, 57, 53, 0.15)',
    cash: '#F59E0B',
    cashBg: 'rgba(245, 158, 11, 0.15)',
    warning: '#F59E0B',
    glassSurface: 'rgba(19, 19, 26, 0.9)',
    tabBar: 'rgba(13, 13, 17, 0.96)',
    inputBg: 'rgba(13, 13, 17, 0.85)',
    statusBar: 'light'
  },
  dark: {
    background: '#0D0D11',
    card: '#13131A',
    cardSecondary: '#1E1B24',
    border: 'rgba(74, 18, 26, 0.35)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FBFBFB',
    textSecondary: '#8E929D',
    textMuted: '#5A5D6B',
    primary: '#D32F2F',
    primaryGlow: 'rgba(211, 47, 47, 0.3)',
    secondary: '#4A121A',
    accent: '#E53935',
    income: '#10B981',
    incomeBg: 'rgba(16, 185, 129, 0.15)',
    expense: '#E53935',
    expenseBg: 'rgba(229, 57, 53, 0.15)',
    cash: '#F59E0B',
    cashBg: 'rgba(245, 158, 11, 0.15)',
    warning: '#F59E0B',
    glassSurface: '#13131A',
    tabBar: '#0D0D11',
    inputBg: '#0D0D11',
    statusBar: 'light'
  },
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    cardSecondary: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#0EA5E9',
    primaryGlow: 'rgba(14, 165, 233, 0.25)',
    secondary: '#14B8A6',
    accent: '#38BDF8',
    income: '#10B981',
    incomeBg: 'rgba(16, 185, 129, 0.12)',
    expense: '#EF4444',
    expenseBg: 'rgba(239, 68, 68, 0.12)',
    cash: '#F59E0B',
    cashBg: 'rgba(245, 158, 11, 0.12)',
    warning: '#F59E0B',
    glassSurface: '#FFFFFF',
    tabBar: '#FFFFFF',
    inputBg: '#F8FAFC',
    statusBar: 'dark'
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const typography = {
  hero: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '600' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
  micro: { fontSize: 10, fontWeight: '500' as const }
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999
};
