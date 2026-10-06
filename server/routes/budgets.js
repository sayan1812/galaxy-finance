import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const budgets = db.prepare(`
      SELECT * FROM budgets 
      WHERE user_id = ? AND month = ? AND year = ?
      ORDER BY amount DESC
    `).all(req.userId, targetMonth, targetYear);

    // Compute actual spending for each budget category
    const monthStr = String(targetMonth).padStart(2, '0');
    const startPattern = `${targetYear}-${monthStr}-%`;

    const budgetsWithSpent = budgets.map(b => {
      const spendRow = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as spent
        FROM transactions
        WHERE user_id = ? AND category = ? AND type = 'expense' AND date LIKE ?
      `).get(req.userId, b.category, startPattern);

      const spent = spendRow.spent;
      const remaining = b.amount - spent;
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      return {
        id: b.id,
        category: b.category,
        amount: b.amount,
        month: b.month,
        year: b.year,
        spent,
        remaining,
        percentage
      };
    });

    return res.json({
      budgets: budgetsWithSpent,
      month: targetMonth,
      year: targetYear
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    if (!category || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid category and positive amount are required.' });
    }

    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();
    const budgetId = 'bdg_' + crypto.randomUUID();
    const nowIso = now.toISOString();

    db.prepare(`
      INSERT INTO budgets (id, user_id, category, amount, month, year, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(budgetId, req.userId, category, Number(amount), targetMonth, targetYear, nowIso, nowIso);

    return res.status(201).json({
      message: 'Budget allocated successfully',
      budget: {
        id: budgetId,
        category,
        amount: Number(amount),
        month: targetMonth,
        year: targetYear,
        spent: 0,
        remaining: Number(amount),
        percentage: 0
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    return res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
