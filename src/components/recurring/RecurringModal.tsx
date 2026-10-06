import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import type { 
  RecurringTransaction, 
  RecurringFrequency, 
  TransactionType, 
  PaymentMethod 
} from '../../types';
import { PAYMENT_METHODS } from '../../constants/categories';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  editingItem,
}) => {
  const { categories, addRecurring, updateRecurring, settings } = useTransactions();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [category, setCategory] = useState('Rent');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setType(editingItem.type);
      setAmount(editingItem.amount.toString());
      setPaymentMethod(editingItem.paymentMethod);
      setCategory(editingItem.category);
      setFrequency(editingItem.frequency);
      setStartDate(editingItem.startDate.split('T')[0]);
      setMerchant(editingItem.merchant || '');
      setDescription(editingItem.description || '');
    } else {
      setTitle('');
      setType('EXPENSE');
      setAmount('');
      setPaymentMethod('BANK_TRANSFER');
      setCategory('Rent');
      setFrequency('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setMerchant('');
      setDescription('');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please enter a title (e.g. Rent, Netflix, Salary)');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      amount: numAmount,
      paymentMethod,
      category,
      frequency,
      startDate: new Date(startDate).toISOString(),
      nextDueDate: new Date(startDate).toISOString(),
      isActive: true,
      merchant: merchant.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (editingItem) {
      updateRecurring(editingItem.id, payload);
    } else {
      addRecurring(payload);
    }

    onClose();
  };

  const availableCategories = categories.filter((c) => c.type === 'BOTH' || c.type === type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all text-left p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <RotateCcw size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Recurring Schedule' : 'New Recurring Transaction'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automate your recurring bills, subscriptions, or income
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Recurring Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                type === 'INCOME' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Recurring Income
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Title / Schedule Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Apartment Rent, Netflix 4K, Monthly Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          {/* Amount & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Amount ({settings.currency.code}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {settings.currency.symbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Next Due Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Payee / Merchant (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Landlord, Netflix, Employer"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Auto-debits from primary salary account on 1st of month"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Modal Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
            >
              <Check size={16} />
              <span>{editingItem ? 'Update Schedule' : 'Save Recurring Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
