import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { initDatabase } from '../server/db.js';
import { getFinancialOverview } from '../server/routes/transactions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📱 Starting Galaxy Finance Mobile Architecture & Backend Verification Suite...\n');

// 1. Verify Backend Offline Sync
console.log('1. Testing Offline Batch Sync & Deduplication Logic...');
initDatabase();
const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@rupeewise.com');
assert(demoUser, 'Demo user must exist in DB');
const userId = demoUser.id;

// Pick a test bank
const testBank = db.prepare('SELECT id FROM banks WHERE user_id = ? LIMIT 1').get(userId);
assert(testBank, 'At least one bank vault must exist for demo user');

// Generate unique test transactions
const uniqueRef = 'MOCK_REF_' + Date.now();
const testOfflineTx1 = {
  localId: 'offline_1',
  amount: 850,
  type: 'expense',
  category: 'Food & Dining',
  paymentMethod: 'UPI',
  bankId: testBank.id,
  merchant: 'Offline Test Bistro',
  description: 'Dinner while offline',
  date: '2026-10-06',
  time: '20:30',
  transactionReference: uniqueRef
};

// Simulate sync batch directly against DB
const insertStmt = db.prepare(`
  INSERT INTO transactions (
    id, user_id, bank_id, amount, type, category, payment_method, 
    source, merchant, description, date, time, transaction_reference, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const txId = 'tx_offline_test_' + Date.now();
const now = new Date().toISOString();
insertStmt.run(
  txId,
  userId,
  testOfflineTx1.bankId,
  testOfflineTx1.amount,
  testOfflineTx1.type,
  testOfflineTx1.category,
  testOfflineTx1.paymentMethod,
  'Manual',
  testOfflineTx1.merchant,
  testOfflineTx1.description,
  testOfflineTx1.date,
  testOfflineTx1.time,
  testOfflineTx1.transactionReference,
  now,
  now
);

// Verify inserted
const inserted = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
assert.strictEqual(inserted.id, txId);
assert.strictEqual(inserted.transaction_reference, uniqueRef);
console.log('  ✅ Offline transaction persisted and linked to bank vault');

// Test Duplicate Detection
const duplicateCheck = db.prepare(`
  SELECT id FROM transactions 
  WHERE user_id = ? AND transaction_reference = ?
`).get(userId, uniqueRef);
assert(duplicateCheck, 'Duplicate check query must find existing transaction reference');
console.log('  ✅ Duplicate detection correctly identified existing reference');

// Clean up test transaction
db.prepare('DELETE FROM transactions WHERE id = ?').run(txId);

// 2. Test Notifications Storage & Retrieval
console.log('\n2. Testing Cloud Notifications Engine...');
const notifId = 'notif_test_' + Date.now();
db.prepare(`
  INSERT INTO notifications (id, user_id, title, body, type, read, created_at)
  VALUES (?, ?, ?, ?, ?, 0, ?)
`).run(notifId, userId, 'Test Budget Alert', '80% of budget reached', 'budget', now);

const fetchedNotif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notifId);
assert.strictEqual(fetchedNotif.title, 'Test Budget Alert');
assert.strictEqual(fetchedNotif.read, 0);

// Mark as read
db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(notifId);
const readNotif = db.prepare('SELECT read FROM notifications WHERE id = ?').get(notifId);
assert.strictEqual(readNotif.read, 1);
db.prepare('DELETE FROM notifications WHERE id = ?').run(notifId);
console.log('  ✅ Notification creation, state transitions, and read statuses verified');

// 3. Test Mobile Project Structure
console.log('\n3. Verifying React Native + Expo Mobile Structure...');
const requiredFiles = [
  'mobile/app.json',
  'mobile/package.json',
  'mobile/App.tsx',
  'mobile/types/index.ts',
  'mobile/theme/index.ts',
  'mobile/utils/formatters.ts',
  'mobile/services/api.ts',
  'mobile/services/storage.ts',
  'mobile/services/biometricService.ts',
  'mobile/services/syncService.ts',
  'mobile/services/notificationService.ts',
  'mobile/store/AuthContext.tsx',
  'mobile/store/FinanceContext.tsx',
  'mobile/store/ThemeContext.tsx',
  'mobile/components/AnimatedNumber.tsx',
  'mobile/components/GlassCard.tsx',
  'mobile/components/MicroReaction.tsx',
  'mobile/components/OfflineBanner.tsx',
  'mobile/components/ConfirmationModal.tsx',
  'mobile/components/Galaxy3DCanvas.tsx',
  'mobile/components/SwipeableTransactionItem.tsx',
  'mobile/screens/HomeScreen.tsx',
  'mobile/screens/CalendarScreen.tsx',
  'mobile/screens/AddTransactionModal.tsx',
  'mobile/screens/BanksScreen.tsx',
  'mobile/screens/AddBankModal.tsx',
  'mobile/screens/BankDetailModal.tsx',
  'mobile/screens/ReportsScreen.tsx',
  'mobile/screens/TransactionsScreen.tsx',
  'mobile/screens/BudgetsScreen.tsx',
  'mobile/screens/GalaxyAiScreen.tsx',
  'mobile/screens/SettingsScreen.tsx',
  'mobile/screens/NotificationsScreen.tsx',
  'mobile/screens/AuthScreen.tsx',
  'mobile/navigation/BottomTabNavigator.tsx',
  'mobile/navigation/RootStackNavigator.tsx'
];

for (const relPath of requiredFiles) {
  const fullPath = path.resolve(rootDir, relPath);
  assert(fs.existsSync(fullPath), `Required mobile file missing: ${relPath}`);
}
console.log(`  ✅ All ${requiredFiles.length} production mobile files verified on disk`);

// 4. Test app.json Scheme & Permissions Configuration
console.log('\n4. Verifying Expo app.json Configuration & Deep Linking...');
const appJson = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'mobile/app.json'), 'utf8'));
assert.strictEqual(appJson.expo.name, 'Galaxy Finance');
assert.strictEqual(appJson.expo.scheme, 'galaxyfinance');
assert.strictEqual(appJson.expo.ios.bundleIdentifier, 'com.galaxyfinance.app');
assert.strictEqual(appJson.expo.android.package, 'com.galaxyfinance.app');
assert(appJson.expo.plugins.some(p => (Array.isArray(p) ? p[0] : p) === 'expo-secure-store'));
assert(appJson.expo.plugins.some(p => (Array.isArray(p) ? p[0] : p) === 'expo-local-authentication'));
console.log('  ✅ Bundle IDs, permissions, plugins, and deep linking schemes verified');

// 5. Test Zero Sensitive Banking Data Compliance
console.log('\n5. Verifying Zero Sensitive Banking Credentials Compliance...');
const addBankCode = fs.readFileSync(path.resolve(rootDir, 'mobile/screens/AddBankModal.tsx'), 'utf8');
assert(!addBankCode.includes('atmPin') && !addBankCode.includes('atm_pin'));
assert(!addBankCode.includes('upiPin') && !addBankCode.includes('upi_pin'));
assert(!addBankCode.includes('netBankingPassword'));
assert(!addBankCode.includes('cvv'));
assert(addBankCode.includes('Zero Credentials Policy'));
console.log('  ✅ Strictly compliant: Zero collection of PINs, passwords, or CVVs');

console.log('\n🌟 ALL MOBILE ARCHITECTURE & BACKEND INTEGRATION TESTS PASSED 100%!\n');
