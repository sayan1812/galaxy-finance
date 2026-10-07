/**
 * GALAXY FINANCE — BI-MODAL JADE/EMERALD REDESIGN & PALETTE
 *
 * Dark Mode:
 * - Deep Forest / Canvas Void:     #1A312C
 * - Mid Emerald / Surface Fill:     #428475
 * - Luminous Jade / Primary Accent: #89D7B7
 * - Soft Warm Cream / Typography:   #FFF4E1
 * - Muted Text / Secondary:        rgba(255, 244, 225, 0.72)
 * - Subtle Card Border / Rim:       rgba(137, 215, 183, 0.22)
 * - Elevated Dropshadow:            0 8px 30px -4px rgba(0, 0, 0, 0.5)
 *
 * Light Mode:
 * - Rich Pine Teal / Primary Text:  #287A74
 * - Soft Spruce / Secondary Text:   #55A9A0
 * - Mint Glow / Surface & Hover:    #AEEED3
 * - Butter Cream / Light Base:      #FFF8B0
 * - High-Contrast Text:             #143834
 * - Card Surface:                   #FFFFFF (with subtle tint of #FFF8B0)
 * - Subtle Card Border:             rgba(40, 122, 116, 0.18)
 */

export const jadeEmeraldPalette = {
  // 1. Primitive Dark Tokens
  deepForest: '#10221E',             // Base app background / Dark Void
  midEmerald: '#1E3A34',             // Container & surface fill
  luminousJade: '#89D7B7',           // Primary active accent
  softWarmCream: '#FFF4E1',          // Primary light typography
  creamMuted: 'rgba(255, 244, 225, 0.72)',
  rimDark: 'rgba(137, 215, 183, 0.22)',
  shadowDark: '0 8px 30px -4px rgba(0, 0, 0, 0.5)',

  // 2. Primitive Light Tokens
  richPineTeal: '#287A74',           // Accents (Deep Teal)
  softSpruce: '#55A9A0',             // Spruce
  mintGlow: '#89D7B7',               // Luminous Jade
  butterCream: '#F4F8F6',            // Base Background (Cool Sand / Pale Mist)
  charcoalEmerald: '#133834',        // Primary Headings & Balance Figures (WCAG AAA)
  mutedPineSlate: '#3D6660',         // Secondary Labels & Meta
  cardSurfaceLight: '#FFFFFF',       // Card Surface
  rimLight: 'rgba(40, 122, 116, 0.18)',

  // Outflow & Inflow Indicators
  coralOutflowDark: '#EF4444',
  coralOutflowLight: '#EF4444',

  // Backward-compatibility aliases
  canvas: '#10221E',
  cardSurface: '#1E3A34',
  borderSand: 'rgba(137, 215, 183, 0.22)',
  terracottaAccent: '#89D7B7',
  buttercream: '#F4F8F6',
  apricotNude: '#55A9A0',
  blushPeach: '#89D7B7',
  softCoral: '#EF4444',
  deepEspresso: '#133834',
  driftwoodSlate: '#3D6660',
  pitchBlack: '#10221E',
  darkCharcoal: '#1E3A34',
  elevatedSurface: '#1E3A34',
  deepWine: '#1E3A34',
  wineMuted: '#89D7B7',
  wineGlow: 'rgba(137, 215, 183, 0.25)',
  vividCrimson: '#FF8A8A',
  rubyRed: '#FF8A8A',
  crimsonDark: '#D9534F',
  crimsonLight: '#FF8A8A',
  coolSteelSlate: '#55A9A0',
  slateDark: 'rgba(137, 215, 183, 0.22)',
  slateMuted: 'rgba(255, 244, 225, 0.72)',
  crispWhite: '#FFF4E1',
  offWhite: '#FFF4E1',
} as const;

export const warmPastelPalette = jadeEmeraldPalette;
export const crimsonNoirPalette = jadeEmeraldPalette;

