import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Recreate __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if available
try {
  if (typeof process.loadEnvFile === 'function') {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  }
} catch {
  // Ignored if .env already loaded
}

export const dbPath = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.resolve(__dirname, 'rupeewise.db');

// Ensure parent directory exists and check R/W permissions
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
try {
  fs.accessSync(dbDir, fs.constants.R_OK | fs.constants.W_OK);
} catch (err) {
  console.error(`[Database Error] Invalid directory permissions for ${dbDir}:`, err.message);
}

export const db = new DatabaseSync(dbPath);

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

    CREATE VIEW IF NOT EXISTS accounts AS SELECT * FROM banks;
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_banks_user ON banks(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
  `);

  const verification = verifyDatabaseSchema();
  if (verification.success) {
    console.log(`[Database] Schema migration verified: 'users' (${verification.metrics.users}), 'accounts' (${verification.metrics.accounts}), 'transactions' (${verification.metrics.transactions}) exist.`);
  } else {
    console.error(`[Database Error] Missing required tables/views:`, verification.missing);
  }
}

export function verifyDatabaseSchema() {
  const tables = db.prepare(`SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view')`).all();
  const tableNames = new Set(tables.map(t => t.name));
  
  const required = ['users', 'accounts', 'transactions'];
  const missing = required.filter(t => !tableNames.has(t));
  
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count ?? 0;
  const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get()?.count ?? 0;
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get()?.count ?? 0;

  return {
    success: missing.length === 0,
    dbPath,
    tables: Array.from(tableNames),
    missing,
    metrics: {
      users: userCount,
      accounts: accountCount,
      transactions: txCount
    }
  };
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

export default db;
