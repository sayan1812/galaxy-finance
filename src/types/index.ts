export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 
  | 'CASH' 
  | 'UPI' 
  | 'DEBIT_CARD' 
  | 'CREDIT_CARD' 
  | 'BANK_TRANSFER' 
  | 'OTHER';

export type TransactionSource = 'MANUAL' | 'AUTOMATIC';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'BOTH';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type BankAccountType = 'Savings' | 'Current' | 'Salary' | 'Other';

export interface BankAccount {
  id: string;
  bankName: string; // 'HDFC Bank' | 'SBI' | 'ICICI Bank' | 'Axis Bank' | 'Kotak' | 'Other'
  accountType: BankAccountType;
  nickname: string; // e.g. "My Salary Account"
  openingBalance: number;
  accountNumberMasked: string; // e.g. "XXXX XXXX 4521"
  color?: string; // hex color for badges
  planetColor?: string; // color for 3D sphere
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankComputedStats {
  bank: BankAccount;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
}

export interface CashWalletConfig {
  openingCash: number;
  notes?: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string; // e.g. 'INR'
  category: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  source: TransactionSource;
  merchant?: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or HH:mm:ss
  account?: string; // e.g. "HDFC Bank (•••• 4821)", "ICICI UPI", "Cash Wallet"
  bankAccountId?: string; // links directly to BankAccount
  transactionReference?: string;
  isRecurring?: boolean;
  recurringScheduleId?: string;
  isDuplicate?: boolean;
  duplicateResolved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  lastProcessedDate?: string;
  isActive: boolean;
  merchant?: string;
  description?: string;
  account?: string;
  bankAccountId?: string;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  institution: string;
  type: 'BANK_ACCOUNT' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'WALLET';
  accountMask: string; // e.g. "•••• 4821"
  balance: number;
  currency: string;
  lastSyncedAt?: string;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED';
  provider: 'MOCK_FEED' | 'WEBHOOK_API' | 'OPEN_BANKING';
  isAutoSyncEnabled: boolean;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  existingTransaction?: Transaction;
  reason?: string;
  confidence: number; // 0 - 100
}

export interface MerchantCategoryMapping {
  merchantKey: string;
  category: string;
  learnedAt: string;
  userOverridden: boolean;
}

export interface SyncStatus {
  state: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'NO_NEW' | 'DUPLICATE_DETECTED' | 'FAILED' | 'CONNECTION_REQUIRED';
  lastSyncedAt: string | null;
  message?: string;
  importedCount?: number;
  duplicateCandidate?: Transaction | null;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export type GalaxyIntensity = 'low' | 'medium' | 'high';
export type CosmicTheme = 'nebula-deep' | 'starlight-cyan' | 'solar-gold' | 'void-dark';

export type ThemeMode = 'light';

export interface AppSettings {
  currency: CurrencyConfig;
  theme: ThemeMode;
  galaxyIntensity: GalaxyIntensity;
  reduceMotion: boolean;
  cosmicTheme: CosmicTheme;
  enableBudgetAlerts: boolean;
  budgetAlertThreshold: number; // default 80
  soundFeedback: boolean;
  autoSyncIntervalMinutes: number; // e.g. 15
  demoModeEnabled: boolean;
  enableDuplicateAutoPrompt: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface BankAdjustment {
  id: string;
  bankId: string;
  userId: string;
  previousBalance: number;
  newBalance: number;
  adjustmentAmount: number;
  reason: string;
  createdAt: string;
}

export type MicroInteractionType =
  | 'TRANSACTION_ADDED'
  | 'BUDGET_MET'
  | 'SAVINGS_GOAL'
  | 'BANK_UPDATED'
  | 'TRANSACTION_DELETED'
  | 'LOGIN_SUCCESS'
  | 'SETTINGS_SAVED';

export interface MicroInteractionEvent {
  id: string;
  type: MicroInteractionType;
  title: string;
  message?: string;
  amount?: number;
  emoji?: string;
}

export interface AiPendingAction {
  id: string;
  actionType: 'DELETE_TRANSACTION' | 'UPDATE_BANK_BALANCE' | 'DELETE_BANK';
  targetId: string;
  description: string;
  summary?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  requiresConfirmation?: boolean;
  pendingAction?: AiPendingAction;
}

export type TimeRangeFilter = 
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'amount_desc' 
  | 'amount_asc';
