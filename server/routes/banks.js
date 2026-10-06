import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

// Helper to mask account number: e.g., "XXXX XXXX 4521"
function formatMaskedAccount(acc) {
  if (!acc) return 'XXXX XXXX 0000';
  const clean = acc.replace(/\D/g, '');
  if (clean.length <= 4) return 'XXXX XXXX ' + (clean.padStart(4, '0'));
  const last4 = clean.slice(-4);
  return 'XXXX XXXX ' + last4;
}

// Compute dynamic bank balance based on opening balance and transactions
function computeBankWithStats(bank, userId) {
  const stats = db.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
      COUNT(id) as tx_count
    FROM transactions
    WHERE user_id = ? AND bank_id = ?
  `).get(userId, bank.id);

  const currentBalance = (bank.opening_balance || 0) + stats.total_income - stats.total_expense;

  return {
    id: bank.id,
    userId: bank.user_id,
    bankName: bank.bank_name,
    accountType: bank.account_type,
    nickname: bank.nickname || bank.bank_name,
    maskedAccountNumber: bank.masked_account_number,
    openingBalance: bank.opening_balance,
    currentBalance: Math.round(currentBalance * 100) / 100,
    totalIncome: stats.total_income,
    totalExpense: stats.total_expense,
    transactionCount: stats.tx_count,
    planetColor: bank.planet_color || '#38bdf8',
    createdAt: bank.created_at,
    updatedAt: bank.updated_at
  };
}

// 1. GET ALL BANKS FOR USER
router.get('/', requireAuth, (req, res) => {
  try {
    const banks = db.prepare(`
      SELECT * FROM banks WHERE user_id = ? ORDER BY created_at ASC
    `).all(req.userId);

    const bankStats = banks.map(b => computeBankWithStats(b, req.userId));
    const totalBankBalance = bankStats.reduce((sum, b) => sum + b.currentBalance, 0);

    return res.json({
      banks: bankStats,
      totalBankBalance: Math.round(totalBankBalance * 100) / 100,
      count: bankStats.length
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. CREATE BANK
router.post('/', requireAuth, (req, res) => {
  try {
    const { bankName, accountType, nickname, accountNumber, openingBalance, planetColor } = req.body;

    if (!bankName || !accountType) {
      return res.status(400).json({ error: 'Bank name and account type are required.' });
    }

    const bankId = 'bnk_' + crypto.randomUUID();
    const now = new Date().toISOString();
    const masked = formatMaskedAccount(accountNumber);
    const balanceNum = Number(openingBalance) || 0;

    db.prepare(`
      INSERT INTO banks (id, user_id, bank_name, account_type, nickname, masked_account_number, opening_balance, balance, planet_color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bankId,
      req.userId,
      bankName.trim(),
      accountType,
      nickname?.trim() || bankName.trim(),
      masked,
      balanceNum,
      balanceNum,
      planetColor || '#38bdf8',
      now,
      now
    );

    const newBank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(bankId, req.userId);
    return res.status(201).json({
      message: 'Bank vault created successfully',
      bank: computeBankWithStats(newBank, req.userId)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET SINGLE BANK & ITS TRANSACTIONS
router.get('/:id', requireAuth, (req, res) => {
  try {
    const bank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!bank) return res.status(404).json({ error: 'Bank account not found' });

    const bankData = computeBankWithStats(bank, req.userId);
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? AND bank_id = ? ORDER BY date DESC, time DESC
    `).all(req.userId, bank.id);

    const adjustments = db.prepare(`
      SELECT * FROM bank_adjustments WHERE user_id = ? AND bank_id = ? ORDER BY created_at DESC
    `).all(req.userId, bank.id);

    return res.json({
      bank: bankData,
      transactions,
      adjustments
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. EDIT BANK
router.patch('/:id', requireAuth, (req, res) => {
  try {
    const { bankName, accountType, nickname, accountNumber, planetColor } = req.body;
    const bank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!bank) return res.status(404).json({ error: 'Bank account not found' });

    const now = new Date().toISOString();
    const updatedMasked = accountNumber ? formatMaskedAccount(accountNumber) : bank.masked_account_number;

    db.prepare(`
      UPDATE banks SET
        bank_name = COALESCE(?, bank_name),
        account_type = COALESCE(?, account_type),
        nickname = COALESCE(?, nickname),
        masked_account_number = ?,
        planet_color = COALESCE(?, planet_color),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      bankName?.trim() || null,
      accountType || null,
      nickname?.trim() || null,
      updatedMasked,
      planetColor || null,
      now,
      req.params.id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    return res.json({
      message: 'Bank account updated successfully',
      bank: computeBankWithStats(updated, req.userId)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. DELETE BANK
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const bank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!bank) return res.status(404).json({ error: 'Bank account not found' });

    // Transactions associated with this bank will have bank_id set to NULL due to ON DELETE SET NULL
    db.prepare('DELETE FROM banks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);

    return res.json({ message: 'Bank account deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. UPDATE BANK BALANCE / ADJUSTMENT (AUDIT LOGGED)
router.post('/:id/balance', requireAuth, (req, res) => {
  try {
    const { newBalance, reason } = req.body;
    if (newBalance === undefined || isNaN(Number(newBalance))) {
      return res.status(400).json({ error: 'Valid numeric target balance is required.' });
    }

    const bank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!bank) return res.status(404).json({ error: 'Bank account not found' });

    const stats = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
      WHERE user_id = ? AND bank_id = ?
    `).get(req.userId, bank.id);

    const currentBalance = (bank.opening_balance || 0) + stats.total_income - stats.total_expense;
    const targetBalance = Number(newBalance);
    const adjustmentAmount = targetBalance - currentBalance;

    // To reconcile currentBalance to targetBalance while keeping tx history intact:
    // targetBalance = newOpening + total_income - total_expense
    // => newOpening = targetBalance - total_income + total_expense
    const newOpening = targetBalance - stats.total_income + stats.total_expense;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE banks SET opening_balance = ?, balance = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newOpening, targetBalance, now, req.params.id, req.userId);

    // Save audit record
    const adjId = 'adj_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO bank_adjustments (id, bank_id, user_id, previous_balance, new_balance, adjustment_amount, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adjId,
      bank.id,
      req.userId,
      currentBalance,
      targetBalance,
      adjustmentAmount,
      reason?.trim() || 'Manual Balance Adjustment',
      now
    );

    const updatedBank = db.prepare('SELECT * FROM banks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);

    return res.json({
      message: 'Bank balance updated successfully',
      bank: computeBankWithStats(updatedBank, req.userId),
      adjustment: {
        id: adjId,
        previousBalance: currentBalance,
        newBalance: targetBalance,
        adjustmentAmount,
        reason: reason?.trim() || 'Manual Balance Adjustment',
        createdAt: now
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