export const semanticColors = {
  dark: {
    bgPage: jadeEmeraldPalette.deepForest,
    bgSurface: jadeEmeraldPalette.midEmerald,
    bgSubsurface: 'rgba(66, 132, 117, 0.45)',
    bgSubsurfaceSubtle: 'rgba(137, 215, 183, 0.12)',
    cardBg: 'rgba(66, 132, 117, 0.28)',
    cardBorder: jadeEmeraldPalette.rimDark,
    cardBorderHover: jadeEmeraldPalette.luminousJade,
    cardShadow: jadeEmeraldPalette.shadowDark,
    textPrimary: jadeEmeraldPalette.softWarmCream,
    textSecondary: jadeEmeraldPalette.creamMuted,
    textMuted: 'rgba(255, 244, 225, 0.52)',
    accentPrimary: jadeEmeraldPalette.luminousJade,
    accentRuby: jadeEmeraldPalette.coralOutflowDark,
    accentWine: jadeEmeraldPalette.midEmerald,
    accentSlate: jadeEmeraldPalette.creamMuted,
    headerBg: 'rgba(26, 49, 44, 0.92)',
    sidebarBg: 'rgba(26, 49, 44, 0.96)',
    divider: 'rgba(137, 215, 183, 0.18)',
    inputBg: 'rgba(26, 49, 44, 0.85)',
    inputBorder: 'rgba(137, 215, 183, 0.28)',
    inputBorderFocus: jadeEmeraldPalette.luminousJade,
    btnPrimaryBg: jadeEmeraldPalette.luminousJade,
    btnPrimaryText: jadeEmeraldPalette.deepForest,
    btnPrimaryHoverBg: '#9ce2c5',
    btnSecondaryBg: 'rgba(66, 132, 117, 0.35)',
    btnSecondaryBorder: 'rgba(137, 215, 183, 0.25)',
    btnSecondaryText: jadeEmeraldPalette.softWarmCream,
    success: jadeEmeraldPalette.luminousJade,
    successBg: 'rgba(137, 215, 183, 0.15)',
    expense: jadeEmeraldPalette.coralOutflowDark,
    expenseBg: 'rgba(255, 138, 138, 0.18)',
    warning: jadeEmeraldPalette.butterCream,
    warningBg: 'rgba(255, 248, 176, 0.35)',
    chartCursorFill: 'rgba(66, 132, 117, 0.2)',
  },
  light: {
    bgPage: jadeEmeraldPalette.butterCream,
    bgSurface: jadeEmeraldPalette.cardSurfaceLight,
    bgSubsurface: 'rgba(174, 238, 211, 0.4)',
    bgSubsurfaceSubtle: 'rgba(174, 238, 211, 0.2)',
    cardBg: 'rgba(255, 255, 255, 0.94)',
    cardBorder: jadeEmeraldPalette.rimLight,
    cardBorderHover: jadeEmeraldPalette.richPineTeal,
    cardShadow: '0 8px 24px -4px rgba(40, 122, 116, 0.08), 0 2px 6px -1px rgba(174, 238, 211, 0.15)',
    textPrimary: jadeEmeraldPalette.charcoalEmerald,
    textHeadings: jadeEmeraldPalette.richPineTeal,
    textSecondary: jadeEmeraldPalette.softSpruce,
    textMuted: jadeEmeraldPalette.softSpruce,
    accentPrimary: jadeEmeraldPalette.richPineTeal,
    accentRuby: jadeEmeraldPalette.coralOutflowLight,
    accentWine: jadeEmeraldPalette.richPineTeal,
    accentSlate: jadeEmeraldPalette.softSpruce,
    headerBg: 'rgba(255, 248, 176, 0.92)',
    sidebarBg: 'rgba(255, 248, 176, 0.96)',
    divider: 'rgba(40, 122, 116, 0.18)',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(40, 122, 116, 0.28)',
    inputBorderFocus: jadeEmeraldPalette.richPineTeal,
    btnPrimaryBg: jadeEmeraldPalette.richPineTeal,
    btnPrimaryText: jadeEmeraldPalette.butterCream,
    btnPrimaryHoverBg: jadeEmeraldPalette.softSpruce,
    btnSecondaryBg: '#FFFFFF',
    btnSecondaryBorder: 'rgba(40, 122, 116, 0.25)',
    btnSecondaryText: jadeEmeraldPalette.richPineTeal,
    success: '#059669',
    successBg: 'rgba(5, 150, 105, 0.12)',
    expense: jadeEmeraldPalette.coralOutflowLight,
    expenseBg: 'rgba(217, 83, 79, 0.15)',
    warning: '#D97706',
    warningBg: 'rgba(217, 119, 6, 0.15)',
    chartCursorFill: 'rgba(174, 238, 211, 0.35)',
  },
  galaxy: {
    bgPage: jadeEmeraldPalette.deepForest,
    bgSurface: jadeEmeraldPalette.midEmerald,
    bgSubsurface: 'rgba(66, 132, 117, 0.5)',
    bgSubsurfaceSubtle: 'rgba(137, 215, 183, 0.18)',
    cardBg: 'rgba(66, 132, 117, 0.32)',
    cardBorder: jadeEmeraldPalette.rimDark,
    cardBorderHover: jadeEmeraldPalette.luminousJade,
    cardShadow: jadeEmeraldPalette.shadowDark,
    textPrimary: jadeEmeraldPalette.softWarmCream,
    textSecondary: jadeEmeraldPalette.creamMuted,
    textMuted: 'rgba(255, 244, 225, 0.55)',
    accentPrimary: jadeEmeraldPalette.luminousJade,
    accentRuby: jadeEmeraldPalette.coralOutflowDark,
    accentWine: jadeEmeraldPalette.midEmerald,
    accentSlate: jadeEmeraldPalette.creamMuted,
    headerBg: 'rgba(26, 49, 44, 0.94)',
    sidebarBg: 'rgba(26, 49, 44, 0.98)',
    divider: 'rgba(137, 215, 183, 0.22)',
    inputBg: 'rgba(26, 49, 44, 0.9)',
    inputBorder: 'rgba(137, 215, 183, 0.35)',
    inputBorderFocus: jadeEmeraldPalette.luminousJade,
    btnPrimaryBg: jadeEmeraldPalette.luminousJade,
    btnPrimaryText: jadeEmeraldPalette.deepForest,
    btnPrimaryHoverBg: '#9ce2c5',
    btnSecondaryBg: 'rgba(66, 132, 117, 0.4)',
    btnSecondaryBorder: 'rgba(137, 215, 183, 0.3)',
    btnSecondaryText: jadeEmeraldPalette.softWarmCream,
    success: jadeEmeraldPalette.luminousJade,
    successBg: 'rgba(137, 215, 183, 0.18)',
    expense: jadeEmeraldPalette.coralOutflowDark,
    expenseBg: 'rgba(255, 138, 138, 0.22)',
    warning: jadeEmeraldPalette.butterCream,
    warningBg: 'rgba(255, 248, 176, 0.4)',
    chartCursorFill: 'rgba(66, 132, 117, 0.25)',
  }
};
