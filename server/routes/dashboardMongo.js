import express from 'express';
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

/**
 * GET /api/v1/dashboard/summary
 * Directly aggregates Net Available Capital, total banks, cash reserves,
 * monthly inflows & outflows without client-side discrepancies.
 */
router.get('/summary', authenticateOrDemo, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // 1. Direct Account Aggregation for Capital Breakdown
    const accountAggregation = await Account.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$accountType',
          totalBalance: { $sum: '$balance' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalBankBalance = 0;
    let cashBalance = 0;
    let bankCount = 0;

    accountAggregation.forEach((group) => {
      if (group._id === 'bank') {
        totalBankBalance = group.totalBalance || 0;
        bankCount = group.count || 0;
      } else if (group._id === 'cash') {
        cashBalance = group.totalBalance || 0;
      }
    });

    const netAvailableCapital = totalBankBalance + cashBalance;

    // 2. Direct Transaction Aggregation for All-Time & Monthly Inflow / Outflow
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [allTimeStats, monthStats, categoryStats, recentTransactions] = await Promise.all([
      // All-time income vs expense
      Transaction.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Current month stats
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            date: { $gte: startOfMonth, $lt: startOfNextMonth },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Top expense categories this month
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: 'expense',
            date: { $gte: startOfMonth, $lt: startOfNextMonth },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 6 },
      ]),

      // 5 most recent transactions
      Transaction.find({ userId: userObjectId })
        .populate('accountId', 'accountName accountType accountNumberMask')
        .sort({ date: -1 })
        .limit(5),
    ]);

    let totalIncomeAllTime = 0;
    let totalExpenseAllTime = 0;
    allTimeStats.forEach((s) => {
      if (s._id === 'income') totalIncomeAllTime = s.total || 0;
      if (s._id === 'expense') totalExpenseAllTime = s.total || 0;
    });

    let monthIncome = 0;
    let monthExpense = 0;
    monthStats.forEach((s) => {
      if (s._id === 'income') monthIncome = s.total || 0;
      if (s._id === 'expense') monthExpense = s.total || 0;
    });

    res.json({
      success: true,
      data: {
        netAvailableCapital: Math.round(netAvailableCapital * 100) / 100,
        totalBankBalance: Math.round(totalBankBalance * 100) / 100,
        cashBalance: Math.round(cashBalance * 100) / 100,
        bankCount,
        totalIncomeAllTime: Math.round(totalIncomeAllTime * 100) / 100,
        totalExpenseAllTime: Math.round(totalExpenseAllTime * 100) / 100,
        monthIncome: Math.round(monthIncome * 100) / 100,
        monthExpense: Math.round(monthExpense * 100) / 100,
        categoryBreakdown: categoryStats.map((c) => ({
          category: c._id || 'Uncategorized',
          amount: Math.round(c.total * 100) / 100,
          count: c.count,
        })),
        recentTransactions,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to aggregate dashboard summary' });
  }
});

export default router;
