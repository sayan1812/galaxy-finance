import type { Transaction, Budget, RecurringTransaction, BankAccount, CashWalletConfig } from '../types';

export const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-hdfc',
    bankName: 'HDFC Bank',
    accountType: 'Savings',
    nickname: 'Primary Salary Account',
    openingBalance: 35000,
    accountNumberMasked: 'XXXX XXXX 4521',
    color: '#38bdf8',
    planetColor: '#38bdf8',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bank-sbi',
    bankName: 'SBI',
    accountType: 'Savings',
    nickname: 'Emergency & Savings Account',
    openingBalance: 42500,
    accountNumberMasked: 'XXXX XXXX 8912',
    color: '#34d399',
    planetColor: '#34d399',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bank-icici',
    bankName: 'ICICI Bank',
    accountType: 'Savings',
    nickname: 'Daily Spends & Cards',
    openingBalance: 18000,
    accountNumberMasked: 'XXXX XXXX 3390',
    color: '#fbbf24',
    planetColor: '#fbbf24',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CASH_WALLET: CashWalletConfig = {
  openingCash: 7000,
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
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Helper to generate dates relative to today
  const getRelativeDateParts = (daysAgo: number, hours: number = 12, minutes: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);

    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(hours)}:${pad(minutes)}`;
    const iso = d.toISOString();
    return { date: dateStr, time: timeStr, iso };
  };

  const t0_1 = getRelativeDateParts(0, 20, 15);
  const t0_2 = getRelativeDateParts(0, 17, 30);
  const t0_3 = getRelativeDateParts(0, 14, 0);
  const t0_4 = getRelativeDateParts(0, 9, 45);

  const t1_1 = getRelativeDateParts(1, 18, 20);
  const t1_2 = getRelativeDateParts(1, 11, 10);
  const t1_3 = getRelativeDateParts(1, 16, 40);

  const t2_1 = getRelativeDateParts(2, 13, 15);
  const t2_2 = getRelativeDateParts(2, 21, 30);

  const t3_1 = getRelativeDateParts(3, 8, 0);
  const t3_2 = getRelativeDateParts(3, 21, 0);

  const t4_1 = getRelativeDateParts(4, 10, 0);
  const t4_2 = getRelativeDateParts(4, 11, 30);
  const t4_3 = getRelativeDateParts(4, 15, 0);

  const t5_1 = getRelativeDateParts(5, 14, 25);
  const t6_1 = getRelativeDateParts(6, 16, 10);
  const t7_1 = getRelativeDateParts(7, 19, 0);
  const t8_1 = getRelativeDateParts(8, 9, 0);

  const transactions: Transaction[] = [
    // Today's Transactions
    {
      id: 'tx-1',
      type: 'EXPENSE',
      amount: 350,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Food & Restaurant',
      merchant: 'XYZ Restaurant',
      description: 'Dinner with friends',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428901849102',
      date: t0_1.date,
      time: t0_1.time,
      createdAt: t0_1.iso,
      updatedAt: t0_1.iso,
    },
    {
      id: 'tx-2',
      type: 'EXPENSE',
      amount: 60,
      currency: 'INR',
      paymentMethod: 'CASH',
      source: 'MANUAL',
      category: 'Food & Restaurant',
      merchant: 'Sharma Chai & Snacks',
      description: 'Evening tea and samosa',
      account: 'Physical Cash Wallet',
      date: t0_2.date,
      time: t0_2.time,
      createdAt: t0_2.iso,
      updatedAt: t0_2.iso,
    },
    {
      id: 'tx-3',
      type: 'INCOME',
      amount: 4500,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Freelance/Business',
      merchant: 'Apex Design Client',
      description: 'Logo & brand guideline milestone payment',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428900412894',
      date: t0_3.date,
      time: t0_3.time,
      createdAt: t0_3.iso,
      updatedAt: t0_3.iso,
    },
    {
      id: 'tx-4',
      type: 'EXPENSE',
      amount: 140,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Transportation',
      merchant: 'Uber Auto',
      description: 'Ride to office',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428899812738',
      date: t0_4.date,
      time: t0_4.time,
      createdAt: t0_4.iso,
      updatedAt: t0_4.iso,
    },

    // Yesterday's Transactions
    {
      id: 'tx-5',
      type: 'EXPENSE',
      amount: 1850,
      currency: 'INR',
      paymentMethod: 'CREDIT_CARD',
      source: 'AUTOMATIC',
      category: 'Grocery',
      merchant: 'Nature Basket Supermarket',
      description: 'Weekly grocery, fruits & organic veggies',
      account: 'ICICI Coral Card (•••• 9021)',
      transactionReference: 'TXN-CC-882194',
      date: t1_1.date,
      time: t1_1.time,
      createdAt: t1_1.iso,
      updatedAt: t1_1.iso,
    },
    {
      id: 'tx-6',
      type: 'EXPENSE',
      amount: 2200,
      currency: 'INR',
      paymentMethod: 'CREDIT_CARD',
      source: 'AUTOMATIC',
      category: 'Fuel',
      merchant: 'Shell Petrol Pump',
      description: 'Full tank petrol for car',
      account: 'ICICI Coral Card (•••• 9021)',
      transactionReference: 'TXN-CC-881923',
      date: t1_2.date,
      time: t1_2.time,
      createdAt: t1_2.iso,
      updatedAt: t1_2.iso,
    },
    {
      id: 'tx-7',
      type: 'EXPENSE',
      amount: 420,
      currency: 'INR',
      paymentMethod: 'CASH',
      source: 'MANUAL',
      category: 'Medical/Healthcare',
      merchant: 'Apollo Pharmacy',
      description: 'Vitamins and pain relief spray',
      account: 'Physical Cash Wallet',
      date: t1_3.date,
      time: t1_3.time,
      createdAt: t1_3.iso,
      updatedAt: t1_3.iso,
    },

    // 2 Days Ago
    {
      id: 'tx-8a',
      type: 'EXPENSE',
      amount: 250,
      currency: 'INR',
      paymentMethod: 'CASH',
      source: 'MANUAL',
      category: 'Food & Restaurant',
      merchant: 'Corner Bakery',
      description: 'Sandwich & coffee lunch',
      account: 'Physical Cash Wallet',
      date: t2_1.date,
      time: t2_1.time,
      createdAt: t2_1.iso,
      updatedAt: t2_1.iso,
    },
    {
      id: 'tx-8b',
      type: 'EXPENSE',
      amount: 980,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Shopping',
      merchant: 'Zara India',
      description: 'Casual cotton t-shirt',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428710928341',
      date: t2_2.date,
      time: t2_2.time,
      createdAt: t2_2.iso,
      updatedAt: t2_2.iso,
    },

    // 3 Days Ago
    {
      id: 'tx-8',
      type: 'EXPENSE',
      amount: 649,
      currency: 'INR',
      paymentMethod: 'DEBIT_CARD',
      source: 'AUTOMATIC',
      category: 'Subscription',
      merchant: 'Netflix India',
      description: 'Monthly 4K Family plan subscription',
      account: 'HDFC Salary A/c (•••• 4821)',
      transactionReference: 'DB-AUTOPAY-44102',
      isRecurring: true,
      recurringScheduleId: 'rec-2',
      date: t3_1.date,
      time: t3_1.time,
      createdAt: t3_1.iso,
      updatedAt: t3_1.iso,
    },
    {
      id: 'tx-9',
      type: 'EXPENSE',
      amount: 850,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Entertainment',
      merchant: 'BookMyShow / PVR',
      description: '2 movie tickets & popcorn combo',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428612984129',
      date: t3_2.date,
      time: t3_2.time,
      createdAt: t3_2.iso,
      updatedAt: t3_2.iso,
    },

    // 4 Days Ago
    {
      id: 'tx-10',
      type: 'INCOME',
      amount: 85000,
      currency: 'INR',
      paymentMethod: 'BANK_TRANSFER',
      source: 'AUTOMATIC',
      category: 'Salary',
      merchant: 'Tech Innovations Corp',
      description: 'Monthly salary credited for the month',
      account: 'HDFC Salary A/c (•••• 4821)',
      transactionReference: 'NEFT/HDFC/20261001002',
      isRecurring: true,
      recurringScheduleId: 'rec-1',
      date: t4_1.date,
      time: t4_1.time,
      createdAt: t4_1.iso,
      updatedAt: t4_1.iso,
    },
    {
      id: 'tx-11',
      type: 'EXPENSE',
      amount: 22000,
      currency: 'INR',
      paymentMethod: 'BANK_TRANSFER',
      source: 'AUTOMATIC',
      category: 'Rent',
      merchant: 'Landlord - Mr. Gupta',
      description: 'Monthly flat rent transfer',
      account: 'HDFC Salary A/c (•••• 4821)',
      transactionReference: 'IMPS/98123491029',
      isRecurring: true,
      recurringScheduleId: 'rec-3',
      date: t4_2.date,
      time: t4_2.time,
      createdAt: t4_2.iso,
      updatedAt: t4_2.iso,
    },
    {
      id: 'tx-12',
      type: 'EXPENSE',
      amount: 1180,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Mobile/Internet',
      merchant: 'Airtel Fiber Broadband',
      description: 'Monthly 200Mbps unlimited fiber plan',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428412093847',
      isRecurring: true,
      recurringScheduleId: 'rec-4',
      date: t4_3.date,
      time: t4_3.time,
      createdAt: t4_3.iso,
      updatedAt: t4_3.iso,
    },

    // 5 Days Ago
    {
      id: 'tx-13',
      type: 'EXPENSE',
      amount: 2499,
      currency: 'INR',
      paymentMethod: 'CREDIT_CARD',
      source: 'AUTOMATIC',
      category: 'Shopping',
      merchant: 'Amazon India',
      description: 'Ergonomic wireless keyboard & mouse pad',
      account: 'ICICI Coral Card (•••• 9021)',
      transactionReference: 'TXN-CC-880912',
      date: t5_1.date,
      time: t5_1.time,
      createdAt: t5_1.iso,
      updatedAt: t5_1.iso,
    },

    // 6 Days Ago
    {
      id: 'tx-14',
      type: 'EXPENSE',
      amount: 3200,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Bills & Utilities',
      merchant: 'State Electricity Board',
      description: 'Electricity bill payment for previous month',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428210984920',
      date: t6_1.date,
      time: t6_1.time,
      createdAt: t6_1.iso,
      updatedAt: t6_1.iso,
    },

    // 7 Days Ago
    {
      id: 'tx-15',
      type: 'INCOME',
      amount: 5000,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category: 'Gift',
      merchant: 'Uncle Rajesh',
      description: 'Festival greeting gift',
      account: 'SBI UPI (user@okhdfcbank)',
      transactionReference: 'UPI/428198273910',
      date: t7_1.date,
      time: t7_1.time,
      createdAt: t7_1.iso,
      updatedAt: t7_1.iso,
    },

    // 8 Days Ago
    {
      id: 'tx-16',
      type: 'EXPENSE',
      amount: 5000,
      currency: 'INR',
      paymentMethod: 'BANK_TRANSFER',
      source: 'AUTOMATIC',
      category: 'Investment',
      merchant: 'Zerodha Mutual Fund SIP',
      description: 'Monthly Index Fund SIP',
      account: 'HDFC Salary A/c (•••• 4821)',
      transactionReference: 'ACH/ZERODHA/99120',
      isRecurring: true,
      date: t8_1.date,
      time: t8_1.time,
      createdAt: t8_1.iso,
      updatedAt: t8_1.iso,
    },
  ];

  const budgets: Budget[] = [
    { id: 'b-1', category: 'Food & Restaurant', monthlyLimit: 6000 },
    { id: 'b-2', category: 'Grocery', monthlyLimit: 7500 },
    { id: 'b-3', category: 'Fuel', monthlyLimit: 3000 },
    { id: 'b-4', category: 'Shopping', monthlyLimit: 4000 },
    { id: 'b-5', category: 'Entertainment', monthlyLimit: 2000 },
    { id: 'b-6', category: 'Mobile/Internet', monthlyLimit: 1500 },
  ];

  const recurring: RecurringTransaction[] = [
    {
      id: 'rec-1',
      title: 'Monthly Salary',
      type: 'INCOME',
      amount: 85000,
      paymentMethod: 'BANK_TRANSFER',
      category: 'Salary',
      frequency: 'monthly',
      startDate: t4_1.date,
      nextDueDate: getRelativeDateParts(-26).date,
      isActive: true,
      merchant: 'Tech Innovations Corp',
      description: 'Monthly direct salary transfer',
      account: 'HDFC Salary A/c (•••• 4821)',
    },
    {
      id: 'rec-2',
      title: 'Netflix 4K Subscription',
      type: 'EXPENSE',
      amount: 649,
      paymentMethod: 'DEBIT_CARD',
      category: 'Subscription',
      frequency: 'monthly',
      startDate: t3_1.date,
      nextDueDate: getRelativeDateParts(-27).date,
      isActive: true,
      merchant: 'Netflix',
      description: 'Family 4K plan',
      account: 'HDFC Salary A/c (•••• 4821)',
    },
    {
      id: 'rec-3',
      title: 'Apartment Rent',
      type: 'EXPENSE',
      amount: 22000,
      paymentMethod: 'BANK_TRANSFER',
      category: 'Rent',
      frequency: 'monthly',
      startDate: t4_2.date,
      nextDueDate: getRelativeDateParts(-26).date,
      isActive: true,
      merchant: 'Mr. Gupta (Landlord)',
      description: 'Monthly house rent',
      account: 'HDFC Salary A/c (•••• 4821)',
    },
    {
      id: 'rec-4',
      title: 'Airtel Fiber Broadband',
      type: 'EXPENSE',
      amount: 1180,
      paymentMethod: 'UPI',
      category: 'Mobile/Internet',
      frequency: 'monthly',
      startDate: t4_3.date,
      nextDueDate: getRelativeDateParts(-26).date,
      isActive: true,
      merchant: 'Airtel',
      description: 'Home high-speed internet',
      account: 'SBI UPI (user@okhdfcbank)',
      bankAccountId: 'bank-sbi',
    },
  ];

  // Auto-link bankAccountId to sample transactions
  transactions.forEach((t) => {
    if (t.account?.includes('HDFC')) {
      t.bankAccountId = 'bank-hdfc';
    } else if (t.account?.includes('SBI')) {
      t.bankAccountId = 'bank-sbi';
    } else if (t.account?.includes('ICICI')) {
      t.bankAccountId = 'bank-icici';
    }
  });

  return {
    transactions,
    budgets,
    recurring,
    bankAccounts: DEFAULT_BANK_ACCOUNTS,
    cashWalletConfig: DEFAULT_CASH_WALLET,
  };
}
