import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';

export interface LiveAccount {
  _id: string;
  id?: string;
  name?: string;
  accountName: string;
  accountType: 'bank' | 'cash';
  balance: number;
  openingBalance?: number;
  accountNumberMask?: string;
  accountNumber?: string;
}

/**
 * useAccounts Hook
 * Exposes the active user's reactive account state directly unified with TransactionContext
 * and reconciled ledger balances.
 */
export function useAccounts() {
  const { accounts: contextAccounts, refreshData } = useTransactions();

  const accounts: LiveAccount[] = useMemo(() => {
    return (contextAccounts || []).map((acc) => ({
      _id: acc._id || acc.id,
      id: acc.id || acc._id,
      name: acc.name,
      accountName: acc.accountName || acc.name,
      accountType: (acc.accountType || 'bank') as 'bank' | 'cash',
      balance: acc.balance,
      openingBalance: acc.openingBalance,
      accountNumberMask: acc.accountNumberMask,
    }));
  }, [contextAccounts]);

  return {
    accounts,
    isLoading: false,
    error: null,
    refetch: refreshData,
  };
}

export default useAccounts;
