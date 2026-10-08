import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  FileText 
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import type { TransactionType } from '../../types';
import { getLocalDateTimeInputValue } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';

export const CashTransactionModal: React.FC = () => {
  const {
    isAddCashModalOpen,
    setIsAddCashModalOpen,
    addCashTransaction,
    categories,
    settings,
  } = useTransactions();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Restaurant');
  const [dateTime, setDateTime] = useState<string>(getLocalDateTimeInputValue());
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isAddCashModalOpen) {
      setType('EXPENSE');
      setAmount('');
      setCategory('Food & Restaurant');
      setDateTime(getLocalDateTimeInputValue());
      setMerchant('');
      setDescription('');
      setError('');
    }
  }, [isAddCashModalOpen]);

  const handleClose = () => {
    setIsAddCashModalOpen(false);
  };

  const handleAddAmount = (val: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount((cur + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid cash amount greater than 0');
      return;
    }

    const d = new Date(dateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    addCashTransaction({
      amount: num,
      type,
      category,
      merchant: merchant.trim() || undefined,
      description: description.trim() || undefined,
      date: dateStr,
      time: timeStr,
    });

    handleClose();
  };

  if (!isAddCashModalOpen) return null;

  const availableCategories = categories.filter(
    (c) => c.type === 'BOTH' || c.type === type
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-500/40 dark:border-emerald-500/40 overflow-hidden my-auto transform transition-all text-left flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Banknote size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Cash Transaction
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Manual Entry
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immediately updates Cash Balance & financial reports
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense or Income */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight size={16} />
              <span>Cash Expense (Spent)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft size={16} />
              <span>Cash Income (Received)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Cash Amount ({settings?.currency?.code || 'INR'}) *
            </label>
            <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors bg-white dark:bg-slate-950">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-bold text-slate-400 dark:text-slate-500 select-none">
                {settings?.currency?.symbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-12 pr-4 py-3 text-2xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 bg-transparent focus:outline-none"
              />
            </div>

            {/* Quick Cash Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[20, 50, 100, 200, 500, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                >
                  {settings?.currency?.symbol || '₹'}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category / Reason *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <CategoryIcon categoryName={cat.name} size={15} />
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Person / Merchant */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Person / Shop / Vendor (Optional)
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Chai stall, Auto driver, Vegetable vendor, Friend"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date & Time *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDateTime(getLocalDateTimeInputValue())}
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Now
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setDateTime(getLocalDateTimeInputValue(y));
                  }}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description / Note (Optional)
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder='e.g. "Lunch", "Auto fare to market", "Milk packets"'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Check size={18} />
              <span>Record Cash Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
