import type { ConnectedAccount, Transaction, PaymentMethod } from '../types';

const ACCOUNTS_STORAGE_KEY = 'rupeewise_connected_accounts_v1';

export const DEFAULT_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc-hdfc',
    name: 'HDFC Salary A/c',
    institution: 'HDFC Bank',
    type: 'BANK_ACCOUNT',
    accountMask: '•••• 4821',
    balance: 74500,
    currency: 'INR',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'CONNECTED',
    provider: 'MOCK_FEED',
    isAutoSyncEnabled: true,
  },
  {
    id: 'acc-sbi-upi',
    name: 'SBI UPI Handles',
    institution: 'State Bank of India',
    type: 'UPI',
    accountMask: 'user@okhdfcbank',
    balance: 12450,
    currency: 'INR',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'CONNECTED',
    provider: 'MOCK_FEED',
    isAutoSyncEnabled: true,
  },
  {
    id: 'acc-icici-cc',
    name: 'ICICI Coral Card',
    institution: 'ICICI Bank',
    type: 'CREDIT_CARD',
    accountMask: '•••• 9021',
    balance: -18320,
    currency: 'INR',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'CONNECTED',
    provider: 'MOCK_FEED',
    isAutoSyncEnabled: true,
  },
  {
    id: 'acc-cash',
    name: 'Physical Cash Wallet',
    institution: 'RupeeWise Cash Reserve',
    type: 'WALLET',
    accountMask: 'Cash Drawer',
    balance: 4200,
    currency: 'INR',
    lastSyncedAt: new Date().toISOString(),
    status: 'CONNECTED',
    provider: 'MOCK_FEED',
    isAutoSyncEnabled: false,
  },
];

// Pool of realistic transaction templates to simulate incoming online feeds
interface FeedTemplate {
  merchant: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  paymentMethod: PaymentMethod;
  account: string;
  minAmount: number;
  maxAmount: number;
  descriptionTemplate: string;
  refPrefix: string;
}

const FEED_TEMPLATES: FeedTemplate[] = [
  {
    merchant: 'Swiggy',
    category: 'Food & Restaurant',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    account: 'SBI UPI (user@okhdfcbank)',
    minAmount: 180,
    maxAmount: 650,
    descriptionTemplate: 'Food order from local restaurant',
    refPrefix: 'UPI/SWG',
  },
  {
    merchant: 'Uber India',
    category: 'Transportation',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    account: 'SBI UPI (user@okhdfcbank)',
    minAmount: 90,
    maxAmount: 420,
    descriptionTemplate: 'Cab ride commute',
    refPrefix: 'UPI/UBR',
  },
  {
    merchant: 'Amazon India',
    category: 'Shopping',
    type: 'EXPENSE',
    paymentMethod: 'CREDIT_CARD',
    account: 'ICICI Coral Card (•••• 9021)',
    minAmount: 499,
    maxAmount: 3499,
    descriptionTemplate: 'Electronics & household essentials',
    refPrefix: 'CARD/AMZN',
  },
  {
    merchant: 'Apollo Pharmacy',
    category: 'Medical/Healthcare',
    type: 'EXPENSE',
    paymentMethod: 'DEBIT_CARD',
    account: 'HDFC Salary A/c (•••• 4821)',
    minAmount: 140,
    maxAmount: 890,
    descriptionTemplate: 'Prescription medicines & vitamins',
    refPrefix: 'POS/APL',
  },
  {
    merchant: 'Shell Petrol Pump',
    category: 'Fuel',
    type: 'EXPENSE',
    paymentMethod: 'DEBIT_CARD',
    account: 'HDFC Salary A/c (•••• 4821)',
    minAmount: 300,
    maxAmount: 1800,
    descriptionTemplate: 'Vehicle fuel top-up',
    refPrefix: 'POS/SHL',
  },
  {
    merchant: 'Blinkit Instant',
    category: 'Grocery',
    type: 'EXPENSE',
    paymentMethod: 'UPI',
    account: 'SBI UPI (user@okhdfcbank)',
    minAmount: 220,
    maxAmount: 1250,
    descriptionTemplate: 'Fresh dairy and fruits',
    refPrefix: 'UPI/BLK',
  },
  {
    merchant: 'Netflix Entertainment',
    category: 'Subscription',
    type: 'EXPENSE',
    paymentMethod: 'CREDIT_CARD',
    account: 'ICICI Coral Card (•••• 9021)',
    minAmount: 649,
    maxAmount: 649,
    descriptionTemplate: 'Monthly 4K streaming plan',
    refPrefix: 'CARD/NTFLX',
  },
  {
    merchant: 'Tata Power Electricity',
    category: 'Bills & Utilities',
    type: 'EXPENSE',
    paymentMethod: 'BANK_TRANSFER',
    account: 'HDFC Salary A/c (•••• 4821)',
    minAmount: 1200,
    maxAmount: 2800,
    descriptionTemplate: 'Monthly domestic electricity bill',
    refPrefix: 'NEFT/TATA',
  },
  {
    merchant: 'Acme Corp Payroll',
    category: 'Salary',
    type: 'INCOME',
    paymentMethod: 'BANK_TRANSFER',
    account: 'HDFC Salary A/c (•••• 4821)',
    minAmount: 85000,
    maxAmount: 85000,
    descriptionTemplate: 'Monthly net salary credit',
    refPrefix: 'NEFT/SAL',
  },
  {
    merchant: 'Upwork Global Inc',
    category: 'Freelance/Business',
    type: 'INCOME',
    paymentMethod: 'BANK_TRANSFER',
    account: 'HDFC Salary A/c (•••• 4821)',
    minAmount: 12500,
    maxAmount: 45000,
    descriptionTemplate: 'Client consulting disbursement',
    refPrefix: 'WIRE/UPW',
  },
];

