import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'rupeewise.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high performance and integrity
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS banks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bank_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      nickname TEXT,
      masked_account_number TEXT,
      opening_balance REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      planet_color TEXT DEFAULT '#38bdf8',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_adjustments (
      id TEXT PRIMARY KEY,
      bank_id TEXT NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      previous_balance REAL NOT NULL,
      new_balance REAL NOT NULL,
      adjustment_amount REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bank_id TEXT REFERENCES banks(id) ON DELETE SET NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'income' | 'expense'
      category TEXT NOT NULL,
      subcategory TEXT,
      payment_method TEXT NOT NULL,
      source TEXT NOT NULL, -- 'Manual' | 'Automatic'
      merchant TEXT,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      transaction_reference TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT DEFAULT 'light',
      currency TEXT DEFAULT '₹',
      notifications INTEGER DEFAULT 1,
      reduce_motion INTEGER DEFAULT 0,
      galaxy_intensity TEXT DEFAULT 'medium',
      opening_cash REAL DEFAULT 7000,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'email' | 'phone' | 'forgot_password'
      token_hash TEXT NOT NULL,
      target TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 5,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      platform TEXT DEFAULT 'mobile',
      enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT DEFAULT 'general', -- 'transaction' | 'budget' | 'security' | 'sync'
      data TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_banks_user ON banks(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
  `);

  seedDefaultUser();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function seedDefaultUser() {
  const defaultEmail = 'demo@rupeewise.com';
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultEmail);

  if (existingUser) return;

  const now = new Date().toISOString();
  const userId = 'usr_demo_001';
  const passwordHash = hashPassword('Password123!');

  db.prepare(`
    INSERT INTO users (id, name, email, phone, email_verified, phone_verified, password_hash, created_at, updated_at, last_login_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'Aarav Sharma',
    defaultEmail,
    '+91 98765 43210',
    1,
    1,
    passwordHash,
    now,
    now,
    now
  );

  // Settings
  db.prepare(`
    INSERT INTO user_settings (user_id, theme, currency, notifications, reduce_motion, galaxy_intensity, opening_cash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 'light', '₹', 1, 0, 'medium', 7000, now, now);

  // Default Banks matching requirement:
  // HDFC (₹35,000), SBI (₹42,500), ICICI (₹18,000) -> Total = ₹95,500
  const banks = [
    {
      id: 'bnk_hdfc_01',
      bankName: 'HDFC Bank',
      accountType: 'Salary',
      nickname: 'Primary Salary Vault',
      maskedAccountNumber: 'XXXX XXXX 4521',
      balance: 35000,
      openingBalance: 35000,
      planetColor: '#0ea5e9'
    },
    {
      id: 'bnk_sbi_02',
      bankName: 'SBI',
      accountType: 'Savings',
      nickname: 'Main Savings Reserve',
      maskedAccountNumber: 'XXXX XXXX 8912',
      balance: 42500,
      openingBalance: 42500,
      planetColor: '#6366f1'
    },
    {
      id: 'bnk_icici_03',
      bankName: 'ICICI Bank',
      accountType: 'Savings',
      nickname: 'Emergency Vault',
      maskedAccountNumber: 'XXXX XXXX 1045',
      balance: 18000,
      openingBalance: 18000,
      planetColor: '#f97316'
    }
  ];

  const insertBank = db.prepare(`
    INSERT INTO banks (id, user_id, bank_name, account_type, nickname, masked_account_number, opening_balance, balance, planet_color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of banks) {
    insertBank.run(
      b.id,
      userId,
      b.bankName,
      b.accountType,
      b.nickname,
      b.maskedAccountNumber,
      b.openingBalance,
      b.balance,
      b.planetColor,
      now,
      now
    );
  }

  // Seed sample transactions
  const sampleTransactions = [
    {
      id: 'tx_demo_01',
      bankId: 'bnk_hdfc_01',
      amount: 85000,
      type: 'income',
      category: 'Salary',
      subcategory: 'Tech Corp Monthly',
      paymentMethod: 'Bank Transfer',
      source: 'Automatic',
      merchant: 'Infotech Global Ltd',
      description: 'Monthly payroll deposit',
      date: '2026-10-01',
      time: '09:30',
      transactionReference: 'NEFT-8934120987'
    },
    {
      id: 'tx_demo_02',
      bankId: 'bnk_hdfc_01',
      amount: 22000,
      type: 'expense',
      category: 'Rent',
      subcategory: 'Apartment',
      paymentMethod: 'Bank Transfer',
      source: 'Manual',
      merchant: 'Green Heights Realty',
      description: 'October rent payment',
      date: '2026-10-02',
      time: '11:00',
      transactionReference: 'IMPS-992147'
    },
    {
      id: 'tx_demo_03',
      bankId: 'bnk_hdfc_01',
      amount: 350,
      type: 'expense',
      category: 'Food & Restaurant',
      subcategory: 'Dining',
      paymentMethod: 'UPI',
      source: 'Automatic',
      merchant: 'Swiggy',
      description: 'Lunch bowl delivery',
      date: '2026-10-05',
      time: '13:20',
      transactionReference: 'UPI-SWIG-4491'
    },
    {
      id: 'tx_demo_04',
      bankId: null, // Cash
      amount: 250,
      type: 'expense',
      category: 'Food & Restaurant',
      subcategory: 'Lunch',
      paymentMethod: 'Cash',
      source: 'Manual',
      merchant: 'Corner Cafe',
      description: 'Afternoon coffee and sandwich',
      date: '2026-10-05',
      time: '15:45',
      transactionReference: null
    },
    {
      id: 'tx_demo_05',
      bankId: 'bnk_sbi_02',
      amount: 4200,
      type: 'expense',
      category: 'Grocery',
      subcategory: 'Provisions',
      paymentMethod: 'Debit Card',
      source: 'Automatic',
      merchant: 'Reliance Smart Superstore',
      description: 'Monthly pantry restock',
      date: '2026-10-03',
      time: '18:10',
      transactionReference: 'POS-TX-98441'
    },
    {
      id: 'tx_demo_06',
      bankId: 'bnk_icici_03',
      amount: 499,
      type: 'expense',
      category: 'Subscription',
      subcategory: 'Streaming',
      paymentMethod: 'Credit Card',
      source: 'Automatic',
      merchant: 'Netflix Entertainment',
      description: 'Premium 4K plan',
      date: '2026-10-04',
      time: '08:00',
      transactionReference: 'SUB-NETFLIX-901'
    },
    {
      id: 'tx_demo_07',
      bankId: null, // Cash
      amount: 60,
      type: 'expense',
      category: 'Transportation',
      subcategory: 'Auto Rickshaw',
      paymentMethod: 'Cash',
      source: 'Manual',
      merchant: 'Auto Driver',
      description: 'Commute to metro station',
      date: '2026-10-05',
      time: '17:30',
      transactionReference: null
    },
    {
      id: 'tx_demo_08',
      bankId: 'bnk_hdfc_01',
      amount: 140,
      type: 'expense',
      category: 'Transportation',
      subcategory: 'Metro Card',
      paymentMethod: 'UPI',
      source: 'Automatic',
      merchant: 'Metro Rail Corp',
      description: 'Smart card recharge',
      date: '2026-10-05',
      time: '18:00',
      transactionReference: 'UPI-METRO-112'
    },
    {
      id: 'tx_demo_09',
      bankId: null, // Cash Inflow
      amount: 2000,
      type: 'income',
      category: 'Freelance/Business',
      subcategory: 'Consultation',
      paymentMethod: 'Cash',
      source: 'Manual',
      merchant: 'Client Direct',
      description: 'Cash payment for setup help',
      date: '2026-10-04',
      time: '16:00',
      transactionReference: null
    }
  ];

  const insertTx = db.prepare(`
    INSERT INTO transactions (id, user_id, bank_id, amount, type, category, subcategory, payment_method, source, merchant, description, date, time, transaction_reference, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tx of sampleTransactions) {
    insertTx.run(
      tx.id,
      userId,
      tx.bankId,
      tx.amount,
      tx.type,
      tx.category,
      tx.subcategory,
      tx.paymentMethod,
      tx.source,
      tx.merchant,
      tx.description,
      tx.date,
      tx.time,
      tx.transactionReference,
      now,
      now
    );
  }

  // Sample Budgets
  const sampleBudgets = [
    { category: 'Food & Restaurant', amount: 8000, month: 10, year: 2026 },
    { category: 'Grocery', amount: 10000, month: 10, year: 2026 },
    { category: 'Shopping', amount: 5000, month: 10, year: 2026 },
    { category: 'Transportation', amount: 3500, month: 10, year: 2026 },
    { category: 'Bills & Utilities', amount: 4000, month: 10, year: 2026 }
  ];

  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, user_id, category, amount, month, year, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < sampleBudgets.length; i++) {
    const b = sampleBudgets[i];
    insertBudget.run(`bdg_demo_${i + 1}`, userId, b.category, b.amount, b.month, b.year, now, now);
  }
}

export default db;
