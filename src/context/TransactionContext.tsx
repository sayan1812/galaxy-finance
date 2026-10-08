import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  Transaction, 
  Budget, 
  RecurringTransaction, 
  Category, 
  AppSettings,
  ConnectedAccount,
  SyncStatus,
  TransactionType,
  BankAccount,
  CashWalletConfig,
  GalaxyIntensity,
  CosmicTheme,
  MicroInteractionType,
  MicroInteractionEvent
} from '../types';
import { DEFAULT_CATEGORIES, AVAILABLE_CURRENCIES } from '../constants/categories';
import { getInitialSampleData, DEFAULT_BANK_ACCOUNTS, DEFAULT_CASH_WALLET } from '../utils/sampleData';
import { categorizationService } from '../services/categorizationService';
import { financialIntegrationService } from '../services/financialIntegrationService';
import { transactionImportService } from '../services/transactionImportService';
import { isSameMonth } from '../utils/dateUtils';
import api from '../services/apiClient';

export interface BudgetStatus {
  category: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface BankComputedStats {
  bank: BankAccount;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface CommandCenterStats {
  netAvailableMoney: number;
  totalBanks: number;
  totalBankBalance: number;
  cashBalance: number;
  totalExpenseAllTime: number;
  totalIncomeAllTime: number;
  thisMonthExpense: number;
  thisMonthIncome: number;
  highestExpenseCategory: { category: string; amount: number; percentage: number } | null;
  largestTransaction: Transaction | null;
  mostUsedPaymentMethod: string;
  highestBalanceBank: { name: string; balance: number } | null;
}

export interface TransactionContextType {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  categories: Category[];
  settings: AppSettings;
  connectedAccounts: ConnectedAccount[];
  syncStatus: SyncStatus;

  // Bank Accounts Management
  bankAccounts: BankAccount[];
  cashWalletConfig: CashWalletConfig;
  bankStatsList: BankComputedStats[];
  totalBankBalance: number;
  netAvailableMoney: number;
  commandCenterStats: CommandCenterStats;

  addBankAccount: (data: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => BankAccount;
  updateBankAccount: (id: string, data: Partial<Omit<BankAccount, 'id' | 'createdAt'>>) => void;
  deleteBankAccount: (id: string) => void;
  updateBankBalance: (id: string, newBalance: number) => void;
  getBankById: (id: string) => BankAccount | undefined;
  updateCashWalletOpening: (openingCash: number) => void;

  // Transaction CRUD
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  addCashTransaction: (data: {
    amount: number;
    type: TransactionType;
    category: string;
    merchant?: string;
    description?: string;
    date: string;
    time?: string;
  }) => Transaction;
  addCashExpense: (data: {
    amount: number;
    category: string;
    merchant?: string;
    description?: string;
    date: string;
    time?: string;
  }) => Transaction;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => Transaction | null;
  bulkDeleteTransactions: (ids: string[]) => void;
  getTransactionById: (id: string) => Transaction | undefined;

  // Online Integration & Sync
  triggerSync: (simulateDuplicate?: boolean) => Promise<void>;
  resolveDuplicateCandidate: (keep: boolean) => void;
  importExternalPayload: (payload: Partial<Transaction>) => { success: boolean; message: string };

  // Budget CRUD
  addBudget: (category: string, monthlyLimit: number) => void;
  updateBudget: (id: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;
  getBudgetStatusList: () => BudgetStatus[];

  // Recurring CRUD
  addRecurring: (data: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurring: (id: string, data: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurringActive: (id: string) => void;
  processRecurringItem: (id: string) => void;
  dueRecurringCount: number;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => void;
  deleteCategory: (id: string) => void;

  // Privacy Masking (OFF by default)
  isMasked: boolean;
  toggleMask: () => void;

  // Settings & Storage
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setGalaxyIntensity: (intensity: GalaxyIntensity) => void;
  toggleReduceMotion: () => void;
  setCosmicTheme: (theme: CosmicTheme) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;

  // Dashboard Aggregates
  todayIncome: number;
  todayExpense: number;
  todayBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
  cashBalance: number;
  onlineUpiSpendingMonth: number;
  cardSpendingMonth: number;
  bankSpendingMonth: number;
  totalIncomeAllTime: number;
  totalExpenseAllTime: number;
  netWorthAllTime: number;

  // Modals & UI State
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isAddCashModalOpen: boolean;
  setIsAddCashModalOpen: (open: boolean) => void;
  isCashExpenseModalOpen: boolean;
  setIsCashExpenseModalOpen: (open: boolean) => void;
  isAddBankModalOpen: boolean;
  setIsAddBankModalOpen: (open: boolean) => void;
  editingBank: BankAccount | null;
  setEditingBank: (bank: BankAccount | null) => void;
  selectedBankDetail: BankAccount | null;
  setSelectedBankDetail: (bank: BankAccount | null) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (txn: Transaction | null) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (txn: Transaction | null) => void;
  duplicateCandidate: { candidate: Transaction; reason: string } | null;
  setDuplicateCandidate: (item: { candidate: Transaction; reason: string } | null) => void;
  galaxyMode: 'accounts' | 'expenses';
  setGalaxyMode: (mode: 'accounts' | 'expenses') => void;

  // Micro-Interactions & Reactions
  microInteraction: MicroInteractionEvent | null;
  triggerMicroInteraction: (type: MicroInteractionType, title: string, message?: string, amount?: number, emoji?: string) => void;
  clearMicroInteraction: () => void;

  // Delete Confirmation Modal
  deleteConfirmation: {
    isOpen: boolean;
    transactionId?: string;
    title: string;
    message: string;
  };
  requestDeleteTransaction: (id: string) => void;
  cancelDeleteTransaction: () => void;
  confirmDeleteTransaction: () => void;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'rupeewise_transactions_v2',
  BUDGETS: 'rupeewise_budgets_v2',
  RECURRING: 'rupeewise_recurring_v2',
  CATEGORIES: 'rupeewise_categories_v2',
  SETTINGS: 'rupeewise_settings_v2',
  BANKS: 'rupeewise_banks_v2',
  CASH_WALLET: 'rupeewise_cash_wallet_v2',
};

const DEFAULT_SETTINGS: AppSettings = {
  currency: AVAILABLE_CURRENCIES[0], // ₹ INR
  theme: 'light', // Light mode standard
  galaxyIntensity: 'medium',
  reduceMotion: false,
  cosmicTheme: 'nebula-deep',
  enableBudgetAlerts: true,
  budgetAlertThreshold: 80,
  soundFeedback: true,
  autoSyncIntervalMinutes: 15,
  demoModeEnabled: true,
  enableDuplicateAutoPrompt: true,
};

const TransactionContext = createContext<TransactionContextType | null>(null);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored transactions:', e);
    }
    const sample = getInitialSampleData();
    return sample.transactions;
  });

  // 2. Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANKS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored banks:', e);
    }
    return DEFAULT_BANK_ACCOUNTS;
  });

  // 3. Cash Wallet Config State
  const [cashWalletConfig, setCashWalletConfig] = useState<CashWalletConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CASH_WALLET);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored cash wallet:', e);
    }
    return DEFAULT_CASH_WALLET;
  });

  // 4. Budgets State
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored budgets:', e);
    }
    return getInitialSampleData().budgets;
  });

  // 5. Recurring Transactions State
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored recurring items:', e);
    }
    return getInitialSampleData().recurring;
  });

  // 6. Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // 7. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validCurrency = (parsed && parsed.currency && parsed.currency.symbol)
          ? parsed.currency
          : DEFAULT_SETTINGS.currency;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          currency: validCurrency,
        };
      }
    } catch (e) {
      console.error('Failed to parse stored settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 8. Connected Accounts & Sync Status
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    return financialIntegrationService.getAccounts();
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'IDLE',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    message: 'Accounts synchronized and up to date.',
  });

  const [duplicateCandidate, setDuplicateCandidate] = useState<{
    candidate: Transaction;
    reason: string;
  } | null>(null);

  // 9. Modals & UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAddCashModalOpen, setIsAddCashModalOpen] = useState<boolean>(false);
  const [isCashExpenseModalOpen, setIsCashExpenseModalOpen] = useState<boolean>(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [selectedBankDetail, setSelectedBankDetail] = useState<BankAccount | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [galaxyMode, setGalaxyMode] = useState<'accounts' | 'expenses'>('accounts');

  // 10. Privacy Masking State (OFF by default)
  const [isMasked, setIsMasked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('galaxy_mask_balances');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleMask = useCallback(() => {
    setIsMasked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('galaxy_mask_balances', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Micro-Interactions and Delete Confirmation
  const [microInteraction, setMicroInteraction] = useState<MicroInteractionEvent | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    transactionId?: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'Delete this transaction?',
    message: 'This action cannot be undone. Balances and reports will be recalculated immediately.'
  });

  const triggerMicroInteraction = useCallback((
    type: MicroInteractionType,
    title: string,
    message?: string,
    amount?: number,
    emoji?: string
  ) => {
    setMicroInteraction({
      id: 'mi_' + Date.now(),
      type,
      title,
      message,
      amount,
      emoji
    });
  }, []);

  const clearMicroInteraction = useCallback(() => {
    setMicroInteraction(null);
  }, []);

  // Persist State to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(bankAccounts));
    } catch (e) {
      console.error('Failed to save banks:', e);
    }
  }, [bankAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CASH_WALLET, JSON.stringify(cashWalletConfig));
    } catch (e) {
      console.error('Failed to save cash wallet:', e);
    }
  }, [cashWalletConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
    } catch (e) {
      console.error('Failed to save recurring:', e);
    }
  }, [recurring]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }

    // Enforce light mode (dark and night modes withdrawn)
    document.documentElement.classList.remove('dark', 'night');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, [settings]);

  // Sync live accounts from MongoDB Atlas on initial load
  useEffect(() => {
    let isMounted = true;
    api.getAccounts().then((res: any) => {
      if (isMounted && res && Array.isArray(res.accounts) && res.accounts.length > 0) {
        const liveBanks: BankAccount[] = res.accounts
          .filter((a: any) => a.accountType !== 'cash')
          .map((a: any) => ({
            id: a._id || a.id,
            bankName: a.accountName,
            accountType: 'Savings' as const,
            nickname: a.accountName,
            openingBalance: a.balance,
            accountNumberMasked: a.accountNumberMask || 'XXXX XXXX 0000',
            createdAt: a.createdAt || new Date().toISOString(),
            updatedAt: a.updatedAt || new Date().toISOString(),
          }));

        if (liveBanks.length > 0) {
          setBankAccounts(liveBanks);
        }
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Bank Operations ---
  const addBankAccount = useCallback((data: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): BankAccount => {
    const now = new Date().toISOString();
    const tempId = `bank-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newBank: BankAccount = {
      ...data,
      id: tempId,
      createdAt: now,
      updatedAt: now,
    };
    setBankAccounts((prev) => [...prev, newBank]);
    api.createAccount({
      accountName: data.bankName,
      accountType: 'bank',
      balance: data.openingBalance,
      accountNumberMask: data.accountNumberMasked,
    }).then((res: any) => {
      const serverId = res?.account?._id || res?.account?.id;
      if (serverId) {
        setBankAccounts((prev) =>
          prev.map((b) => (b.id === tempId ? { ...b, id: serverId } : b))
        );
      }
    }).catch(() => {});
    return newBank;
  }, []);

  const updateBankAccount = useCallback((id: string, data: Partial<Omit<BankAccount, 'id' | 'createdAt'>>) => {
    setBankAccounts((prev) =>
      prev.map((bank) =>
        bank.id === id
          ? { ...bank, ...data, updatedAt: new Date().toISOString() }
          : bank
      )
    );
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    setBankAccounts((prev) => prev.filter((bank) => bank.id !== id));
    // Cascading delete associated transactions
    setTransactions((prev) => prev.filter((tx) => tx.bankAccountId !== id));
    api.deleteAccount(id).catch(() => {});
    api.deleteBank(id).catch(() => {});
  }, []);

  const getBankById = useCallback((id: string): BankAccount | undefined => {
    return bankAccounts.find((b) => b.id === id);
  }, [bankAccounts]);

  const updateCashWalletOpening = useCallback((openingCash: number) => {
    setCashWalletConfig((prev) => ({
      ...prev,
      openingCash: Math.max(0, openingCash),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // --- Transaction Operations ---
  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const now = new Date().toISOString();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const defaultTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // Auto-learn merchant category if merchant is provided
    if (data.merchant && data.category) {
      categorizationService.learnMerchantCategory(data.merchant, data.category);
    }

    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: data.time || defaultTime,
      createdAt: now,
      updatedAt: now,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Trigger micro-interaction reaction
    triggerMicroInteraction(
      'TRANSACTION_ADDED',
      'Transaction Added',
      `${data.category} • ₹${data.amount.toLocaleString('en-IN')}`,
      data.amount,
      data.type === 'INCOME' ? '💰' : '💸'
    );

    // Sync to backend asynchronously
    api.createTransaction({
      amount: data.amount,
      type: data.type.toLowerCase(),
      category: data.category,
      subcategory: data.subcategory,
      paymentMethod: data.paymentMethod,
      source: data.source,
      merchant: data.merchant,
      description: data.description,
      date: data.date,
      time: data.time || defaultTime,
      bankId: data.bankAccountId,
      accountId: data.bankAccountId
    }).catch(() => {});

    return newTx;
  }, [triggerMicroInteraction]);

  const addCashTransaction = useCallback((data: {
    amount: number;
    type: TransactionType;
    category: string;
    merchant?: string;
    description?: string;
    date: string;
    time?: string;
  }): Transaction => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const defaultTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    return addTransaction({
      amount: data.amount,
      type: data.type,
      currency: 'INR',
      category: data.category,
      paymentMethod: 'CASH',
      source: 'MANUAL',
      account: 'Physical Cash Wallet',
      merchant: data.merchant || '',
      description: data.description || (data.type === 'INCOME' ? 'Cash Received' : 'Cash Spent'),
      date: data.date,
      time: data.time || defaultTime,
    });
  }, [addTransaction]);

  const addCashExpense = useCallback((data: {
    amount: number;
    category: string;
    merchant?: string;
    description?: string;
    date: string;
    time?: string;
  }): Transaction => {
    return addCashTransaction({
      ...data,
      type: 'EXPENSE',
    });
  }, [addCashTransaction]);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            ...data,
            updatedAt: new Date().toISOString(),
          };

          // If merchant category is updated, teach merchant memory
          if (updated.merchant && updated.category && updated.category !== item.category) {
            categorizationService.learnMerchantCategory(updated.merchant, updated.category);
          }
          return updated;
        }
        return item;
      })
    );

    api.updateTransaction(id, data).catch(() => {});
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    triggerMicroInteraction('TRANSACTION_DELETED', 'Transaction Deleted', 'Balances and reports recalculated', undefined, '🗑️');
    api.deleteTransaction(id).catch(() => {});
  }, [triggerMicroInteraction]);

  const requestDeleteTransaction = useCallback((id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      transactionId: id,
      title: 'Delete this transaction?',
      message: 'This action cannot be undone. Balances and reports will be recalculated immediately.'
    });
  }, []);

  const cancelDeleteTransaction = useCallback(() => {
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false, transactionId: undefined }));
  }, []);

  const confirmDeleteTransaction = useCallback(() => {
    if (deleteConfirmation.transactionId) {
      deleteTransaction(deleteConfirmation.transactionId);
    }
    setDeleteConfirmation(prev => ({ ...prev, isOpen: false, transactionId: undefined }));
  }, [deleteConfirmation.transactionId, deleteTransaction]);

  const bulkDeleteTransactions = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setTransactions((prev) => prev.filter((item) => !set.has(item.id)));
  }, []);

  const duplicateTransaction = useCallback((id: string): Transaction | null => {
    const original = transactions.find((t) => t.id === id);
    if (!original) return null;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newTx: Transaction = {
      ...original,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: currentDate,
      time: currentTime,
      transactionReference: original.transactionReference ? `${original.transactionReference}-COPY` : undefined,
      description: original.description ? `${original.description} (Copy)` : 'Copy',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  }, [transactions]);

  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return transactions.find((t) => t.id === id);
  }, [transactions]);

  // --- Online Integration & Sync ---
  const triggerSync = useCallback(async (simulateDuplicate: boolean = false): Promise<void> => {
    setSyncStatus((prev) => ({ ...prev, state: 'SYNCING', message: 'Connecting to financial feeds & bank webhooks...' }));

    await new Promise((res) => setTimeout(res, 850));

    try {
      if (simulateDuplicate && transactions.length > 0) {
        const candidateRaw = financialIntegrationService.generateDuplicateCandidate(transactions[0]);
        const result = transactionImportService.processIncomingTransaction(candidateRaw, transactions);

        if (result.status === 'DUPLICATE_DETECTED' && result.transaction) {
          setDuplicateCandidate({
            candidate: result.transaction,
            reason: result.duplicateInfo?.reason || 'Identical transaction detected',
          });
          setSyncStatus({
            state: 'DUPLICATE_DETECTED',
            lastSyncedAt: new Date().toISOString(),
            message: 'Possible duplicate transaction detected.',
            duplicateCandidate: result.transaction,
          });
          return;
        }
      }

      const mockRaw = financialIntegrationService.generateMockOnlineTransaction();
      const result = transactionImportService.processIncomingTransaction(mockRaw, transactions);

      if (result.status === 'DUPLICATE_DETECTED' && result.transaction) {
        setDuplicateCandidate({
          candidate: result.transaction,
          reason: result.duplicateInfo?.reason || 'Identical transaction detected',
        });
        setSyncStatus({
          state: 'DUPLICATE_DETECTED',
          lastSyncedAt: new Date().toISOString(),
          message: 'Possible duplicate transaction detected.',
          duplicateCandidate: result.transaction,
        });
      } else if (result.status === 'IMPORTED' && result.transaction) {
        setTransactions((prev) => [result.transaction!, ...prev]);
        setSyncStatus({
          state: 'SUCCESS',
          lastSyncedAt: new Date().toISOString(),
          message: `1 new online transaction imported from ${result.transaction.account || 'Connected Feed'}.`,
          importedCount: 1,
        });
      } else {
        setSyncStatus({
          state: 'NO_NEW',
          lastSyncedAt: new Date().toISOString(),
          message: 'Feeds synchronized. No pending transactions found.',
        });
      }

      setConnectedAccounts(financialIntegrationService.getAccounts());
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Unknown sync error';
      setSyncStatus({
        state: 'FAILED',
        lastSyncedAt: new Date().toISOString(),
        message: `Sync failed: ${err}`,
      });
    }
  }, [transactions]);

  const resolveDuplicateCandidate = useCallback((keep: boolean) => {
    if (!duplicateCandidate) return;

    if (keep) {
      const resolvedTx: Transaction = {
        ...duplicateCandidate.candidate,
        duplicateResolved: true,
      };
      setTransactions((prev) => [resolvedTx, ...prev]);
      setSyncStatus({
        state: 'SUCCESS',
        lastSyncedAt: new Date().toISOString(),
        message: 'Duplicate flagged transaction kept by user confirmation.',
      });
    } else {
      setSyncStatus({
        state: 'NO_NEW',
        lastSyncedAt: new Date().toISOString(),
        message: 'Duplicate transaction ignored and discarded.',
      });
    }

    setDuplicateCandidate(null);
  }, [duplicateCandidate]);

  const importExternalPayload = useCallback((payload: Partial<Transaction>): { success: boolean; message: string } => {
    try {
      const result = transactionImportService.processIncomingTransaction(payload, transactions);
      if (result.status === 'DUPLICATE_DETECTED' && result.transaction) {
        setDuplicateCandidate({
          candidate: result.transaction,
          reason: result.duplicateInfo?.reason || 'External payload matched an existing record.',
        });
        return { success: false, message: 'Duplicate detected - awaiting user resolution.' };
      }

      if (result.status === 'IMPORTED' && result.transaction) {
        setTransactions((prev) => [result.transaction!, ...prev]);
        return { success: true, message: 'External transaction imported successfully.' };
      }

      return { success: false, message: 'Failed to process transaction payload.' };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Import failed';
      return { success: false, message: err };
    }
  }, [transactions]);

  // --- Budget Operations ---
  const addBudget = useCallback((category: string, monthlyLimit: number) => {
    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      category,
      monthlyLimit: Math.max(0, monthlyLimit),
    };
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.category.toLowerCase() !== category.toLowerCase());
      return [...filtered, newBudget];
    });
  }, []);

  const updateBudget = useCallback((id: string, monthlyLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyLimit: Math.max(0, monthlyLimit) } : b))
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // --- Recurring Operations ---
  const addRecurring = useCallback((data: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...data,
      id: `rec-${Date.now()}`,
    };
    setRecurring((prev) => [...prev, newRec]);
  }, []);

  const updateRecurring = useCallback((id: string, data: Partial<RecurringTransaction>) => {
    setRecurring((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleRecurringActive = useCallback((id: string) => {
    setRecurring((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  }, []);

  const processRecurringItem = useCallback((id: string) => {
    const item = recurring.find((r) => r.id === id);
    if (!item) return;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newTx: Transaction = {
      id: `tx-rec-${Date.now()}`,
      type: item.type,
      amount: item.amount,
      currency: 'INR',
      category: item.category,
      paymentMethod: item.paymentMethod,
      source: 'AUTOMATIC',
      merchant: item.merchant,
      description: item.description || `Auto-recurring: ${item.title}`,
      account: item.account || 'Recurring Schedule',
      bankAccountId: item.bankAccountId,
      isRecurring: true,
      recurringScheduleId: item.id,
      date: currentDate,
      time: currentTime,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    const nextDate = new Date(item.nextDueDate || currentDate);
    if (item.frequency === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (item.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (item.frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (item.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const nextDateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}`;

    setRecurring((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              lastProcessedDate: currentDate,
              nextDueDate: nextDateStr,
            }
          : r
      )
    );
  }, [recurring]);

  const dueRecurringCount = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return recurring.filter((r) => r.isActive && r.nextDueDate <= todayStr).length;
  }, [recurring]);

  // --- Category Operations ---
  const addCategory = useCallback((category: Omit<Category, 'id' | 'isCustom'>) => {
    const newCat: Category = {
      ...category,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Settings & Storage Operations ---
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const setGalaxyIntensity = useCallback((intensity: GalaxyIntensity) => {
    setSettings((prev) => ({ ...prev, galaxyIntensity: intensity }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  }, []);

  const setCosmicTheme = useCallback((theme: CosmicTheme) => {
    setSettings((prev) => ({ ...prev, cosmicTheme: theme }));
  }, []);

  const resetToSampleData = useCallback(() => {
    const sample = getInitialSampleData();
    setTransactions(sample.transactions);
    setBudgets(sample.budgets);
    setRecurring(sample.recurring);
    setBankAccounts(DEFAULT_BANK_ACCOUNTS);
    setCashWalletConfig(DEFAULT_CASH_WALLET);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
    financialIntegrationService.resetAccounts();
    setConnectedAccounts(financialIntegrationService.getAccounts());
    categorizationService.clearAllLearnedRules();
    setSyncStatus({
      state: 'IDLE',
      lastSyncedAt: new Date().toISOString(),
      message: 'Reset to initial sample financial database.',
    });
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setRecurring([]);
    setBankAccounts([]);
    setCashWalletConfig({ openingCash: 0, updatedAt: new Date().toISOString() });
    setCategories(DEFAULT_CATEGORIES);
    financialIntegrationService.resetAccounts();
    setConnectedAccounts(financialIntegrationService.getAccounts());
    categorizationService.clearAllLearnedRules();
    setSyncStatus({
      state: 'IDLE',
      lastSyncedAt: null,
      message: 'All financial data cleared.',
    });
  }, []);

  const exportBackupJSON = useCallback((): string => {
    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      recurring,
      categories,
      settings,
      bankAccounts,
      cashWalletConfig,
      connectedAccounts,
      merchantRules: categorizationService.getLearnedRules(),
    };
    return JSON.stringify(data, null, 2);
  }, [transactions, budgets, recurring, categories, settings, bankAccounts, cashWalletConfig, connectedAccounts]);

  const importBackupJSON = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      }
      if (Array.isArray(data.recurring)) {
        setRecurring(data.recurring);
      }
      if (Array.isArray(data.bankAccounts)) {
        setBankAccounts(data.bankAccounts);
      }
      if (data.cashWalletConfig && typeof data.cashWalletConfig === 'object') {
        setCashWalletConfig(data.cashWalletConfig);
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      if (Array.isArray(data.merchantRules)) {
        data.merchantRules.forEach((r: { merchantKey: string; category: string }) => {
          categorizationService.learnMerchantCategory(r.merchantKey, r.category);
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  }, []);

  // --- Dynamic Bank Balances & Stats Calculation ---
  const bankStatsList = useMemo((): BankComputedStats[] => {
    return bankAccounts.map((bank) => {
      const bankTxns = transactions.filter((t) => {
        if (t.bankAccountId === bank.id) return true;
        if (t.account) {
          const accLower = t.account.toLowerCase();
          if (accLower.includes(bank.bankName.toLowerCase())) return true;
          if (bank.nickname && accLower.includes(bank.nickname.toLowerCase())) return true;
        }
        return false;
      });

      const totalIncome = bankTxns
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = bankTxns
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      // Current Balance = Opening Balance + Income - Expense
      const currentBalance = bank.openingBalance + totalIncome - totalExpense;

      return {
        bank,
        currentBalance,
        totalIncome,
        totalExpense,
        transactionCount: bankTxns.length,
      };
    });
  }, [bankAccounts, transactions]);

  // Direct Balance Adjuster: Adjust openingBalance so currentBalance = newBalance
  const updateBankBalance = useCallback((id: string, newBalance: number) => {
    setBankAccounts((prev) =>
      prev.map((bank) => {
        if (bank.id === id) {
          const bankTxns = transactions.filter((t) => {
            if (t.bankAccountId === bank.id) return true;
            if (t.account) {
              const accLower = t.account.toLowerCase();
              if (accLower.includes(bank.bankName.toLowerCase())) return true;
              if (bank.nickname && accLower.includes(bank.nickname.toLowerCase())) return true;
            }
            return false;
          });

          const inc = bankTxns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
          const exp = bankTxns.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

          // newBalance = newOpening + inc - exp => newOpening = newBalance - inc + exp
          const calculatedOpening = newBalance - inc + exp;

          triggerMicroInteraction(
            'BANK_UPDATED',
            'Vault Balance Reconciled',
            `${bank.bankName} updated to ₹${newBalance.toLocaleString('en-IN')}`,
            newBalance,
            '🏦'
          );
          api.updateBankBalance(id, newBalance, 'Manual Balance Adjustment').catch(() => {});

          return {
            ...bank,
            openingBalance: calculatedOpening,
            updatedAt: new Date().toISOString(),
          };
        }
        return bank;
      })
    );
  }, [transactions, triggerMicroInteraction]);

  // Total Available Bank Balance: sum of all current bank balances
  const totalBankBalance = useMemo(() => {
    return bankStatsList.reduce((sum, b) => sum + b.currentBalance, 0);
  }, [bankStatsList]);

  // Cash Balance: Opening Cash + Cash Income - Cash Expense
  const cashBalance = useMemo(() => {
    const cashIncome = transactions
      .filter((t) => t.paymentMethod === 'CASH' && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashExpense = transactions
      .filter((t) => t.paymentMethod === 'CASH' && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return (cashWalletConfig.openingCash || 0) + cashIncome - cashExpense;
  }, [transactions, cashWalletConfig.openingCash]);

  // NET AVAILABLE MONEY = Total Available Bank Balance + Cash Balance
  const netAvailableMoney = useMemo(() => {
    return totalBankBalance + cashBalance;
  }, [totalBankBalance, cashBalance]);

  // --- Dashboard Aggregates ---
  const todayTransactions = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return transactions.filter((t) => {
      const dStr = t.date ? t.date.slice(0, 10) : '';
      return dStr === todayStr;
    });
  }, [transactions]);

  const todayIncome = useMemo(() => {
    return todayTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const todayExpense = useMemo(() => {
    return todayTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const todayBalance = todayIncome - todayExpense;

  const currentMonthTransactions = useMemo(() => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    return transactions.filter((t) => isSameMonth(t.date, curYear, curMonth));
  }, [transactions]);

  const monthIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const monthBalance = monthIncome - monthExpense;

  const onlineUpiSpendingMonth = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'EXPENSE' && t.paymentMethod === 'UPI')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const cardSpendingMonth = useMemo(() => {
    return currentMonthTransactions
      .filter(
        (t) =>
          t.type === 'EXPENSE' &&
          (t.paymentMethod === 'DEBIT_CARD' || t.paymentMethod === 'CREDIT_CARD')
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const bankSpendingMonth = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'EXPENSE' && t.paymentMethod === 'BANK_TRANSFER')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalIncomeAllTime = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenseAllTime = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netWorthAllTime = totalIncomeAllTime - totalExpenseAllTime;

  // Financial Command Center Aggregates
  const commandCenterStats = useMemo((): CommandCenterStats => {
    // 1. Highest Expense Category
    const categoryTotals = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
      });

    let topCat: { category: string; amount: number; percentage: number } | null = null;
    let maxCatAmount = 0;
    categoryTotals.forEach((amt, cat) => {
      if (amt > maxCatAmount) {
        maxCatAmount = amt;
        topCat = {
          category: cat,
          amount: amt,
          percentage: totalExpenseAllTime > 0 ? (amt / totalExpenseAllTime) * 100 : 0,
        };
      }
    });

    // 2. Largest Transaction
    let largestTx: Transaction | null = null;
    transactions.forEach((t) => {
      if (!largestTx || t.amount > largestTx.amount) {
        largestTx = t;
      }
    });

    // 3. Most Used Payment Method
    const methodCounts = new Map<string, number>();
    transactions.forEach((t) => {
      if (t && t.paymentMethod) {
        methodCounts.set(t.paymentMethod, (methodCounts.get(t.paymentMethod) || 0) + 1);
      }
    });
    let topMethod = 'UPI';
    let topCount = 0;
    methodCounts.forEach((cnt, m) => {
      if (m && cnt > topCount) {
        topCount = cnt;
        topMethod = m;
      }
    });

    // 4. Highest Balance Bank
    let highestBank: { name: string; balance: number } | null = null;
    bankStatsList.forEach((bs) => {
      if (bs && bs.bank && (!highestBank || (bs.currentBalance || 0) > highestBank.balance)) {
        highestBank = { name: bs.bank.bankName || 'Primary Vault', balance: bs.currentBalance || 0 };
      }
    });

    return {
      netAvailableMoney,
      totalBanks: bankAccounts.length,
      totalBankBalance,
      cashBalance,
      totalExpenseAllTime,
      totalIncomeAllTime,
      thisMonthExpense: monthExpense,
      thisMonthIncome: monthIncome,
      highestExpenseCategory: topCat,
      largestTransaction: largestTx,
      mostUsedPaymentMethod: topMethod,
      highestBalanceBank: highestBank,
    };
  }, [
    transactions,
    netAvailableMoney,
    bankAccounts.length,
    totalBankBalance,
    cashBalance,
    totalExpenseAllTime,
    totalIncomeAllTime,
    monthExpense,
    monthIncome,
    bankStatsList,
  ]);

  // Budget Status calculation for current month
  const getBudgetStatusList = useCallback((): BudgetStatus[] => {
    return budgets.map((b) => {
      const spent = currentMonthTransactions
        .filter(
          (t) =>
            t.type === 'EXPENSE' &&
            t.category.trim().toLowerCase() === b.category.trim().toLowerCase()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = b.monthlyLimit - spent;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const threshold = settings.budgetAlertThreshold || 80;

      return {
        category: b.category,
        budgetLimit: b.monthlyLimit,
        spent,
        remaining,
        percentage,
        isOverBudget: spent >= b.monthlyLimit,
        isNearLimit: percentage >= threshold && spent < b.monthlyLimit,
      };
    });
  }, [budgets, currentMonthTransactions, settings.budgetAlertThreshold]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        budgets,
        recurring,
        categories,
        settings,
        connectedAccounts,
        syncStatus,

        bankAccounts,
        cashWalletConfig,
        bankStatsList,
        totalBankBalance,
        netAvailableMoney,
        commandCenterStats,

        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        updateBankBalance,
        getBankById,
        updateCashWalletOpening,

        addTransaction,
        addCashTransaction,
        addCashExpense,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        bulkDeleteTransactions,
        getTransactionById,

        triggerSync,
        resolveDuplicateCandidate,
        importExternalPayload,

        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetStatusList,

        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleRecurringActive,
        processRecurringItem,
        dueRecurringCount,

        addCategory,
        deleteCategory,

        updateSettings,
        setGalaxyIntensity,
        toggleReduceMotion,
        setCosmicTheme,
        resetToSampleData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,

        todayIncome,
        todayExpense,
        todayBalance,
        monthIncome,
        monthExpense,
        monthBalance,
        cashBalance,
        onlineUpiSpendingMonth,
        cardSpendingMonth,
        bankSpendingMonth,
        totalIncomeAllTime,
        totalExpenseAllTime,
        netWorthAllTime,

        isAddModalOpen,
        setIsAddModalOpen,
        isAddCashModalOpen,
        setIsAddCashModalOpen,
        isCashExpenseModalOpen,
        setIsCashExpenseModalOpen,
        isAddBankModalOpen,
        setIsAddBankModalOpen,
        editingBank,
        setEditingBank,
        selectedBankDetail,
        setSelectedBankDetail,
        editingTransaction,
        setEditingTransaction,
        selectedTransaction,
        setSelectedTransaction,
        duplicateCandidate,
        setDuplicateCandidate,
        galaxyMode,
        setGalaxyMode,

        // Privacy Masking (OFF by default)
        isMasked,
        toggleMask,

        // Micro-Interactions and Confirmation
        microInteraction,
        triggerMicroInteraction,
        clearMicroInteraction,
        deleteConfirmation,
        requestDeleteTransaction,
        cancelDeleteTransaction,
        confirmDeleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const DEFAULT_FALLBACK_TRANSACTION_CONTEXT: TransactionContextType = {
  transactions: [],
  budgets: [],
  recurring: [],
  categories: DEFAULT_CATEGORIES,
  settings: DEFAULT_SETTINGS,
  connectedAccounts: [],
  syncStatus: {
    state: 'IDLE',
    lastSyncedAt: new Date().toISOString(),
    message: 'Accounts synchronized and up to date.',
  },
  bankAccounts: DEFAULT_BANK_ACCOUNTS,
  cashWalletConfig: DEFAULT_CASH_WALLET,
  bankStatsList: [],
  totalBankBalance: 0,
  netAvailableMoney: 0,
  commandCenterStats: {
    netAvailableMoney: 0,
    totalBanks: 0,
    totalBankBalance: 0,
    cashBalance: 0,
    totalExpenseAllTime: 0,
    totalIncomeAllTime: 0,
    thisMonthExpense: 0,
    thisMonthIncome: 0,
    highestExpenseCategory: null,
    largestTransaction: null,
    mostUsedPaymentMethod: 'UPI',
    highestBalanceBank: null,
  },
  addBankAccount: () => ({} as any),
  updateBankAccount: () => {},
  deleteBankAccount: () => {},
  updateBankBalance: () => {},
  getBankById: () => undefined,
  updateCashWalletOpening: () => {},
  addTransaction: () => ({} as any),
  addCashTransaction: () => ({} as any),
  addCashExpense: () => ({} as any),
  updateTransaction: () => {},
  deleteTransaction: () => {},
  duplicateTransaction: () => null,
  bulkDeleteTransactions: () => {},
  getTransactionById: () => undefined,
  triggerSync: async () => {},
  resolveDuplicateCandidate: () => {},
  importExternalPayload: () => ({ success: false, message: 'Fallback' }),
  addBudget: () => {},
  updateBudget: () => {},
  deleteBudget: () => {},
  getBudgetStatusList: () => [],
  addRecurring: () => {},
  updateRecurring: () => {},
  deleteRecurring: () => {},
  toggleRecurringActive: () => {},
  processRecurringItem: () => {},
  dueRecurringCount: 0,
  addCategory: () => {},
  deleteCategory: () => {},
  isMasked: false,
  toggleMask: () => {},
  updateSettings: () => {},
  setGalaxyIntensity: () => {},
  toggleReduceMotion: () => {},
  setCosmicTheme: () => {},
  resetToSampleData: () => {},
  clearAllData: () => {},
  exportBackupJSON: () => '',
  importBackupJSON: () => false,
  todayIncome: 0,
  todayExpense: 0,
  todayBalance: 0,
  monthIncome: 0,
  monthExpense: 0,
  monthBalance: 0,
  cashBalance: 0,
  onlineUpiSpendingMonth: 0,
  cardSpendingMonth: 0,
  bankSpendingMonth: 0,
  totalIncomeAllTime: 0,
  totalExpenseAllTime: 0,
  netWorthAllTime: 0,
  isAddModalOpen: false,
  setIsAddModalOpen: () => {},
  isAddCashModalOpen: false,
  setIsAddCashModalOpen: () => {},
  isCashExpenseModalOpen: false,
  setIsCashExpenseModalOpen: () => {},
  isAddBankModalOpen: false,
  setIsAddBankModalOpen: () => {},
  editingBank: null,
  setEditingBank: () => {},
  selectedBankDetail: null,
  setSelectedBankDetail: () => {},
  editingTransaction: null,
  setEditingTransaction: () => {},
  selectedTransaction: null,
  setSelectedTransaction: () => {},
  duplicateCandidate: null,
  setDuplicateCandidate: () => {},
  galaxyMode: 'accounts',
  setGalaxyMode: () => {},
  microInteraction: null,
  triggerMicroInteraction: () => {},
  clearMicroInteraction: () => {},
  deleteConfirmation: {
    isOpen: false,
    title: '',
    message: '',
  },
  requestDeleteTransaction: () => {},
  cancelDeleteTransaction: () => {},
  confirmDeleteTransaction: () => {},
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Galaxy Finance]: useTransactions invoked outside TransactionProvider. Providing safe fallback context.');
    }
    return DEFAULT_FALLBACK_TRANSACTION_CONTEXT;
  }
  return context;
};
