import express from 'express';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

// GET /api/v1/accounts
router.get('/', authenticateOrDemo, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId }).sort({ updatedAt: -1 });

    // Seed default bank & cash accounts if user has none
    if (accounts.length === 0) {
      const defaultAccounts = await Account.create([
        {
          userId: req.userId,
          accountName: 'HDFC Corporate Vault',
          accountType: 'bank',
          balance: 245000,
          accountNumberMask: 'XXXX XXXX 4192',
        },
        {
          userId: req.userId,
          accountName: 'State Bank Reserve',
          accountType: 'bank',
          balance: 118500,
          accountNumberMask: 'XXXX XXXX 8831',
        },
        {
          userId: req.userId,
          accountName: 'Cash Reserve Wallet',
          accountType: 'cash',
          balance: 15400,
          accountNumberMask: 'PHYSICAL CASH',
        },
      ]);
      return res.json({ success: true, accounts: defaultAccounts });
    }

    res.json({ success: true, accounts });
  } catch (error) {
    console.error('[Accounts GET Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch accounts' });
  }
});

// POST /api/v1/accounts
router.post('/', authenticateOrDemo, async (req, res) => {
  try {
    const { accountName, accountType = 'bank', balance = 0, accountNumberMask = 'XXXX XXXX 0000' } = req.body;

    if (!accountName || !accountName.trim()) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    const account = await Account.create({
      userId: req.userId,
      accountName: accountName.trim(),
      accountType: accountType === 'cash' ? 'cash' : 'bank',
      balance: Number(balance) || 0,
      accountNumberMask: accountNumberMask.trim(),
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    console.error('[Accounts POST Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
});

// PATCH /api/v1/accounts/:id
router.patch('/:id', authenticateOrDemo, async (req, res) => {
  try {
    const { accountName, balance, accountNumberMask } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        ...(accountName && { accountName: accountName.trim() }),
        ...(balance !== undefined && { balance: Number(balance) }),
        ...(accountNumberMask && { accountNumberMask: accountNumberMask.trim() }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ success: true, account });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update account' });
  }
});

// DELETE /api/v1/accounts/:id
router.delete('/:id', authenticateOrDemo, async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    // Also cleanup associated transactions
    await Transaction.deleteMany({ accountId: req.params.id });

    res.json({ success: true, message: 'Account and associated records deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

export default router;
