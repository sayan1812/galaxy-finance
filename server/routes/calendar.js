import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const { month, year, dimension = 'All' } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const monthStr = String(targetMonth).padStart(2, '0');
    const pattern = `${targetYear}-${monthStr}-%`;

    const conditions = ['user_id = ?', 'date LIKE ?'];
    const params = [req.userId, pattern];

    if (dimension === 'Income') {
      conditions.push("type = 'income'");
    } else if (dimension === 'Expense') {
      conditions.push("type = 'expense'");
    } else if (dimension === 'Cash') {
      conditions.push("payment_method = 'Cash'");
    } else if (dimension === 'Bank') {
      conditions.push("payment_method = 'Bank Transfer'");
    } else if (dimension === 'UPI') {
      conditions.push("payment_method = 'UPI'");
    } else if (dimension === 'Card') {
      conditions.push("payment_method IN ('Debit Card', 'Credit Card')");
    }

    const rows = db.prepare(`
      SELECT 
        date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        COUNT(id) as count
      FROM transactions
      WHERE ${conditions.join(' AND ')}
      GROUP BY date
      ORDER BY date ASC
    `).all(...params);

    const dailyMap = {};
    for (const r of rows) {
      dailyMap[r.date] = {
        date: r.date,
        income: r.income,
        expense: r.expense,
        net: r.income - r.expense,
        count: r.count
      };
    }

    return res.json({
      month: targetMonth,
      year: targetYear,
      dimension,
      days: dailyMap
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
