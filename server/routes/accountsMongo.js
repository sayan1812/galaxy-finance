import express from 'express';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';
import {
  getAccounts,
  createAccount,
  adjustBalance,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController.js';

const router = express.Router();

// GET /api/v1/accounts
router.get('/', authenticateOrDemo, getAccounts);

// POST /api/v1/accounts
router.post('/', authenticateOrDemo, createAccount);

// POST /api/v1/accounts/:id/adjust (and alias /balance for bank reconciliations)
router.post('/:id/adjust', authenticateOrDemo, adjustBalance);
router.post('/:id/balance', authenticateOrDemo, adjustBalance);

// PUT / PATCH /api/v1/accounts/:id
router.put('/:id', authenticateOrDemo, updateAccount);
router.patch('/:id', authenticateOrDemo, updateAccount);

// DELETE /api/v1/accounts/:id
router.delete('/:id', authenticateOrDemo, deleteAccount);

export { getAccounts, createAccount, adjustBalance, updateAccount, deleteAccount };
export default router;
