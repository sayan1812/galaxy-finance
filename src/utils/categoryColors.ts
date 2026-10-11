// src/utils/categoryColors.ts
export interface CategoryColor {
  fill: string;       // Pie slice fill / badge background
  text: string;       // Badge text color
  border: string;     // Border / accent
}

export const CATEGORY_PALETTE: Record<string, { dark: CategoryColor; light: CategoryColor }> = {
  Apparel: {
    dark:  { fill: '#F87171', text: '#FFFFFF', border: '#EF4444' }, // Coral Red
    light: { fill: '#EF4444', text: '#FFFFFF', border: '#DC2626' }
  },
  Household: {
    dark:  { fill: '#FB923C', text: '#FFFFFF', border: '#F97316' }, // Warm Orange
    light: { fill: '#F97316', text: '#FFFFFF', border: '#EA580C' }
  },
  Education: {
    dark:  { fill: '#FBBF24', text: '#1F2937', border: '#F59E0B' }, // Amber Yellow
    light: { fill: '#F59E0B', text: '#FFFFFF', border: '#D97706' }
  },
  Transportation: {
    dark:  { fill: '#FACC15', text: '#1F2937', border: '#EAB308' }, // Lemon Yellow
    light: { fill: '#EAB308', text: '#FFFFFF', border: '#CA8A04' }
  },
  Gift: {
    dark:  { fill: '#A3E635', text: '#1F2937', border: '#84CC16' }, // Lime Green
    light: { fill: '#84CC16', text: '#FFFFFF', border: '#65A30D' }
  },
  Health: {
    dark:  { fill: '#4ADE80', text: '#1F2937', border: '#22C55E' }, // Soft Emerald
    light: { fill: '#22C55E', text: '#FFFFFF', border: '#16A34A' }
  },
  Culture: {
    dark:  { fill: '#2DD4BF', text: '#042F2E', border: '#14B8A6' }, // Teal
    light: { fill: '#14B8A6', text: '#FFFFFF', border: '#0D9488' }
  },
  Food: {
    dark:  { fill: '#38BDF8', text: '#0C4A6E', border: '#0284C7' }, // Sky Blue
    light: { fill: '#0284C7', text: '#FFFFFF', border: '#0369A1' }
  },
  Other: {
    dark:  { fill: '#A78BFA', text: '#2E1065', border: '#8B5CF6' }, // Violet
    light: { fill: '#8B5CF6', text: '#FFFFFF', border: '#7C3AED' }
  }
};

const CATEGORY_ALIASES: Record<string, string> = {
  'food & restaurant': 'Food',
  'food': 'Food',
  'dining': 'Food',
  'restaurant': 'Food',
  'restaurants': 'Food',
  'groceries': 'Household',
  'grocery': 'Household',
  'household': 'Household',
  'shopping': 'Apparel',
  'apparel': 'Apparel',
  'clothing': 'Apparel',
  'clothes': 'Apparel',
  'transportation': 'Transportation',
  'transport': 'Transportation',
  'fuel': 'Transportation',
  'travel': 'Culture',
  'bills & utilities': 'Household',
  'rent': 'Household',
  'utilities': 'Household',
  'education': 'Education',
  'health': 'Health',
  'medical/healthcare': 'Health',
  'healthcare': 'Health',
  'medical': 'Health',
  'culture': 'Culture',
  'entertainment': 'Culture',
  'gift': 'Gift',
  'other': 'Other',
  'personal': 'Other',
  'subscription': 'Culture',
  'mobile/internet': 'Household',
  'loan/emi': 'Other',
  'investment': 'Health'
};

export const getCategoryThemeColor = (category: string, isDark: boolean): CategoryColor => {
  const themeKey = isDark ? 'dark' : 'light';
  if (CATEGORY_PALETTE[category]) {
    return CATEGORY_PALETTE[category][themeKey];
  }
  const cleanKey = category?.trim().toLowerCase();
  const alias = cleanKey ? CATEGORY_ALIASES[cleanKey] : undefined;
  if (alias && CATEGORY_PALETTE[alias]) {
    return CATEGORY_PALETTE[alias][themeKey];
  }
  return (
    CATEGORY_PALETTE[category]?.[themeKey] || {
      fill: isDark ? '#64748B' : '#475569',
      text: '#FFFFFF',
      border: isDark ? '#475569' : '#334155'
    }
  );
};
