import React, { useState } from 'react';
import { 
  X, 
  Minus 
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

interface CashExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashExpenseModal: React.FC<CashExpenseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCashExpense, categories, cashBalance, settings } = useTransactions();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Restaurant');
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(timeStr);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive cash amount.');
      return;
    }

    addCashExpense({
      amount: parsedAmount,
      category,
      merchant: merchant.trim() || undefined,
      description: description.trim() || 'Cash expense',
      date,
      time,
    });

    // Reset and close
    setAmount('');
    setMerchant('');
    setDescription('');
    setError('');
    onClose();
  };

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.25)] p-6 text-left text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-400">
              <Minus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Record Cash Expense</span>
              </h2>
              <p className="text-xs text-slate-400">
                Wallet Available: <span className="font-black text-amber-400">{formatCurrency(cashBalance, settings.currency)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Cash Amount Spent (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-black text-lg">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xl font-black focus:border-rose-500 focus:outline-hidden"
                autoFocus
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer whitespace-nowrap"
                >
                  +₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Category / Reason
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-rose-500 focus:outline-hidden"
            >
              {categories
                .filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH')
                .map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-slate-900">
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Merchant / Paid To */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Merchant / Paid To (Optional)
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Chai Point, Auto Rickshaw, Vegetable Vendor"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Afternoon tea & biscuits"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-black shadow-md shadow-rose-500/20 transition cursor-pointer"
            >
              Deduct Cash Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
