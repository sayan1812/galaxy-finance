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
    if (type) filter.type = type.toLowerCase();
    if (accountId) filter.accountId = accountId;
    if (category) filter.category = category;

    const limitNum = Math.min(Number(limit) || 100, 500);
    const skipNum = (Math.max(Number(page) || 1, 1) - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .populate('accountId', 'accountName accountType accountNumberMask balance')
        .populate('toAccountId', 'accountName accountType accountNumberMask balance')
        .sort({ date: -1 })
        .skip(skipNum)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

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
    const { 
      accountId, 
      toAccountId, 
      amount, 
      type, 
      category = 'General', 
      merchant = '', 
      notes = '', 
      receiptUrl = '',
      reference = '',
      date = new Date() 
    } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive transaction amount is required' });
    }

    const normalizedType = (type || 'expense').toLowerCase();
    if (!['income', 'expense', 'transfer'].includes(normalizedType)) {
      return res.status(400).json({ error: 'Type must be income, expense, or transfer' });
    }

    // Resolve source account
    const reqAccountId = accountId || req.body.bankId;
    let targetAccount = null;
    if (reqAccountId) {
      targetAccount = await Account.findOne({ _id: reqAccountId, userId: req.userId });
    }
    if (!targetAccount) {
      targetAccount = await Account.findOne({ userId: req.userId });
    }
    if (!targetAccount) {
      targetAccount = await Account.create({
        userId: req.userId,
        accountName: 'Cash in Hand',
        accountType: 'cash',
        balance: 0,
        accountNumberMask: 'CASH',
      });
    }

    let targetToAccount = null;
    if (normalizedType === 'transfer') {
      if (!toAccountId || toAccountId === String(targetAccount._id)) {
        return res.status(400).json({ error: 'Transfer requires a distinct destination account' });
      }
      targetToAccount = await Account.findOne({ _id: toAccountId, userId: req.userId });
      if (!targetToAccount) {
        return res.status(400).json({ error: 'Destination account not found' });
      }
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.userId,
      accountId: targetAccount._id,
      toAccountId: targetToAccount ? targetToAccount._id : null,
      amount: parsedAmount,
      type: normalizedType,
      category: category.trim() || (normalizedType === 'transfer' ? 'Transfer' : 'General'),
      merchant: merchant.trim(),
      notes: notes.trim(),
      receiptUrl: (receiptUrl || req.body.receiptUrl || '').trim(),
      reference: (reference || req.body.transactionReference || '').trim(),
      date: new Date(date),
    });

    // Execute ledger mutation atomically
    if (normalizedType === 'income') {
      await Account.findByIdAndUpdate(targetAccount._id, {
        $inc: { balance: parsedAmount },
        updatedAt: new Date(),
      });
    } else if (normalizedType === 'expense') {
      await Account.findByIdAndUpdate(targetAccount._id, {
        $inc: { balance: -parsedAmount },
        updatedAt: new Date(),
      });
    } else if (normalizedType === 'transfer') {
      await Account.findByIdAndUpdate(targetAccount._id, {
        $inc: { balance: -parsedAmount },
        updatedAt: new Date(),
      });
      await Account.findByIdAndUpdate(targetToAccount._id, {
        $inc: { balance: parsedAmount },
        updatedAt: new Date(),
      });
    }

    const populatedTx = await Transaction.findById(transaction._id)
      .populate('accountId', 'accountName accountType accountNumberMask balance')
      .populate('toAccountId', 'accountName accountType accountNumberMask balance');

    res.status(201).json({ success: true, transaction: populatedTx });
  } catch (error) {
    console.error('[Transactions POST Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

// PATCH /api/v1/transactions/:id or PUT /api/v1/transactions/:id
const updateHandler = async (req, res) => {
  try {
    const existingTx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!existingTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // 1. Revert previous amount mutation completely
    if (existingTx.type === 'income' && existingTx.accountId) {
      await Account.findByIdAndUpdate(existingTx.accountId, {
        $inc: { balance: -existingTx.amount },
        updatedAt: new Date(),
      });
    } else if (existingTx.type === 'expense' && existingTx.accountId) {
      await Account.findByIdAndUpdate(existingTx.accountId, {
        $inc: { balance: existingTx.amount },
        updatedAt: new Date(),
      });
    } else if (existingTx.type === 'transfer') {
      if (existingTx.accountId) {
        await Account.findByIdAndUpdate(existingTx.accountId, {
          $inc: { balance: existingTx.amount },
          updatedAt: new Date(),
        });
      }
      if (existingTx.toAccountId) {
        await Account.findByIdAndUpdate(existingTx.toAccountId, {
          $inc: { balance: -existingTx.amount },
          updatedAt: new Date(),
        });
      }
    }

    // 2. Resolve new values
    const newType = (req.body.type || existingTx.type).toLowerCase();
    const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : existingTx.amount;
    const newAccountId = req.body.accountId || existingTx.accountId;
    const newToAccountId = req.body.toAccountId || existingTx.toAccountId;

    if (newType === 'transfer' && (!newToAccountId || String(newToAccountId) === String(newAccountId))) {
      return res.status(400).json({ error: 'Transfer requires a distinct destination account' });
    }

    // 3. Apply new mutation
    if (newType === 'income' && newAccountId) {
      await Account.findByIdAndUpdate(newAccountId, {
        $inc: { balance: newAmount },
        updatedAt: new Date(),
      });
    } else if (newType === 'expense' && newAccountId) {
      await Account.findByIdAndUpdate(newAccountId, {
        $inc: { balance: -newAmount },
        updatedAt: new Date(),
      });
    } else if (newType === 'transfer') {
      await Account.findByIdAndUpdate(newAccountId, {
        $inc: { balance: -newAmount },
        updatedAt: new Date(),
      });
      await Account.findByIdAndUpdate(newToAccountId, {
        $inc: { balance: newAmount },
        updatedAt: new Date(),
      });
    }

    // 4. Update transaction fields
    existingTx.type = newType;
    existingTx.amount = newAmount;
    existingTx.accountId = newAccountId;
    existingTx.toAccountId = newType === 'transfer' ? newToAccountId : null;
    if (req.body.category !== undefined) existingTx.category = req.body.category.trim();
    if (req.body.merchant !== undefined) existingTx.merchant = req.body.merchant.trim();
    if (req.body.notes !== undefined) existingTx.notes = req.body.notes.trim();
    if (req.body.receiptUrl !== undefined) existingTx.receiptUrl = req.body.receiptUrl.trim();
    if (req.body.reference !== undefined || req.body.transactionReference !== undefined) {
      existingTx.reference = (req.body.reference || req.body.transactionReference || '').trim();
    }
    if (req.body.date) existingTx.date = new Date(req.body.date);

    await existingTx.save();

    const updatedTx = await Transaction.findById(existingTx._id)
      .populate('accountId', 'accountName accountType accountNumberMask balance')
      .populate('toAccountId', 'accountName accountType accountNumberMask balance');

    res.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('[Transactions UPDATE Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to update transaction' });
  }
};

router.patch('/:id', authenticateOrDemo, updateHandler);
router.put('/:id', authenticateOrDemo, updateHandler);

// DELETE /api/v1/transactions/:id
router.delete('/:id', authenticateOrDemo, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert balance on associated account(s)
    if (tx.type === 'income' && tx.accountId) {
      await Account.findByIdAndUpdate(tx.accountId, {
        $inc: { balance: -tx.amount },
        updatedAt: new Date(),
      });
    } else if (tx.type === 'expense' && tx.accountId) {
      await Account.findByIdAndUpdate(tx.accountId, {
        $inc: { balance: tx.amount },
        updatedAt: new Date(),
      });
    } else if (tx.type === 'transfer') {
      if (tx.accountId) {
        await Account.findByIdAndUpdate(tx.accountId, {
          $inc: { balance: tx.amount },
          updatedAt: new Date(),
        });
      }
      if (tx.toAccountId) {
        await Account.findByIdAndUpdate(tx.toAccountId, {
          $inc: { balance: -tx.amount },
          updatedAt: new Date(),
        });
      }
    }

    res.json({ success: true, message: 'Transaction deleted and balance adjusted' });
  } catch (error) {
    console.error('[Transactions DELETE Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

export default router;
