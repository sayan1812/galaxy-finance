import type { CurrencyConfig } from '../types';

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  locale: 'en-IN'
};

/**
 * Defensive currency formatter - guaranteed never to throw on null, undefined, NaN, or missing currency.
 */
export function formatCurrency(
  amount: number | null | undefined, 
  currency?: CurrencyConfig | null
): string {
  const curr = currency && typeof currency === 'object' && currency.symbol ? currency : DEFAULT_CURRENCY;
  const symbol = curr.symbol || '₹';
  const locale = curr.locale || 'en-IN';

  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return `${symbol}0`;
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absAmount = Math.abs(num);

  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(absAmount);

    return `${isNegative ? '-' : ''}${symbol}${formatted}`;
  } catch {
    return `${isNegative ? '-' : ''}${symbol}${absAmount.toLocaleString('en-IN')}`;
  }
}

/**
 * Defensive compact currency formatter (k, L, Cr, M).
 */
export function formatCompactCurrency(
  amount: number | null | undefined, 
  currency?: CurrencyConfig | null
): string {
  const curr = currency && typeof currency === 'object' && currency.symbol ? currency : DEFAULT_CURRENCY;
  const symbol = curr.symbol || '₹';

  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return `${symbol}0`;
  }

  const num = Number(amount);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (curr.code === 'INR') {
    if (abs >= 10000000) {
      return `${sign}${symbol}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${symbol}${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
    }
  } else {
    if (abs >= 1000000) {
      return `${sign}${symbol}${(abs / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
    }
  }

  return formatCurrency(amount, curr);
}

/**
 * Defensive percentage formatter.
 */
export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(Number(val))) {
    return '0%';
  }
  return `${Math.round(Number(val))}%`;
}

/**
 * Helper to produce a privacy-masked currency string like "₹ ••••••".
 */
export function maskCurrency(currency?: CurrencyConfig | null): string {
  const symbol = currency?.symbol || '₹';
  return `${symbol} ••••••`;
}
