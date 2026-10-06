export type ThemeMode = 'light' | 'dark' | 'galaxy' | 'system';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Debit Card' 
  | 'Credit Card' 
  | 'Bank Transfer' 
  | 'Other';

export type TransactionSource = 'Manual' | 'Automatic';

export interface Transaction {
  id: string;
  localId?: string;
  userId?: string;
  bankId?: string | null;
  bankName?: string;
  bankNickname?: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  source: TransactionSource;
  merchant?: string;
  description?: string;
  date: string;
  time: string;
  transactionReference?: string;
  createdAt?: string;
  updatedAt?: string;
  isPendingSync?: boolean;
}

export interface BankAccount {
  id: string;
  userId?: string;
  bankName: string;
  accountType: string;
  nickname?: string;
  maskedAccountNumber?: string;
  openingBalance: number;
  balance: number;
  planetColor?: string;
  transactionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAdjustment {
  id: string;
  bankId: string;
  previousBalance: number;
  newBalance: number;
  adjustmentAmount: number;
  reason: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  remaining?: number;
  percentage?: number;
  month: number;
  year: number;
}

export interface FinancialOverview {
  netAvailableMoney: number;
  totalBankBalance: number;
  cashBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  theme?: ThemeMode;
  currency?: string;
  notifications?: boolean;
  reduceMotion?: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  requiresConfirmation?: boolean;
  pendingAction?: {
    actionType: 'delete_transaction' | 'delete_bank' | 'update_balance';
    targetId: string;
    description: string;
    details?: any;
  } | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'transaction' | 'budget' | 'security' | 'sync';
  data?: any;
  read: boolean;
  createdAt: string;
}

export type SyncState = 'online' | 'offline' | 'syncing' | 'synced' | 'error';
