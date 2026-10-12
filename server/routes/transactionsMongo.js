import express from 'express';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// Prevent intermediate browser/PWA caching for real-time multi-device synchronization
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// GET /api/v1/transactions
router.get('/', authenticateOrDemo, getTransactions);

// POST /api/v1/transactions
router.post('/', authenticateOrDemo, createTransaction);

// PUT / PATCH /api/v1/transactions/:id
router.put('/:id', authenticateOrDemo, updateTransaction);
router.patch('/:id', authenticateOrDemo, updateTransaction);

// DELETE /api/v1/transactions/:id
router.delete('/:id', authenticateOrDemo, deleteTransaction);

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

export default router;
