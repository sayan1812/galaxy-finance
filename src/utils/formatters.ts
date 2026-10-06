import type { CurrencyConfig } from '../types';

export function formatCurrency(
  amount: number, 
  currency: CurrencyConfig = { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(absAmount);

    return `${isNegative ? '-' : ''}${currency.symbol}${formatted}`;
  } catch {
    return `${isNegative ? '-' : ''}${currency.symbol}${absAmount.toLocaleString()}`;
  }
}

export function formatCompactCurrency(
  amount: number, 
  currency: CurrencyConfig = { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' }
): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currency.code === 'INR') {
    if (abs >= 10000000) {
      return `${sign}${currency.symbol}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${currency.symbol}${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${currency.symbol}${(abs / 1000).toFixed(1)}k`;
    }
  } else {
    if (abs >= 1000000) {
      return `${sign}${currency.symbol}${(abs / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${currency.symbol}${(abs / 1000).toFixed(1)}k`;
    }
  }

  return formatCurrency(amount, currency);
}

export function formatPercentage(val: number): string {
  return `${Math.round(val)}%`;
}
