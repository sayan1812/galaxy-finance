import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

// GET /api/v1/users/me
router.get('/me', authenticateOrDemo, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/users/me
router.patch('/me', authenticateOrDemo, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/users/me (User Account Self-Deletion & Purge)
router.delete('/me', authenticateOrDemo, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If password provided or user has a custom password, verify it
    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password confirmation.' });
      }
    }

    const userId = req.userId;

    // Cascading purge: delete all transactions, accounts, and the user profile
    const [deletedTxs, deletedAccounts] = await Promise.all([
      Transaction.deleteMany({ userId }),
      Account.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.clearCookie('rupeewise_session');

    console.log(`[Account Purge]: Purged user ${userId} (${deletedAccounts.deletedCount} accounts, ${deletedTxs.deletedCount} transactions)`);

    res.json({
      success: true,
      message: 'Your account, bank vaults, and transaction telemetry have been permanently purged.',
      purged: {
        accounts: deletedAccounts.deletedCount,
        transactions: deletedTxs.deletedCount,
      },
    });
  } catch (err) {
    console.error('[User Purge Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to purge user account' });
  }
});

export default router;
