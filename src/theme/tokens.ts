/**
 * Galaxy Finance Design System Tokens
 * Theme: Subdued Modern Fintech (Sky Blue, Teal, Soft Navy, Cool Gray, Subtle Cyan)
 * Stability + Trust + Security + Modern Technology + Financial Clarity
 */

export const colors = {
  // Primary Palette
  primary: '#0EA5E9',       // Sky Blue (Primary Action)
  primaryHover: '#0284C7',  // Deeper Sky Blue
  primaryLight: '#E0F2FE',  // Light Blue Tint
  
  // Secondary / Accent Palette
  teal: '#14B8A6',          // Clean Teal
  tealDark: '#0D9488',      // Deep Teal
  tealLight: '#CCFBF1',     // Soft Teal Tint
  cyan: '#38BDF8',          // Vibrant Sky Accent
  softCyan: '#67E8F9',      // Subtle Cyan Glow
  
  // Neutrals & Surfaces
  white: '#FFFFFF',
  lightGray: '#F8FAFC',     // Light Mode Background
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',      // Subtle Surface / Hover
  slate200: '#E2E8F0',      // Default Border
  slate300: '#CBD5E1',      // Muted Border
  slate400: '#94A3B8',      // Muted Text
  slate500: '#64748B',      // Secondary Text
  slate600: '#475569',      // Body Text
  slate700: '#334155',      // Strong Body Text
  slate800: '#1E293B',      // Dark Neutral Surface
  navy: '#111827',          // Dark Mode Card
  deepBlue: '#0F172A',      // Dark Mode Secondary Surface
  darkBackground: '#020617', // Dark Mode Root Background
  
  // Status Colors (Subdued Financial)
  success: '#10B981',       // Emerald Income
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',       // Amber Warning
  warningBg: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',         // Soft Red Expense
  errorBg: 'rgba(239, 68, 68, 0.12)',
  info: '#0EA5E9',
  infoBg: 'rgba(14, 165, 233, 0.12)',
};

export const themes = {
  light: {
    name: 'light' as const,
    bgPage: '#FBFBFB',
    bgSecondary: '#F3F4F6',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(74, 18, 26, 0.14)',
    cardBorderHover: '#D32F2F',
    textPrimary: '#111116',
    textSecondary: '#525560',
    textMuted: '#8E929D',
    accent: '#D32F2F',
    accentSecondary: '#4A121A',
    headerBg: 'rgba(251, 251, 251, 0.92)',
    sidebarBg: 'rgba(251, 251, 251, 0.96)',
    glow: 'rgba(74, 18, 26, 0.08)',
  },
  dark: {
    name: 'dark' as const,
    bgPage: '#0D0D11',
    bgSecondary: '#13131A',
    cardBg: '#13131A',
    cardBorder: 'rgba(74, 18, 26, 0.35)',
    cardBorderHover: 'rgba(229, 57, 53, 0.35)',
    textPrimary: '#FBFBFB',
    textSecondary: '#8E929D',
    textMuted: '#5A5D6B',
    accent: '#D32F2F',
    accentSecondary: '#4A121A',
    headerBg: 'rgba(13, 13, 17, 0.88)',
    sidebarBg: 'rgba(13, 13, 17, 0.94)',
    glow: 'rgba(74, 18, 26, 0.25)',
  },
  galaxy: {
    name: 'galaxy' as const,
    bgPage: '#0D0D11',
    bgSecondary: '#16131A',
    cardBg: 'rgba(19, 17, 24, 0.88)',
    cardBorder: 'rgba(74, 18, 26, 0.45)',
    cardBorderHover: 'rgba(229, 57, 53, 0.45)',
    textPrimary: '#FBFBFB',
    textSecondary: '#8E929D',
    textMuted: '#5A5D6B',
    accent: '#E53935',
    accentSecondary: '#4A121A',
    headerBg: 'rgba(13, 13, 17, 0.88)',
    sidebarBg: 'rgba(13, 13, 17, 0.94)',
    glow: 'rgba(74, 18, 26, 0.3)',
  }
};

export const typography = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headingFont: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoFont: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const shadows = {
  subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  card: '0 4px 12px 0 rgba(0, 0, 0, 0.25)',
  cardHover: '0 10px 25px -5px rgba(74, 18, 26, 0.25)',
  glow: '0 0 20px -3px rgba(74, 18, 26, 0.35)',
  crimsonBtn: '0 4px 14px rgba(211, 47, 47, 0.3)',
};

export const radius = {
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.25rem',  // 20px
  '2xl': '1.5rem',// 24px
  full: '9999px',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
  spring: '450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};
