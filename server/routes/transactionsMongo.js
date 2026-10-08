import express from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

// GET /api/v1/transactions
router.get('/', authenticateOrDemo, async (req, res) => {
  try {
    const { type, accountId, category, limit = 100, page = 1 } = req.query;

    const filter = { userId: req.userId };
    if (type) filter.type = type;
    if (accountId) filter.accountId = accountId;
    if (category) filter.category = category;

    const limitNum = Math.min(Number(limit) || 100, 500);
    const skipNum = (Math.max(Number(page) || 1, 1) - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('accountId', 'accountName accountType accountNumberMask')
        .sort({ date: -1 })
        .skip(skipNum)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    // If zero transactions exist, seed initial transactions for demo
    if (transactions.length === 0 && (await Transaction.countDocuments({ userId: req.userId })) === 0) {
      const accounts = await Account.find({ userId: req.userId });
      if (accounts.length > 0) {
        const primaryAccount = accounts[0];
        const seedTxs = await Transaction.create([
          {
            userId: req.userId,
            accountId: primaryAccount._id,
            amount: 75000,
            type: 'income',
            category: 'Salary & Dividends',
            notes: 'Executive Consulting Remittance',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            userId: req.userId,
            accountId: primaryAccount._id,
            amount: 14200,
            type: 'expense',
            category: 'Cloud Infrastructure',
            notes: 'AWS & MongoDB Atlas Cluster Hosting',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            userId: req.userId,
            accountId: primaryAccount._id,
            amount: 3200,
            type: 'expense',
            category: 'Dining & Provisions',
            notes: 'Client Dinner & Refreshments',
            date: new Date(),
          },
        ]);
        return res.json({
          success: true,
          transactions: seedTxs,
          total: seedTxs.length,
          page: 1,
        });
      }
    }

    res.json({
      success: true,
      transactions,
      total: totalCount,
      page: Number(page) || 1,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('[Transactions GET Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
});

// POST /api/v1/transactions
router.post('/', authenticateOrDemo, async (req, res) => {
  try {
    const { accountId, amount, type, category = 'General', notes = '', date = new Date() } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive transaction amount is required' });
    }

    if (!['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income, expense, or transfer' });
    }

    // Resolve or find default account if accountId missing
    const reqAccountId = accountId || req.body.bankId;
    let targetAccount = null;
    if (reqAccountId) {
      targetAccount = await Account.findOne({ _id: reqAccountId, userId: req.userId });
      if (!targetAccount) {
        targetAccount = await Account.findById(reqAccountId).catch(() => null);
      }
    }
    if (!targetAccount) {
      targetAccount = await Account.findOne({ userId: req.userId });
      if (!targetAccount) {
        targetAccount = await Account.create({
          userId: req.userId,
          accountName: 'Primary Vault',
          accountType: 'bank',
          balance: 0,
        });
      }
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.userId,
      accountId: targetAccount._id,
      amount: parsedAmount,
      type,
      category: category.trim(),
      notes: notes.trim(),
      date: new Date(date),
    });

    // Update account balance atomically
    const balanceDelta = type === 'income' ? parsedAmount : type === 'expense' ? -parsedAmount : 0;
    if (balanceDelta !== 0) {
      await Account.findByIdAndUpdate(targetAccount._id, {
        $inc: { balance: balanceDelta },
        updatedAt: new Date(),
      });
    }

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error('[Transactions POST Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

// DELETE /api/v1/transactions/:id
router.delete('/:id', authenticateOrDemo, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert balance on associated account
    const reverseDelta = tx.type === 'income' ? -tx.amount : tx.type === 'expense' ? tx.amount : 0;
    if (reverseDelta !== 0 && tx.accountId) {
      await Account.findByIdAndUpdate(tx.accountId, {
        $inc: { balance: reverseDelta },
        updatedAt: new Date(),
      });
    }

    res.json({ success: true, message: 'Transaction deleted and balance adjusted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

export default router;
