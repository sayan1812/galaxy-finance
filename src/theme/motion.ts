/**
 * GALAXY FINANCE — CRIMSON NOIR & SLATE EDITION
 * Motion Tokens & Micro-Interactions Specification
 *
 * Polished, high-performance animations honoring prefers-reduced-motion.
 */

export const motionTokens = {
  // Cubic Bezier Timings
  easing: {
    card: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    button: 'cubic-bezier(0.16, 1, 0.3, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Durations
  duration: {
    instant: '100ms',
    fast: '150ms',
    standard: '250ms',
    reveal: '400ms',
    slow: '600ms',
  },

  // Card Micro-interaction
  card: {
    rest: {
      transform: 'translateY(0) scale(1)',
      borderColor: 'rgba(74, 18, 26, 0.35)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    },
    hover: {
      transform: 'translateY(-3px) scale(1.012)',
      borderColor: 'rgba(229, 57, 53, 0.35)',
      boxShadow: '0 10px 25px -5px rgba(74, 18, 26, 0.25)',
    },
    transition: 'transform 250ms cubic-bezier(0.2, 0.0, 0, 1.0), box-shadow 250ms cubic-bezier(0.2, 0.0, 0, 1.0), border-color 250ms cubic-bezier(0.2, 0.0, 0, 1.0)',
  },

  // Primary Button Micro-interaction
  primaryButton: {
    rest: {
      transform: 'translateY(0) scale(1)',
      backgroundColor: '#D32F2F',
      boxShadow: 'none',
      filter: 'brightness(1)',
    },
    hover: {
      transform: 'translateY(-1px) scale(1.015)',
      filter: 'brightness(1.08)',
      boxShadow: '0 4px 14px rgba(211, 47, 47, 0.3)',
    },
    active: {
      transform: 'scale(0.98)',
    },
    transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, filter 200ms ease, background-color 200ms ease',
  },

  // Secondary Button Micro-interaction
  secondaryButton: {
    rest: {
      backgroundColor: 'rgba(74, 18, 26, 0.2)',
      borderColor: 'rgba(142, 146, 157, 0.3)',
      color: '#8E929D',
    },
    hover: {
      borderColor: '#8E929D',
      color: '#FBFBFB',
      backgroundColor: 'rgba(74, 18, 26, 0.35)',
    },
    transition: 'border-color 200ms ease, color 200ms ease, background-color 200ms ease',
  },

  // Transaction Row Micro-interaction
  transactionRow: {
    rest: {
      transform: 'translateX(0)',
      backgroundColor: 'transparent',
    },
    hover: {
      transform: 'translateX(4px)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    iconHover: {
      transform: 'scale(1.06)',
      boxShadow: '0 0 10px rgba(74, 18, 26, 0.5)',
    },
    transition: 'transform 200ms ease, background-color 200ms ease',
  },

  // Input Focus State
  inputFocus: {
    rest: {
      borderColor: 'rgba(142, 146, 157, 0.2)',
      boxShadow: 'none',
    },
    focus: {
      borderColor: '#D32F2F',
      boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.2)',
    },
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  },

  // Progressive Scroll Stagger (50ms increments)
  staggerDelays: [0, 50, 100, 150, 200, 250, 300, 350, 400],
} as const;
