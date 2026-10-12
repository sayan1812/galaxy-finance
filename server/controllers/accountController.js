import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// GET /api/v1/accounts
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const accounts = await Account.find({ userId }).sort({ updatedAt: -1 });
    if (req.query.format === 'envelope') {
      return res.status(200).json({ success: true, accounts });
    }
    return res.status(200).json(accounts);
  } catch (error) {
    console.error('[Accounts GET Error]:', error);
    return res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
  }
};

// POST /api/v1/accounts
export const createAccount = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { 
      accountName, 
      accountType = 'bank', 
      balance = 0, 
      openingBalance, 
      accountNumberMask = 'XXXX XXXX 0000' 
    } = req.body;

    if (!accountName || !accountName.trim()) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    const initialBal = Number(balance) || 0;
    const account = await Account.create({
      userId,
      accountName: accountName.trim(),
      accountType: accountType === 'cash' ? 'cash' : 'bank',
      openingBalance: openingBalance !== undefined ? Number(openingBalance) : initialBal,
      balance: initialBal,
      accountNumberMask: accountNumberMask.trim(),
    });

    return res.status(201).json({ success: true, account });
  } catch (error) {
    console.error('[Accounts POST Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to create account' });
  }
};

// POST /api/v1/accounts/:id/adjust (and /api/banks/:id/balance)
export const adjustBalance = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { id } = req.params;
    const newBalance = Number(
      req.body.newBalance !== undefined 
        ? req.body.newBalance 
        : (req.body.balance !== undefined ? req.body.balance : req.body.amount)
    );
    const reason = req.body.reason || req.body.notes || 'Manual Balance Adjustment';

    if (isNaN(newBalance)) {
      return res.status(400).json({ error: 'Valid newBalance is required' });
    }

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const previousBalance = account.balance || 0;
    const diff = newBalance - previousBalance;

    // Persist new balance and reconciled opening balance
    account.balance = newBalance;
    account.openingBalance = newBalance;
    await account.save();

    // Optionally insert an auto-generated balancing transaction to preserve ledger auditing
    if (diff !== 0) {
      try {
        await Transaction.create({
          userId,
          accountId: account._id,
          amount: Math.abs(diff),
          merchant: 'Ledger Balance Adjustment',
          type: 'ADJUSTMENT',
          category: 'Adjustment',
          notes: `${reason} (Adjusted from ₹${previousBalance.toLocaleString('en-IN')} to ₹${newBalance.toLocaleString('en-IN')})`,
          date: new Date(),
        });
      } catch (tErr) {
        console.warn('[Adjust Balance Transaction Warning]:', tErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      account,
      message: 'Account balance successfully adjusted and persisted',
    });
  } catch (error) {
    console.error('[Adjust Balance Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to adjust balance' });
  }
};

// PUT / PATCH /api/v1/accounts/:id
export const updateAccount = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { id } = req.params;
    const { 
      accountName, 
      balance, 
      newBalance, 
      openingBalance, 
      accountNumberMask 
    } = req.body;

    const targetBalance = newBalance !== undefined 
      ? Number(newBalance) 
      : (balance !== undefined ? Number(balance) : undefined);

    const updateFields = {
      ...(accountName && { accountName: accountName.trim() }),
      ...(targetBalance !== undefined && { balance: targetBalance, openingBalance: targetBalance }),
      ...(openingBalance !== undefined && targetBalance === undefined && { openingBalance: Number(openingBalance) }),
      ...(accountNumberMask && { accountNumberMask: accountNumberMask.trim() }),
      updatedAt: new Date(),
    };

    const account = await Account.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json({ success: true, account });
  } catch (error) {
    console.error('[Update Account Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to update account' });
  }
};

// DELETE /api/v1/accounts/:id
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { id } = req.params;

    const account = await Account.findOneAndDelete({ _id: id, userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Cleanup associated transactions
    await Transaction.deleteMany({ accountId: id, userId });

    return res.status(200).json({ 
      success: true, 
      message: 'Account and associated records deleted' 
    });
  } catch (error) {
    console.error('[Delete Account Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete account' });
  }
};

export default {
  getAccounts,
  createAccount,
  adjustBalance,
  updateAccount,
  deleteAccount,
};
