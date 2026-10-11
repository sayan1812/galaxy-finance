import { useState, useEffect, useCallback } from 'react';
import api from '../services/apiClient';
import { useTransactions } from '../context/TransactionContext';

export interface LiveAccount {
  _id: string;
  id?: string;
  accountName: string;
  accountType: 'bank' | 'cash';
  balance: number;
  accountNumberMask?: string;
  accountNumber?: string;
}

/**
 * useAccounts Hook
 * Fetches the active user's registered bank and cash accounts directly from
 * MongoDB Atlas (`GET /api/v1/accounts`) with graceful fallback to local vault state.
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState<LiveAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { bankStatsList } = useTransactions();

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getAccounts();
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.accounts) ? res.accounts : null);
      if (list !== null) {
        setAccounts(list);
      } else {
        const localMapped: LiveAccount[] = (bankStatsList || []).map((bs) => ({
          _id: bs.bank.id,
          id: bs.bank.id,
          accountName: bs.bank.bankName,
          accountType: 'bank',
          balance: bs.currentBalance,
          accountNumberMask: bs.bank.accountNumberMasked,
        }));
        setAccounts(localMapped);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      console.warn('[useAccounts] Backend unreachable:', message);
      const localMapped: LiveAccount[] = (bankStatsList || []).map((bs) => ({
        _id: bs.bank.id,
        id: bs.bank.id,
        accountName: bs.bank.bankName,
        accountType: 'bank',
        balance: bs.currentBalance,
        accountNumberMask: bs.bank.accountNumberMasked,
      }));
      setAccounts(localMapped);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [bankStatsList]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
  };
}

export default useAccounts;
