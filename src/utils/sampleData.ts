import type { Transaction, Budget, RecurringTransaction, BankAccount, CashWalletConfig } from '../types';

export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [];

export const DEFAULT_CASH_WALLET: CashWalletConfig = {
  openingCash: 0,
  notes: 'Physical cash in wallet',
  updatedAt: new Date().toISOString(),
};

export function getInitialSampleData(): {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  bankAccounts: BankAccount[];
  cashWalletConfig: CashWalletConfig;
} {
  return {
    transactions: [],
    budgets: [],
    recurring: [],
    bankAccounts: [],
    cashWalletConfig: {
      openingCash: 0,
      notes: 'Physical cash in wallet',
      updatedAt: new Date().toISOString(),
    },
  };
}