class FinancialIntegrationService {
  private accounts: ConnectedAccount[] = [];

  constructor() {
    this.loadAccounts();
  }

  public getAccounts(): ConnectedAccount[] {
    return [...this.accounts];
  }

  private loadAccounts(): void {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        this.accounts = JSON.parse(stored);
        return;
      }
    } catch (e) {
      console.warn('Failed to load connected accounts from storage:', e);
    }
    this.accounts = [...DEFAULT_CONNECTED_ACCOUNTS];
    this.persistAccounts();
  }

  private persistAccounts(): void {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
    } catch (e) {
      console.error('Failed to persist connected accounts:', e);
    }
  }

  public updateAccount(id: string, updates: Partial<ConnectedAccount>): void {
    this.accounts = this.accounts.map((acc) =>
      acc.id === id ? { ...acc, ...updates } : acc
    );
    this.persistAccounts();
  }

  public resetAccounts(): void {
    this.accounts = [...DEFAULT_CONNECTED_ACCOUNTS];
    this.persistAccounts();
  }

  /**
   * Generates a realistic mock incoming online transaction from connected financial feeds
   */
  public generateMockOnlineTransaction(templateIndex?: number): Partial<Transaction> {
    const template =
      templateIndex !== undefined && FEED_TEMPLATES[templateIndex]
        ? FEED_TEMPLATES[templateIndex]
        : FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const randomRange = template.maxAmount - template.minAmount;
    const amount = Math.round(template.minAmount + (randomRange > 0 ? Math.random() * randomRange : 0));
    const randomRef = `${template.refPrefix}${Math.floor(100000000 + Math.random() * 900000000)}`;

    return {
      type: template.type,
      amount,
      currency: 'INR',
      category: template.category,
      paymentMethod: template.paymentMethod,
      source: 'AUTOMATIC',
      merchant: template.merchant,
      description: template.descriptionTemplate,
      date: dateStr,
      time: timeStr,
      account: template.account,
      transactionReference: randomRef,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Generates an intentional duplicate candidate based on an existing transaction
   * to test the duplicate detection prompt.
   */
  public generateDuplicateCandidate(existing: Transaction): Partial<Transaction> {
    return {
      type: existing.type,
      amount: existing.amount,
      currency: existing.currency,
      category: existing.category,
      paymentMethod: existing.paymentMethod,
      source: 'AUTOMATIC',
      merchant: existing.merchant,
      description: existing.description ? `${existing.description} (Imported duplicate)` : 'Duplicate feed item',
      date: existing.date,
      time: existing.time,
      account: existing.account,
      transactionReference: existing.transactionReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const financialIntegrationService = new FinancialIntegrationService();
