import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: false,
    default: null,
    index: true,
  },
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide transaction amount'],
    min: [0, 'Amount must be positive'],
  },
  paymentMethod: {
    type: String,
    default: 'UPI',
    trim: true,
  },
  merchant: {
    type: String,
    default: '',
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'adjustment', 'ADJUSTMENT', 'INCOME', 'EXPENSE', 'TRANSFER'],
    required: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  receiptUrl: {
    type: String,
    default: '',
  },
  reference: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;
