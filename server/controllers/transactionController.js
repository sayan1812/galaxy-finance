import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// GET /api/v1/transactions
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { type, accountId, category, limit = 100, page = 1 } = req.query;

    const filter = { userId };
    if (type) {
      filter.$or = [
        { type: type.toLowerCase() },
        { type: type.toUpperCase() },
      ];
    }
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
};

// POST /api/v1/transactions
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { 
      amount, 
      type, 
      accountId, 
      bankId,
      toAccountId, 
      paymentMethod = 'UPI', 
      category = 'General', 
      merchant = '', 
      description = '',
      notes = '', 
      receiptUrl = '',
      reference = '',
      transactionReference = '',
      date = new Date() 
    } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive transaction amount is required' });
    }

    const normType = String(type || 'EXPENSE').toUpperCase();
    const effectiveMethod = String(paymentMethod || '').toUpperCase();
    const isCash = effectiveMethod === 'CASH' || accountId === 'cash' || bankId === 'cash';

    // Resolve target account if provided
    let resolvedAccountId = isCash ? null : (accountId || bankId || null);
    if (resolvedAccountId === 'cash' || resolvedAccountId === 'cash-wallet') {
      resolvedAccountId = null;
    }

    const transaction = new Transaction({
      userId,
      amount: numAmount,
      type: normType,
      accountId: resolvedAccountId,
      toAccountId: normType === 'TRANSFER' ? (toAccountId || null) : null,
      paymentMethod: effectiveMethod || 'UPI',
      category: (category || (normType === 'TRANSFER' ? 'Transfer' : 'General')).trim(),
      merchant: (merchant || '').trim(),
      notes: (notes || description || '').trim(),
      receiptUrl: (receiptUrl || '').trim(),
      reference: (reference || transactionReference || '').trim(),
      date: date ? new Date(date) : new Date(),
    });

    await transaction.save();

    // Synchronize linked bank account balance in MongoDB Atlas
    if (resolvedAccountId && !isCash) {
      const account = await Account.findOne({ _id: resolvedAccountId, userId });
      if (account) {
        if (normType === 'INCOME') account.balance += numAmount;
        if (normType === 'EXPENSE') account.balance -= numAmount;
        if (normType === 'TRANSFER') account.balance -= numAmount;
        await account.save();
      }
    }

    // If transfer, credit destination account
    if (normType === 'TRANSFER' && toAccountId) {
      const toAccount = await Account.findOne({ _id: toAccountId, userId });
      if (toAccount) {
        toAccount.balance += numAmount;
        await toAccount.save();
      }
    }

    const populatedTx = await Transaction.findById(transaction._id)
      .populate('accountId', 'accountName accountType accountNumberMask balance')
      .populate('toAccountId', 'accountName accountType accountNumberMask balance');

    res.status(201).json({ success: true, transaction: populatedTx || transaction });
  } catch (err) {
    console.error('[Transactions CREATE Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT / PATCH /api/v1/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const oldTx = await Transaction.findOne({ _id: req.params.id, userId });
    if (!oldTx) return res.status(404).json({ error: 'Transaction not found' });

    const oldType = String(oldTx.type || '').toUpperCase();
    const oldMethod = String(oldTx.paymentMethod || '').toUpperCase();
    const oldIsCash = oldMethod === 'CASH';

    // 1. Reverse old transaction impact on linked account
    if (oldTx.accountId && !oldIsCash) {
      const oldAccount = await Account.findOne({ _id: oldTx.accountId, userId });
      if (oldAccount) {
        if (oldType === 'INCOME') oldAccount.balance -= Number(oldTx.amount);
        if (oldType === 'EXPENSE') oldAccount.balance += Number(oldTx.amount);
        if (oldType === 'TRANSFER') oldAccount.balance += Number(oldTx.amount);
        await oldAccount.save();
      }
    }

    if (oldType === 'TRANSFER' && oldTx.toAccountId) {
      const oldToAccount = await Account.findOne({ _id: oldTx.toAccountId, userId });
      if (oldToAccount) {
        oldToAccount.balance -= Number(oldTx.amount);
        await oldToAccount.save();
      }
    }

    // 2. Resolve new fields
    const newType = req.body.type ? String(req.body.type).toUpperCase() : oldType;
    const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : oldTx.amount;
    const newMethod = req.body.paymentMethod !== undefined ? String(req.body.paymentMethod).toUpperCase() : oldMethod;
    const newIsCash = newMethod === 'CASH';
    
    let newAccountId = oldTx.accountId;
    if (newIsCash) {
      newAccountId = null;
    } else if (req.body.accountId !== undefined) {
      newAccountId = req.body.accountId === 'cash' ? null : req.body.accountId;
    } else if (req.body.bankId !== undefined) {
      newAccountId = req.body.bankId === 'cash' ? null : req.body.bankId;
    }

    const newToAccountId = newType === 'TRANSFER' ? (req.body.toAccountId !== undefined ? req.body.toAccountId : oldTx.toAccountId) : null;

    oldTx.type = newType;
    oldTx.amount = newAmount;
    oldTx.paymentMethod = newMethod;
    oldTx.accountId = newAccountId;
    oldTx.toAccountId = newToAccountId;
    if (req.body.category !== undefined) oldTx.category = req.body.category.trim();
    if (req.body.merchant !== undefined) oldTx.merchant = req.body.merchant.trim();
    if (req.body.notes !== undefined || req.body.description !== undefined) {
      oldTx.notes = (req.body.notes !== undefined ? req.body.notes : req.body.description || '').trim();
    }
    if (req.body.receiptUrl !== undefined) oldTx.receiptUrl = req.body.receiptUrl.trim();
    if (req.body.reference !== undefined || req.body.transactionReference !== undefined) {
      oldTx.reference = (req.body.reference || req.body.transactionReference || '').trim();
    }
    if (req.body.date) oldTx.date = new Date(req.body.date);

    await oldTx.save();

    // 3. Apply new transaction impact
    if (newAccountId && !newIsCash) {
      const updatedAccount = await Account.findOne({ _id: newAccountId, userId });
      if (updatedAccount) {
        if (newType === 'INCOME') updatedAccount.balance += Number(newAmount);
        if (newType === 'EXPENSE') updatedAccount.balance -= Number(newAmount);
        if (newType === 'TRANSFER') updatedAccount.balance -= Number(newAmount);
        await updatedAccount.save();
      }
    }

    if (newType === 'TRANSFER' && newToAccountId) {
      const updatedToAccount = await Account.findOne({ _id: newToAccountId, userId });
      if (updatedToAccount) {
        updatedToAccount.balance += Number(newAmount);
        await updatedToAccount.save();
      }
    }

    const populatedTx = await Transaction.findById(oldTx._id)
      .populate('accountId', 'accountName accountType accountNumberMask balance')
      .populate('toAccountId', 'accountName accountType accountNumberMask balance');

    res.json({ success: true, transaction: populatedTx || oldTx });
  } catch (err) {
    console.error('[Transactions UPDATE Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/v1/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const txType = String(tx.type || '').toUpperCase();
    const txMethod = String(tx.paymentMethod || '').toUpperCase();
    const isCash = txMethod === 'CASH';

    // Reverse balance deduction/addition on linked account
    if (tx.accountId && !isCash) {
      const account = await Account.findOne({ _id: tx.accountId, userId });
      if (account) {
        if (txType === 'INCOME') account.balance -= Number(tx.amount);
        if (txType === 'EXPENSE') account.balance += Number(tx.amount);
        if (txType === 'TRANSFER') account.balance += Number(tx.amount);
        await account.save();
      }
    }

    if (txType === 'TRANSFER' && tx.toAccountId) {
      const toAccount = await Account.findOne({ _id: tx.toAccountId, userId });
      if (toAccount) {
        toAccount.balance -= Number(tx.amount);
        await toAccount.save();
      }
    }

    res.json({ success: true, message: 'Transaction removed and balances restored' });
  } catch (err) {
    console.error('[Transactions DELETE Error]:', err);
    res.status(500).json({ error: err.message });
  }
};
