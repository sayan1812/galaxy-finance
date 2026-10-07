/**
 * GALAXY FINANCE — BI-MODAL JADE & EMERALD DESIGN SYSTEM TOKENS
 * Dual Theme System:
 * - Dark Mode: Deep Forest (#1A312C), Mid Emerald (#428475), Luminous Jade (#89D7B7), Soft Warm Cream (#FFF4E1)
 * - Light Mode: Rich Pine Teal (#287A74), Soft Spruce (#55A9A0), Mint Glow (#AEEED3), Butter Cream (#FFF8B0), High-Contrast Text (#143834)
 */

export const colors = {
  // --- Dark Mode Palette ---
  dark: {
    canvasVoid: '#10221E',          // Base app background
    surfaceFill: '#1E3A34',         // Card surface
    primaryAccent: '#89D7B7',       // Luminous Jade / Primary buttons & active tabs
    primaryText: '#FFF4E1',         // Soft Warm Cream / High-contrast headings
    mutedText: 'rgba(255, 244, 225, 0.72)', // Muted text
    cardBorder: 'rgba(137, 215, 183, 0.22)', // Subtle rim stroke
    cardShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
    cardShadowHover: '0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 0 20px -2px rgba(137, 215, 183, 0.25)',
    outflow: '#EF4444',             // Coral Red Outflow
  },

  // --- Light Mode Palette ---
  light: {
    lightBase: '#F4F8F6',           // Cool Sand / Pale Mist base background
    cardSurface: '#FFFFFF',         // Card surface
    primaryText: '#133834',         // Deep Charcoal Pine / WCAG AAA compliant
    highContrastText: '#133834',    // Deep Charcoal Pine
    secondaryText: '#3D6660',       // Muted Pine Slate / Sub-labels & meta
    accentTeal: '#287A74',          // Deep Teal
    accentSpruce: '#55A9A0',        // Spruce
    cardBorder: 'rgba(40, 122, 116, 0.18)', // Subtle rim stroke
    cardShadow: '0 4px 20px -2px rgba(40, 122, 116, 0.08), 0 2px 6px -1px rgba(40, 122, 116, 0.05)',
    cardShadowHover: '0 8px 24px -2px rgba(40, 122, 116, 0.14), 0 0 16px -2px rgba(85, 169, 160, 0.25)',
    outflow: '#EF4444',             // Coral Red Outflow
  },

  // Primitives for direct consumption
  deepForest: '#10221E',
  midEmerald: '#1E3A34',
  luminousJade: '#89D7B7',
  softWarmCream: '#FFF4E1',
  richPineTeal: '#287A74',
  softSpruce: '#55A9A0',
  charcoalPine: '#133834',
  mutedPineSlate: '#3D6660',
  paleMist: '#F4F8F6',

  // Status mappings
  success: '#10B981',
  successLight: '#287A74',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
};

export const themes = {
  dark: {
    name: 'dark' as const,
    bgPage: '#10221E',
    bgSecondary: '#1E3A34',
    cardBg: '#1E3A34',
    cardBorder: 'rgba(137, 215, 183, 0.22)',
    cardBorderHover: '#89D7B7',
    textPrimary: '#FFF4E1',
    textHeadings: '#FFF4E1',
    textSecondary: 'rgba(255, 244, 225, 0.72)',
    textMuted: 'rgba(255, 244, 225, 0.52)',
    accent: '#89D7B7',
    accentSecondary: '#55A9A0',
    headerBg: 'rgba(16, 34, 30, 0.92)',
    sidebarBg: 'rgba(16, 34, 30, 0.96)',
    glow: 'rgba(137, 215, 183, 0.25)',
    cursorFill: 'rgba(137, 215, 183, 0.2)',
  },
  light: {
    name: 'light' as const,
    bgPage: '#F4F8F6',
    bgSecondary: '#FFFFFF',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(40, 122, 116, 0.18)',
    cardBorderHover: '#287A74',
    textPrimary: '#133834',
    textHeadings: '#133834',
    textSecondary: '#3D6660',
    textMuted: '#3D6660',
    accent: '#287A74',
    accentSecondary: '#55A9A0',
    headerBg: 'rgba(244, 248, 246, 0.92)',
    sidebarBg: 'rgba(244, 248, 246, 0.96)',
    glow: 'rgba(40, 122, 116, 0.2)',
    cursorFill: 'rgba(40, 122, 116, 0.2)',
  },
  galaxy: {
    name: 'galaxy' as const,
    bgPage: '#10221E',
    bgSecondary: '#1E3A34',
    cardBg: '#1E3A34',
    cardBorder: 'rgba(137, 215, 183, 0.22)',
    cardBorderHover: '#89D7B7',
    textPrimary: '#FFF4E1',
    textHeadings: '#FFF4E1',
    textSecondary: 'rgba(255, 244, 225, 0.72)',
    textMuted: 'rgba(255, 244, 225, 0.52)',
    accent: '#89D7B7',
    accentSecondary: '#55A9A0',
    headerBg: 'rgba(16, 34, 30, 0.92)',
    sidebarBg: 'rgba(16, 34, 30, 0.96)',
    glow: 'rgba(137, 215, 183, 0.25)',
    cursorFill: 'rgba(137, 215, 183, 0.2)',
  },
};

export const typography = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headingFont: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};
