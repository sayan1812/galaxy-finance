import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * GALAXY FINANCE (MOBILE) — 1080x2340 FHD+ VIEWPORT SPECIFICATIONS
 * 
 * Physical Resolution: 1080 × 2340 px (19.5:9 Aspect Ratio)
 * Logical Density Viewport: ~390 × 844 pt (at @2.75x - @3x pixel density)
 * PPI Density: ~400+ PPI
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline reference logical width and height (standard 390x844 pt logical canvas)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Horizontal scale factor based on screen width
 */
export const horizontalScale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Vertical scale factor based on screen height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scaling for fonts and paddings with a damping factor
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return Math.round(size + (horizontalScale(size) - size) * factor);
};

export const SCREEN_METRICS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
  isFHDPlus: SCREEN_HEIGHT >= 800,
  isSmallDevice: SCREEN_WIDTH < 375,
};

/**
 * Typography Scale specifically calibrated for 1080x2340 FHD+ Mobile screens:
 * - Balance / Hero metric: 28–34pt bold
 * - Card headers: 16–18pt semi-bold
 * - Body text: 14pt regular
 * - Micro-meta / captions: 11–12pt regular
 */
export const TYPOGRAPHY = {
  heroBalance: moderateScale(32, 0.4), // 28–34pt
  heroSub: moderateScale(22, 0.4),
  titleLarge: moderateScale(20, 0.4),
  cardHeader: moderateScale(17, 0.3),  // 16–18pt
  bodyRegular: moderateScale(14, 0.3), // 14pt
  bodySmall: moderateScale(13, 0.2),
  microMeta: moderateScale(11.5, 0.2), // 11–12pt
  caption: moderateScale(10.5, 0.2),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screenPadding: moderateScale(16, 0.3),
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
