/**
 * GALAXY FINANCE — CRIMSON NOIR & SLATE EDITION
 * Centralized Color Tokens
 *
 * An executive, sleek, high-security fintech visual system:
 * - Pitch Black base (#0D0D11)
 * - Deep Wine / Maroon subsurface (#4A121A)
 * - Vivid Crimson / Ruby Red accent (#D32F2F / #E53935)
 * - Slate / Cool Steel secondary (#8E929D)
 * - Crisp White primary (#FBFBFB)
 */

export const crimsonNoirPalette = {
  // 1. Primitive Tokens
  pitchBlack: '#0D0D11',
  darkCharcoal: '#13131A',
  elevatedSurface: '#181822',
  deepWine: '#4A121A',
  wineMuted: '#2E0B10',
  wineGlow: 'rgba(74, 18, 26, 0.25)',
  vividCrimson: '#D32F2F',
  rubyRed: '#E53935',
  crimsonDark: '#B71C1C',
  crimsonLight: '#EF5350',
  coolSteelSlate: '#8E929D',
  slateDark: '#4F525D',
  slateMuted: '#2C2E38',
  crispWhite: '#FBFBFB',
  offWhite: '#F3F4F6',

  // 2. Borders & Strokes
  borderSubtleDark: 'rgba(255, 255, 255, 0.08)',
  borderWineTint: 'rgba(74, 18, 26, 0.28)',
  borderWineHover: 'rgba(229, 57, 53, 0.35)',
  borderSlate: 'rgba(142, 146, 157, 0.2)',
  borderCrimsonFocus: 'rgba(211, 47, 47, 0.35)',

  // 3. Ambient & Lighting Layers
  ambientWineGlow: 'rgba(74, 18, 26, 0.15)',
  ambientSlateWash: 'rgba(142, 146, 157, 0.05)',
  crimsonFocusRing: '0 0 0 2px rgba(211, 47, 47, 0.2)',
  cardWineShadow: '0 10px 25px -5px rgba(74, 18, 26, 0.25)',
  crimsonBtnShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
} as const;

export const semanticColors = {
  dark: {
    bgPage: crimsonNoirPalette.pitchBlack,
    bgSurface: crimsonNoirPalette.darkCharcoal,
    bgSubsurface: crimsonNoirPalette.deepWine,
    bgSubsurfaceSubtle: 'rgba(74, 18, 26, 0.35)',
    cardBg: '#13131A',
    cardBorder: 'rgba(74, 18, 26, 0.35)',
    cardBorderHover: crimsonNoirPalette.borderWineHover,
    textPrimary: crimsonNoirPalette.crispWhite,
    textSecondary: crimsonNoirPalette.coolSteelSlate,
    textMuted: '#686B76',
    accentPrimary: crimsonNoirPalette.vividCrimson,
    accentRuby: crimsonNoirPalette.rubyRed,
    accentWine: crimsonNoirPalette.deepWine,
    accentSlate: crimsonNoirPalette.coolSteelSlate,
    headerBg: 'rgba(13, 13, 17, 0.88)',
    sidebarBg: 'rgba(13, 13, 17, 0.94)',
    divider: 'rgba(255, 255, 255, 0.06)',
    inputBg: 'rgba(19, 19, 26, 0.85)',
    inputBorder: crimsonNoirPalette.borderSlate,
    inputBorderFocus: crimsonNoirPalette.vividCrimson,
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.12)',
    expense: crimsonNoirPalette.rubyRed,
    expenseBg: 'rgba(229, 57, 53, 0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.12)',
  },
  light: {
    bgPage: crimsonNoirPalette.crispWhite,
    bgSurface: '#FFFFFF',
    bgSubsurface: '#F5ECEE',
    bgSubsurfaceSubtle: 'rgba(74, 18, 26, 0.06)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(74, 18, 26, 0.14)',
    cardBorderHover: crimsonNoirPalette.vividCrimson,
    textPrimary: '#111116',
    textSecondary: '#525560',
    textMuted: crimsonNoirPalette.coolSteelSlate,
    accentPrimary: crimsonNoirPalette.vividCrimson,
    accentRuby: crimsonNoirPalette.rubyRed,
    accentWine: crimsonNoirPalette.deepWine,
    accentSlate: '#606470',
    headerBg: 'rgba(251, 251, 251, 0.92)',
    sidebarBg: 'rgba(251, 251, 251, 0.96)',
    divider: 'rgba(74, 18, 26, 0.08)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(74, 18, 26, 0.18)',
    inputBorderFocus: crimsonNoirPalette.vividCrimson,
    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.1)',
    expense: crimsonNoirPalette.vividCrimson,
    expenseBg: 'rgba(211, 47, 47, 0.08)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.1)',
  },
  galaxy: {
    // Deep Space Crimson Noir
    bgPage: crimsonNoirPalette.pitchBlack,
    bgSurface: '#121117',
    bgSubsurface: crimsonNoirPalette.deepWine,
    bgSubsurfaceSubtle: 'rgba(74, 18, 26, 0.45)',
    cardBg: 'rgba(19, 17, 24, 0.85)',
    cardBorder: 'rgba(74, 18, 26, 0.4)',
    cardBorderHover: 'rgba(229, 57, 53, 0.45)',
    textPrimary: crimsonNoirPalette.crispWhite,
    textSecondary: crimsonNoirPalette.coolSteelSlate,
    textMuted: '#686B76',
    accentPrimary: crimsonNoirPalette.rubyRed,
    accentRuby: crimsonNoirPalette.rubyRed,
    accentWine: crimsonNoirPalette.deepWine,
    accentSlate: crimsonNoirPalette.coolSteelSlate,
    headerBg: 'rgba(13, 13, 17, 0.85)',
    sidebarBg: 'rgba(13, 13, 17, 0.92)',
    divider: 'rgba(255, 255, 255, 0.07)',
    inputBg: 'rgba(19, 17, 24, 0.8)',
    inputBorder: 'rgba(142, 146, 157, 0.25)',
    inputBorderFocus: crimsonNoirPalette.vividCrimson,
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    expense: crimsonNoirPalette.rubyRed,
    expenseBg: 'rgba(229, 57, 53, 0.16)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.14)',
  }
};
