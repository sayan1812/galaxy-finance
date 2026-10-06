import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

export function getFinancialOverview(userId) {
  // 1. Bank balances sum
  const banks = db.prepare('SELECT * FROM banks WHERE user_id = ?').all(userId);
  let totalBankBalance = 0;
  for (const b of banks) {
    const bStats = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as inc,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as exp
      FROM transactions WHERE user_id = ? AND bank_id = ?
    `).get(userId, b.id);
    totalBankBalance += (b.opening_balance || 0) + bStats.inc - bStats.exp;
  }

  // 2. Cash balance: opening_cash + cash_incomes - cash_expenses
  const settings = db.prepare('SELECT opening_cash FROM user_settings WHERE user_id = ?').get(userId) || { opening_cash: 7000 };
  const cashStats = db.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as inc,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as exp
    FROM transactions 
    WHERE user_id = ? AND payment_method = 'Cash'
  `).get(userId);
  const cashBalance = (settings.opening_cash || 0) + cashStats.inc - cashStats.exp;

  // 3. Total Inflows & Outflows
  const totalStats = db.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
      COUNT(id) as total_count
    FROM transactions WHERE user_id = ?
  `).get(userId);

  // 4. Net Available Money = Total Bank Balance + Cash Balance
  const netAvailableMoney = totalBankBalance + cashBalance;

  return {
    netAvailableMoney: Math.round(netAvailableMoney * 100) / 100,
    totalBankBalance: Math.round(totalBankBalance * 100) / 100,
    cashBalance: Math.round(cashBalance * 100) / 100,
    totalIncome: Math.round(totalStats.total_income * 100) / 100,
    totalExpense: Math.round(totalStats.total_expense * 100) / 100,
    transactionCount: totalStats.total_count
  };
}

// 1. GET TRANSACTIONS WITH FILTERS & PAGINATION
router.get('/', requireAuth, (req, res) => {
  try {
    const { 
      search, 
      category, 
      paymentMethod, 
      type, 
      bankId, 
      startDate, 
      endDate, 
      sort = 'date_desc', 
      page = 1, 
      limit = 50 
    } = req.query;

    const conditions = ['user_id = ?'];
    const params = [req.userId];

    if (search) {
      conditions.push('(merchant LIKE ? OR description LIKE ? OR category LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (paymentMethod && paymentMethod !== 'All') {
      conditions.push('payment_method = ?');
      params.push(paymentMethod);
    }

    if (type && type !== 'All') {
      conditions.push('type = ?');
      params.push(type.toLowerCase());
    }

    if (bankId && bankId !== 'All') {
      conditions.push('bank_id = ?');
      params.push(bankId);
    }

    if (startDate) {
      conditions.push('date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('date <= ?');
      params.push(endDate);
    }

    let orderBy = 'date DESC, time DESC';
    if (sort === 'date_asc') orderBy = 'date ASC, time ASC';
    else if (sort === 'amount_desc') orderBy = 'amount DESC';
    else if (sort === 'amount_asc') orderBy = 'amount ASC';

    const whereClause = conditions.join(' AND ');

    // Total count query
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE ${whereClause}`).get(...params);
    const totalCount = countRow.count;

    const offsetNum = (Number(page) - 1) * Number(limit);
    const paginatedParams = [...params, Number(limit), offsetNum];

    const rows = db.prepare(`
      SELECT 
        t.*,
        b.bank_name,
        b.nickname as bank_nickname,
        b.planet_color as bank_color
      FROM transactions t
      LEFT JOIN banks b ON t.bank_id = b.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...paginatedParams);

    const formatted = rows.map(r => ({
      id: r.id,
      bankId: r.bank_id,
      amount: r.amount,
      type: r.type,
      category: r.category,
      subcategory: r.subcategory,
      paymentMethod: r.payment_method,
      source: r.source,
      merchant: r.merchant,
      description: r.description,
      date: r.date,
      time: r.time,
      transactionReference: r.transaction_reference,
      bankName: r.bank_name,
      bankNickname: r.bank_nickname,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    const overview = getFinancialOverview(req.userId);

    return res.json({
      transactions: formatted,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      },
      overview
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. CREATE TRANSACTION
router.post('/', requireAuth, (req, res) => {
  try {
    const { 
      amount, 
      type, 
      category, 
      subcategory, 
      paymentMethod, 
      source = 'Manual', 
      merchant, 
      description, 
      date, 
      time, 
      transactionReference,
      bankId 
    } = req.body;

    const amountNum = Number(amount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Valid positive transaction amount is required.' });
    }

    if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({ error: 'Type must be income or expense.' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const txId = 'tx_' + crypto.randomUUID();
    const now = new Date().toISOString();
    const txDate = date || now.slice(0, 10);
    const txTime = time || now.slice(11, 16);

    // If payment method is not Cash and bankId was not provided, try to pick default bank
    let resolvedBankId = bankId || null;
    if (paymentMethod !== 'Cash' && !resolvedBankId) {
      const defaultBank = db.prepare('SELECT id FROM banks WHERE user_id = ? LIMIT 1').get(req.userId);
      if (defaultBank) resolvedBankId = defaultBank.id;
    }

    db.prepare(`
      INSERT INTO transactions (
        id, user_id, bank_id, amount, type, category, subcategory, payment_method, 
        source, merchant, description, date, time, transaction_reference, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      txId,
      req.userId,
      resolvedBankId,
      amountNum,
      type.toLowerCase(),
      category,
      subcategory || null,
      paymentMethod || (resolvedBankId ? 'UPI' : 'Cash'),
      source,
      merchant?.trim() || null,
      description?.trim() || null,
      txDate,
      txTime,
      transactionReference?.trim() || null,
      now,
      now
    );

    const inserted = db.prepare(`
      SELECT t.*, b.bank_name, b.nickname as bank_nickname
      FROM transactions t
      LEFT JOIN banks b ON t.bank_id = b.id
      WHERE t.id = ? AND t.user_id = ?
    `).get(txId, req.userId);

    const overview = getFinancialOverview(req.userId);

    return res.status(201).json({
      message: 'Transaction saved successfully',
      transaction: {
        id: inserted.id,
        bankId: inserted.bank_id,
        amount: inserted.amount,
        type: inserted.type,
        category: inserted.category,
        subcategory: inserted.subcategory,
        paymentMethod: inserted.payment_method,
        source: inserted.source,
        merchant: inserted.merchant,
        description: inserted.description,
        date: inserted.date,
        time: inserted.time,
        transactionReference: inserted.transaction_reference,
        bankName: inserted.bank_name,
        bankNickname: inserted.bank_nickname
      },
      overview
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET SINGLE TRANSACTION
router.get('/:id', requireAuth, (req, res) => {
  try {
    const tx = db.prepare(`
      SELECT t.*, b.bank_name, b.nickname as bank_nickname
      FROM transactions t
      LEFT JOIN banks b ON t.bank_id = b.id
      WHERE t.id = ? AND t.user_id = ?
    `).get(req.params.id, req.userId);

    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    return res.json({
      transaction: {
        id: tx.id,
        bankId: tx.bank_id,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        subcategory: tx.subcategory,
        paymentMethod: tx.payment_method,
        source: tx.source,
        merchant: tx.merchant,
        description: tx.description,
        date: tx.date,
        time: tx.time,
        transactionReference: tx.transaction_reference,
        bankName: tx.bank_name,
        bankNickname: tx.bank_nickname,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. EDIT TRANSACTION
router.patch('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    const {
      amount,
      type,
      category,
      subcategory,
      paymentMethod,
      merchant,
      description,
      date,
      time,
      transactionReference,
      bankId
    } = req.body;

    const amountNum = amount !== undefined ? Number(amount) : existing.amount;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE transactions SET
        amount = ?,
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        subcategory = COALESCE(?, subcategory),
        payment_method = COALESCE(?, payment_method),
        merchant = COALESCE(?, merchant),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        transaction_reference = COALESCE(?, transaction_reference),
        bank_id = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      amountNum,
      type?.toLowerCase() || null,
      category || null,
      subcategory !== undefined ? subcategory : existing.subcategory,
      paymentMethod || null,
      merchant !== undefined ? merchant : existing.merchant,
      description !== undefined ? description : existing.description,
      date || null,
      time || null,
      transactionReference !== undefined ? transactionReference : existing.transaction_reference,
      bankId !== undefined ? bankId : existing.bank_id,
      now,
      req.params.id,
      req.userId
    );

    const updated = db.prepare(`
      SELECT t.*, b.bank_name, b.nickname as bank_nickname
      FROM transactions t
      LEFT JOIN banks b ON t.bank_id = b.id
      WHERE t.id = ? AND t.user_id = ?
    `).get(req.params.id, req.userId);

    const overview = getFinancialOverview(req.userId);

    return res.json({
      message: 'Transaction updated successfully',
      transaction: {
        id: updated.id,
        bankId: updated.bank_id,
        amount: updated.amount,
        type: updated.type,
        category: updated.category,
        subcategory: updated.subcategory,
        paymentMethod: updated.payment_method,
        source: updated.source,
        merchant: updated.merchant,
        description: updated.description,
        date: updated.date,
        time: updated.time,
        transactionReference: updated.transaction_reference,
        bankName: updated.bank_name,
        bankNickname: updated.bank_nickname
      },
      overview
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. DELETE TRANSACTION
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    const overview = getFinancialOverview(req.userId);

    return res.json({
      message: 'Transaction deleted successfully',
      deletedId: req.params.id,
      overview
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
