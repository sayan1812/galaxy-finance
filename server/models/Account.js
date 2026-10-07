import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  accountName: {
    type: String,
    required: [true, 'Please provide account name'],
    trim: true,
  },
  accountType: {
    type: String,
    enum: ['bank', 'cash'],
    default: 'bank',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  accountNumberMask: {
    type: String,
    default: 'XXXX XXXX 0000',
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.pre('save', function () {
  this.updatedAt = new Date();
});

export const Account = mongoose.models.Account || mongoose.model('Account', accountSchema);
export default Account;
