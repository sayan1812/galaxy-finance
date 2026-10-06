import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import { Transaction, BankAccount, Budget, FinancialOverview, SyncState } from '../types';
import { api } from '../services/api';
import { getOfflineQueue, saveOfflineQueue, clearOfflineQueue } from '../services/storage';
import { sendLocalNotification } from '../services/notificationService';
import { roundToTwoDecimals, getLocalDateString, getLocalTimeString } from '../utils/formatters';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  overview: FinancialOverview;
  banks: BankAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  isLoading: boolean;
  isRefreshing: boolean;
  syncState: SyncState;
  offlineQueueCount: number;
  activeReaction: string | null;
  refreshData: () => Promise<void>;
  addTransaction: (tx: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBank: (bank: Partial<BankAccount>) => Promise<BankAccount>;
  updateBank: (id: string, bank: Partial<BankAccount>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  adjustBankBalance: (id: string, newBalance: number, reason: string) => Promise<void>;
  addBudget: (budget: Partial<Budget>) => Promise<Budget>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  triggerReaction: (reaction: string) => void;
  clearReaction: () => void;
}

const defaultOverview: FinancialOverview = {
  netAvailableMoney: 0,
  totalBankBalance: 0,
  cashBalance: 0,
  totalIncome: 0,
  totalExpense: 0,
  transactionCount: 0
};

const FinanceContext = createContext<FinanceContextType>({} as any);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<FinancialOverview>(defaultOverview);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('online');
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Reaction helper
  const triggerReaction = useCallback((reaction: string) => {
    setActiveReaction(reaction);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(() => {
      setActiveReaction(prev => prev === reaction ? null : prev);
    }, 2800);
  }, []);

  const clearReaction = useCallback(() => {
    setActiveReaction(null);
  }, []);

  // Fetch all core financial data from backend
  const refreshData = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const [txRes, banksRes, budgetsRes] = await Promise.all([
        api.getTransactions({ limit: 50 }),
        api.getBanks(),
        api.getBudgets()
      ]);

      if (txRes && txRes.overview) {
        setOverview(txRes.overview);
      }
      if (txRes && txRes.transactions) {
        setTransactions(txRes.transactions);
      }
      if (banksRes && banksRes.banks) {
        setBanks(banksRes.banks);
      }
      if (budgetsRes && budgetsRes.budgets) {
        setBudgets(budgetsRes.budgets);
      }
      setSyncState('online');
    } catch (err: any) {
      console.warn('[Finance] Refresh data error:', err);
      // If network failed, mark offline
      if (err.message && (err.message.includes('Network') || err.message.includes('timeout'))) {
        setSyncState('offline');
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [token]);

  // Initial load when logged in
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      refreshData();
      // Check offline queue count
      getOfflineQueue().then(queue => setOfflineQueueCount(queue.length));
    } else {
      setOverview(defaultOverview);
      setBanks([]);
      setTransactions([]);
      setBudgets([]);
    }
  }, [token, refreshData]);

  // Sync offline queue to backend
  const syncOfflineQueue = useCallback(async () => {
    if (!token) return;
    try {
      const queue = await getOfflineQueue();
      if (!queue || queue.length === 0) {
        setOfflineQueueCount(0);
        return;
      }

      setSyncState('syncing');
      const res = await api.syncBatch(queue);

      if (res && res.success) {
        await clearOfflineQueue();
        setOfflineQueueCount(0);
        setSyncState('synced');
        triggerReaction('sync_completed');
        sendLocalNotification(
          '✨ Offline Transactions Synced',
          `Successfully synchronized ${res.syncedCount} transaction(s) with the server.`
        );
        await refreshData();
      } else {
        setSyncState('error');
      }
    } catch (err) {
      console.warn('[Finance] Sync offline queue error:', err);
      setSyncState('error');
    }
  }, [token, refreshData, triggerReaction]);

  // Monitor Network Connectivity & Trigger Automatic Sync
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (isOnline) {
        getOfflineQueue().then(queue => {
          setOfflineQueueCount(queue.length);
          if (queue.length > 0) {
            syncOfflineQueue();
          } else {
            setSyncState('online');
          }
        });
      } else {
        setSyncState('offline');
      }
    });

    return () => unsubscribe();
  }, [syncOfflineQueue]);

  // Add Transaction (Online with Offline Fallback)
  const addTransaction = async (txData: Partial<Transaction>): Promise<Transaction> => {
    const netState = await NetInfo.fetch();
    const isOnline = Boolean(netState.isConnected && netState.isInternetReachable !== false);

    if (isOnline) {
      try {
        const res = await api.createTransaction(txData);
        if (res && res.transaction) {
          triggerReaction('transaction_added');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          
          // Check budget alert (case-insensitive)
          if (txData.type === 'expense' && txData.category) {
            const matchingBudget = budgets.find(b => b.category?.trim().toLowerCase() === txData.category?.trim().toLowerCase());
            if (matchingBudget) {
              const newSpent = (matchingBudget.spent || 0) + Number(txData.amount);
              const ratio = newSpent / matchingBudget.amount;
              if (ratio >= 1.0) {
                sendLocalNotification(
                  '🚨 Budget Exceeded!',
                  `You have exceeded your monthly budget for ${txData.category} (₹${newSpent}/₹${matchingBudget.amount}).`
                );
              } else if (ratio >= 0.8) {
                sendLocalNotification(
                  '⚠️ Budget Warning (80% Used)',
                  `You have reached 80% of your ${txData.category} budget.`
                );
              }
            }
          }

          await refreshData();
          return res.transaction;
        }
      } catch (err: any) {
        console.warn('[Finance] Online create failed, fallback to offline queue:', err);
      }
    }

    // Offline queue fallback
    const localId = 'offline_tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const offlineItem: Transaction = {
      id: localId,
      localId,
      amount: Number(txData.amount) || 0,
      type: txData.type || 'expense',
      category: txData.category || 'Other',
      subcategory: txData.subcategory,
      paymentMethod: txData.paymentMethod || 'Cash',
      source: txData.source || 'Manual',
      merchant: txData.merchant,
      description: txData.description,
      date: txData.date || getLocalDateString(),
      time: txData.time || getLocalTimeString(),
      transactionReference: txData.transactionReference,
      bankId: txData.bankId || null,
      createdAt: new Date().toISOString(),
      isPendingSync: true
    };

    const currentQueue = await getOfflineQueue();
    currentQueue.push(offlineItem);
    await saveOfflineQueue(currentQueue);
    setOfflineQueueCount(currentQueue.length);

    // Optimistically update local transactions & overview with transfer awareness & float precision
    setTransactions(prev => [offlineItem, ...prev]);
    setOverview(prev => {
      const amt = offlineItem.amount;
      const isTransfer = offlineItem.category === 'Transfer';
      const isExp = offlineItem.type === 'expense';
      const isCash = offlineItem.paymentMethod === 'Cash';

      const newTotalIncome = (!isTransfer && !isExp) ? prev.totalIncome + amt : prev.totalIncome;
      const newTotalExpense = (!isTransfer && isExp) ? prev.totalExpense + amt : prev.totalExpense;
      const newCash = isCash
        ? (isExp ? prev.cashBalance - amt : prev.cashBalance + amt)
        : prev.cashBalance;
      const newBank = !isCash
        ? (isExp ? prev.totalBankBalance - amt : prev.totalBankBalance + amt)
        : prev.totalBankBalance;
      const newNet = isTransfer
        ? prev.netAvailableMoney
        : (isExp ? prev.netAvailableMoney - amt : prev.netAvailableMoney + amt);

      return {
        ...prev,
        totalIncome: roundToTwoDecimals(newTotalIncome),
        totalExpense: roundToTwoDecimals(newTotalExpense),
        cashBalance: roundToTwoDecimals(newCash),
        totalBankBalance: roundToTwoDecimals(newBank),
        netAvailableMoney: roundToTwoDecimals(newNet),
        transactionCount: prev.transactionCount + 1
      };
    });

    triggerReaction('transaction_added');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return offlineItem;
  };

  const updateTransaction = async (id: string, txData: Partial<Transaction>) => {
    await api.updateTransaction(id, txData);
    triggerReaction('transaction_updated');
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    triggerReaction('transaction_deleted');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    await refreshData();
  };

  const addBank = async (bankData: Partial<BankAccount>): Promise<BankAccount> => {
    const res = await api.createBank(bankData);
    triggerReaction('bank_added');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await refreshData();
    return res.bank;
  };

  const updateBank = async (id: string, bankData: Partial<BankAccount>) => {
    await api.updateBank(id, bankData);
    triggerReaction('bank_updated');
    await refreshData();
  };

  const deleteBank = async (id: string) => {
    await api.deleteBank(id);
    triggerReaction('bank_deleted');
    await refreshData();
  };

  const adjustBankBalance = async (id: string, newBalance: number, reason: string) => {
    await api.adjustBankBalance(id, newBalance, reason);
    triggerReaction('balance_adjusted');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await refreshData();
  };

  const addBudget = async (budgetData: Partial<Budget>): Promise<Budget> => {
    const res = await api.createBudget(budgetData);
    triggerReaction('budget_saved');
    await refreshData();
    return res.budget;
  };

  const updateBudget = async (id: string, budgetData: Partial<Budget>) => {
    await api.updateBudget(id, budgetData);
    triggerReaction('budget_saved');
    await refreshData();
  };

  const deleteBudget = async (id: string) => {
    await api.deleteBudget(id);
    await refreshData();
  };

  return (
    <FinanceContext.Provider
      value={{
        overview,
        banks,
        transactions,
        budgets,
        isLoading,
        isRefreshing,
        syncState,
        offlineQueueCount,
        activeReaction,
        refreshData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBank,
        updateBank,
        deleteBank,
        adjustBankBalance,
        addBudget,
        updateBudget,
        deleteBudget,
        syncOfflineQueue,
        triggerReaction,
        clearReaction
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
