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
    background: '#FAF7F3',
    card: '#F0E4D3',
    cardSecondary: '#FFDBB0',
    border: '#DCC5B2',
    borderSubtle: '#DCC5B2',
    textPrimary: '#2D2621',
    textSecondary: '#7A6F66',
    textMuted: '#7A6F66',
    primary: '#D9A299',
    primaryGlow: 'rgba(217, 162, 153, 0.35)',
    secondary: '#FFDBB0',
    accent: '#D9A299',
    income: '#D9A299',
    incomeBg: 'rgba(217, 162, 153, 0.15)',
    expense: '#FFB1B1',
    expenseBg: 'rgba(255, 177, 177, 0.25)',
    cash: '#FFDBB0',
    cashBg: 'rgba(255, 219, 176, 0.25)',
    warning: '#FFFAD3',
    glassSurface: 'rgba(240, 228, 211, 0.92)',
    tabBar: '#FAF7F3',
    inputBg: '#FAF7F3',
    statusBar: 'dark'
  },
  dark: {
    background: '#FAF7F3',
    card: '#F0E4D3',
    cardSecondary: '#FFDBB0',
    border: '#DCC5B2',
    borderSubtle: '#DCC5B2',
    textPrimary: '#2D2621',
    textSecondary: '#7A6F66',
    textMuted: '#7A6F66',
    primary: '#D9A299',
    primaryGlow: 'rgba(217, 162, 153, 0.3)',
    secondary: '#FFDBB0',
    accent: '#D9A299',
    income: '#D9A299',
    incomeBg: 'rgba(217, 162, 153, 0.15)',
    expense: '#FFB1B1',
    expenseBg: 'rgba(255, 177, 177, 0.25)',
    cash: '#FFDBB0',
    cashBg: 'rgba(255, 219, 176, 0.25)',
    warning: '#FFFAD3',
    glassSurface: '#F0E4D3',
    tabBar: '#FAF7F3',
    inputBg: '#FAF7F3',
    statusBar: 'dark'
  },
  light: {
    background: '#FAF7F3',
    card: '#F0E4D3',
    cardSecondary: '#FFDBB0',
    border: '#DCC5B2',
    borderSubtle: '#DCC5B2',
    textPrimary: '#2D2621',
    textSecondary: '#7A6F66',
    textMuted: '#7A6F66',
    primary: '#D9A299',
    primaryGlow: 'rgba(217, 162, 153, 0.25)',
    secondary: '#FFDBB0',
    accent: '#D9A299',
    income: '#D9A299',
    incomeBg: 'rgba(217, 162, 153, 0.12)',
    expense: '#FFB1B1',
    expenseBg: 'rgba(255, 177, 177, 0.2)',
    cash: '#FFDBB0',
    cashBg: 'rgba(255, 219, 176, 0.2)',
    warning: '#FFFAD3',
    glassSurface: '#F0E4D3',
    tabBar: '#FAF7F3',
    inputBg: '#FAF7F3',
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
