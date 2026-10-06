import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { getFinancialOverview } from './transactions.js';

const router = express.Router();

/**
 * GET /api/sync/status
 * Returns current server time, sync status, and overview for fast heartbeat
 */
router.get('/status', requireAuth, (req, res) => {
  try {
    const overview = getFinancialOverview(req.userId);
    const lastTx = db.prepare(`
      SELECT updated_at FROM transactions 
      WHERE user_id = ? 
      ORDER BY updated_at DESC LIMIT 1
    `).get(req.userId);

    res.json({
      status: 'connected',
      serverTime: new Date().toISOString(),
      lastModified: lastTx ? lastTx.updated_at : null,
      overview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/sync/batch
 * Handles offline transactions queued while the mobile device had no network.
 * Performs duplicate detection, creates records, and returns current balances.
 */
router.post('/batch', requireAuth, (req, res) => {
  try {
    const { transactions = [] } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.json({
        success: true,
        message: 'No transactions to sync',
        syncedCount: 0,
        duplicateCount: 0,
        results: [],
        overview: getFinancialOverview(req.userId)
      });
    }

    const results = [];
    let syncedCount = 0;
    let duplicateCount = 0;

    // Use prepared statements for speed and safety
    const insertStmt = db.prepare(`
      INSERT INTO transactions (
        id, user_id, bank_id, amount, type, category, subcategory, payment_method, 
        source, merchant, description, date, time, transaction_reference, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const checkDuplicateRefStmt = db.prepare(`
      SELECT id FROM transactions 
      WHERE user_id = ? AND transaction_reference = ? AND transaction_reference IS NOT NULL AND transaction_reference != ''
    `);

    const checkDuplicateFuzzyStmt = db.prepare(`
      SELECT id FROM transactions 
      WHERE user_id = ? AND amount = ? AND type = ? AND category = ? 
        AND payment_method = ? AND date = ? AND (merchant = ? OR (merchant IS NULL AND ? IS NULL))
    `);

    for (const item of transactions) {
      const localId = item.localId || item.id;
      const amountNum = Number(item.amount);

      if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
        results.push({
          localId,
          status: 'error',
          error: 'Invalid amount'
        });
        continue;
      }

      const txType = (item.type || 'expense').toLowerCase();
      if (!['income', 'expense'].includes(txType)) {
        results.push({
          localId,
          status: 'error',
          error: 'Type must be income or expense'
        });
        continue;
      }

      const category = item.category || 'Other';
      const paymentMethod = item.paymentMethod || 'Cash';
      const now = new Date().toISOString();
      const txDate = item.date || now.slice(0, 10);
      const txTime = item.time || now.slice(11, 16);
      const merchant = item.merchant || null;
      const description = item.description || null;
      const reference = item.transactionReference || null;

      // 1. Check for duplicate by transactionReference
      if (reference) {
        const existingByRef = checkDuplicateRefStmt.get(req.userId, reference);
        if (existingByRef) {
          duplicateCount++;
          results.push({
            localId,
            serverId: existingByRef.id,
            status: 'duplicate',
            reason: 'Reference ID already exists'
          });
          continue;
        }
      }

      // 2. Fuzzy duplicate check (same date, amount, type, category, merchant, payment_method)
      const existingFuzzy = checkDuplicateFuzzyStmt.get(
        req.userId, 
        amountNum, 
        txType, 
        category, 
        paymentMethod, 
        txDate, 
        merchant, 
        merchant
      );

      if (existingFuzzy) {
        duplicateCount++;
        results.push({
          localId,
          serverId: existingFuzzy.id,
          status: 'duplicate',
          reason: 'Duplicate transaction detected with identical details'
        });
        continue;
      }

      // 3. Resolve bank if applicable
      let resolvedBankId = item.bankId || null;
      if (paymentMethod !== 'Cash' && !resolvedBankId) {
        const defaultBank = db.prepare('SELECT id FROM banks WHERE user_id = ? LIMIT 1').get(req.userId);
        if (defaultBank) resolvedBankId = defaultBank.id;
      }

      // 4. Insert valid synced transaction
      const serverId = 'tx_' + crypto.randomUUID();
      const createdAt = item.createdAt || now;
      const updatedAt = now;

      insertStmt.run(
        serverId,
        req.userId,
        resolvedBankId,
        amountNum,
        txType,
        category,
        item.subcategory || null,
        paymentMethod,
        item.source || 'Manual',
        merchant,
        description,
        txDate,
        txTime,
        reference,
        createdAt,
        updatedAt
      );

      syncedCount++;
      results.push({
        localId,
        serverId,
        status: 'synced'
      });
    }

    const overview = getFinancialOverview(req.userId);

    res.json({
      success: true,
      syncedCount,
      duplicateCount,
      totalReceived: transactions.length,
      results,
      overview
    });
  } catch (err) {
    console.error('[Sync Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
