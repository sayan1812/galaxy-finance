import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

function getDateRange(range, customStart, customEnd) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = now.toISOString().slice(0, 10);

  if (range === 'today') {
    return { startDate: todayStr, endDate: todayStr };
  }
  if (range === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    return { startDate: monday.toISOString().slice(0, 10), endDate: todayStr };
  }
  if (range === 'last_month') {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const start = new Date(prevYear, prevMonth, 1).toISOString().slice(0, 10);
    const end = new Date(prevYear, prevMonth + 1, 0).toISOString().slice(0, 10);
    return { startDate: start, endDate: end };
  }
  if (range === 'this_year') {
    return { startDate: `${year}-01-01`, endDate: todayStr };
  }
  if (range === 'custom' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }
  // Default: this_month
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  return { startDate: start, endDate: todayStr };
}

router.get('/', requireAuth, (req, res) => {
  try {
    const { range = 'this_month', startDate: customStart, endDate: customEnd } = req.query;
    const { startDate, endDate } = getDateRange(range, customStart, customEnd);

    // Totals
    const totals = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(id) as total_count
      FROM transactions
      WHERE user_id = ? AND date >= ? AND date <= ?
    `).get(req.userId, startDate, endDate);

    const netBalance = totals.total_income - totals.total_expense;

    // Highest spending category
    const topCategory = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
      ORDER BY total DESC
      LIMIT 1
    `).get(req.userId, startDate, endDate) || { category: 'None', total: 0 };

    // Highest single transaction
    const topTx = db.prepare(`
      SELECT *
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
      ORDER BY amount DESC
      LIMIT 1
    `).get(req.userId, startDate, endDate);

    // Channel breakdowns
    const paymentMethods = db.prepare(`
      SELECT payment_method, SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
      GROUP BY payment_method
    `).all(req.userId, startDate, endDate);

    let cashSpending = 0;
    let upiSpending = 0;
    let cardSpending = 0;
    let bankTransferSpending = 0;

    for (const pm of paymentMethods) {
      if (pm.payment_method === 'Cash') cashSpending += pm.total;
      else if (pm.payment_method === 'UPI') upiSpending += pm.total;
      else if (pm.payment_method === 'Debit Card' || pm.payment_method === 'Credit Card') cardSpending += pm.total;
      else if (pm.payment_method === 'Bank Transfer') bankTransferSpending += pm.total;
    }

    // Category breakdown list
    const categories = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(id) as count
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
      ORDER BY total DESC
    `).all(req.userId, startDate, endDate);

    const categoryBreakdown = categories.map(c => ({
      category: c.category,
      amount: c.total,
      count: c.count,
      percentage: totals.total_expense > 0 ? Math.round((c.total / totals.total_expense) * 100) : 0
    }));

    return res.json({
      range,
      startDate,
      endDate,
      totalIncome: totals.total_income,
      totalExpense: totals.total_expense,
      netBalance,
      transactionCount: totals.total_count,
      highestCategory: topCategory.category,
      highestCategoryAmount: topCategory.total,
      highestTransaction: topTx ? {
        id: topTx.id,
        amount: topTx.amount,
        merchant: topTx.merchant,
        category: topTx.category,
        date: topTx.date
      } : null,
      channelBreakdown: {
        cash: cashSpending,
        upi: upiSpending,
        cards: cardSpending,
        bankTransfer: bankTransferSpending
      },
      categoryBreakdown
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
