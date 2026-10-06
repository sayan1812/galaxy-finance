import type { Category, CurrencyConfig, PaymentMethod } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'food-restaurant', name: 'Food & Restaurant', type: 'EXPENSE', icon: 'UtensilsCrossed', color: '#f97316' },
  { id: 'grocery', name: 'Grocery', type: 'EXPENSE', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'transportation', name: 'Transportation', type: 'EXPENSE', icon: 'Bus', color: '#06b6d4' },
  { id: 'fuel', name: 'Fuel', type: 'EXPENSE', icon: 'Fuel', color: '#ef4444' },
  { id: 'shopping', name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingCart', color: '#ec4899' },
  { id: 'bills-utilities', name: 'Bills & Utilities', type: 'EXPENSE', icon: 'Zap', color: '#eab308' },
  { id: 'rent', name: 'Rent', type: 'EXPENSE', icon: 'Home', color: '#8b5cf6' },
  { id: 'education', name: 'Education', type: 'EXPENSE', icon: 'GraduationCap', color: '#3b82f6' },
  { id: 'medical-healthcare', name: 'Medical/Healthcare', type: 'EXPENSE', icon: 'HeartPulse', color: '#f43f5e' },
  { id: 'entertainment', name: 'Entertainment', type: 'EXPENSE', icon: 'Film', color: '#a855f7' },
  { id: 'travel', name: 'Travel', type: 'EXPENSE', icon: 'Plane', color: '#0ea5e9' },
  { id: 'mobile-internet', name: 'Mobile/Internet', type: 'EXPENSE', icon: 'Wifi', color: '#14b8a6' },
  { id: 'subscription', name: 'Subscription', type: 'EXPENSE', icon: 'Tv', color: '#6366f1' },
  { id: 'personal', name: 'Personal', type: 'EXPENSE', icon: 'User', color: '#64748b' },
  { id: 'loan-emi', name: 'Loan/EMI', type: 'EXPENSE', icon: 'Landmark', color: '#d97706' },
  { id: 'investment', name: 'Investment', type: 'BOTH', icon: 'TrendingUp', color: '#059669' },
  { id: 'gift', name: 'Gift', type: 'BOTH', icon: 'Gift', color: '#db2777' },

  // Income Categories
  { id: 'salary', name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#16a34a' },
  { id: 'freelance-business', name: 'Freelance/Business', type: 'INCOME', icon: 'Laptop', color: '#0284c7' },
  { id: 'other', name: 'Other', type: 'BOTH', icon: 'MoreHorizontal', color: '#6b7280' },
];

export interface PaymentMethodDetails {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
  isOnline: boolean;
  iconName: string;
  badgeBg: string;
  badgeText: string;
}

export const PAYMENT_METHODS: PaymentMethodDetails[] = [
  {
    id: 'CASH',
    label: 'Cash',
    shortLabel: 'Cash',
    isOnline: false,
    iconName: 'Banknote',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'UPI',
    label: 'UPI / QR',
    shortLabel: 'UPI',
    isOnline: true,
    iconName: 'Smartphone',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'DEBIT_CARD',
    label: 'Debit Card',
    shortLabel: 'Debit Card',
    isOnline: true,
    iconName: 'CreditCard',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: 'CREDIT_CARD',
    label: 'Credit Card',
    shortLabel: 'Credit Card',
    isOnline: true,
    iconName: 'CreditCard',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Bank Transfer (IMPS/NEFT)',
    shortLabel: 'Bank Transfer',
    isOnline: true,
    iconName: 'Landmark',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'OTHER',
    label: 'Other',
    shortLabel: 'Other',
    isOnline: false,
    iconName: 'MoreHorizontal',
    badgeBg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
  },
];

export const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
];

export const AVAILABLE_ICONS = [
  'UtensilsCrossed', 'ShoppingBag', 'Bus', 'Fuel', 'ShoppingCart', 'Zap',
  'Home', 'GraduationCap', 'HeartPulse', 'Film', 'Plane', 'Wifi',
  'Tv', 'User', 'Landmark', 'TrendingUp', 'Gift', 'Briefcase',
  'Laptop', 'Coffee', 'Car', 'Smartphone', 'Tag', 'CreditCard', 'MoreHorizontal'
];

export const COLOR_PALETTE = [
  '#f97316', '#10b981', '#06b6d4', '#ef4444', '#ec4899', '#eab308',
  '#8b5cf6', '#3b82f6', '#f43f5e', '#a855f7', '#0ea5e9', '#14b8a6',
  '#6366f1', '#64748b', '#d97706', '#059669', '#16a34a', '#0284c7'
];

export const POPULAR_BANKS = [
  'HDFC Bank',
  'SBI',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Other'
];

export const BANK_ACCOUNT_TYPES = [
  'Savings',
  'Current',
  'Salary',
  'Other'
] as const;

export const PLANET_PALETTE = [
  { name: 'Azure Core', color: '#38bdf8', glow: '#0284c7' },
  { name: 'Emerald Oasis', color: '#34d399', glow: '#059669' },
  { name: 'Solar Amber', color: '#fbbf24', glow: '#d97706' },
  { name: 'Cosmic Violet', color: '#a78bfa', glow: '#7c3aed' },
  { name: 'Supernova Rose', color: '#f43f5e', glow: '#e11d48' },
  { name: 'Cyan Starlight', color: '#22d3ee', glow: '#0891b2' },
  { name: 'Golden Nebula', color: '#f59e0b', glow: '#b45309' },
  { name: 'Deep Indigo', color: '#818cf8', glow: '#4f46e5' },
];

