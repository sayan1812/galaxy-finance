import express from 'express';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

// GET /api/v1/accounts
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId; // Extracted strictly from verified JWT
    const accounts = await Account.find({ userId }).sort({ updatedAt: -1 });
    if (req.query.format === 'envelope') {
      return res.status(200).json({ success: true, accounts });
    }
    res.status(200).json(accounts);
  } catch (error) {
    console.error('[Accounts GET Error]:', error);
    res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
  }
};

router.get('/', authenticateOrDemo, getAccounts);

// POST /api/v1/accounts
router.post('/', authenticateOrDemo, async (req, res) => {
  try {
    const { accountName, accountType = 'bank', balance = 0, openingBalance, accountNumberMask = 'XXXX XXXX 0000' } = req.body;

    if (!accountName || !accountName.trim()) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    const initialBal = Number(balance) || 0;
    const account = await Account.create({
      userId: req.userId,
      accountName: accountName.trim(),
      accountType: accountType === 'cash' ? 'cash' : 'bank',
      openingBalance: openingBalance !== undefined ? Number(openingBalance) : initialBal,
      balance: initialBal,
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
    const { accountName, balance, openingBalance, accountNumberMask } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        ...(accountName && { accountName: accountName.trim() }),
        ...(balance !== undefined && { balance: Number(balance) }),
        ...(openingBalance !== undefined && { openingBalance: Number(openingBalance) }),
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
    // Also cleanup associated transactions scoped to this user
    await Transaction.deleteMany({ accountId: req.params.id, userId: req.userId });

    res.json({ success: true, message: 'Account and associated records deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
});

export default router;
