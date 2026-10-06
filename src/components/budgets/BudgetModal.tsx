import React, { useState, useEffect } from 'react';
import { X, Check, PiggyBank } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import type { Budget } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editingBudget,
}) => {
  const { categories, addBudget, updateBudget, settings } = useTransactions();
  const [category, setCategory] = useState<string>('Food & Restaurant');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('5000');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setMonthlyLimit(editingBudget.monthlyLimit.toString());
    } else {
      setCategory('Food & Restaurant');
      setMonthlyLimit('5000');
    }
    setError('');
  }, [editingBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);

    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid monthly budget limit greater than 0');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, limit);
    } else {
      addBudget(category, limit);
    }

    onClose();
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all text-left p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track monthly spending limits
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

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!editingBudget}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none disabled:opacity-60 cursor-pointer"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Limit Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Monthly Limit ({settings.currency.code})
            </label>
            <div className="relative rounded-xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 bg-white dark:bg-slate-950">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-lg font-bold text-slate-400">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                min="100"
                step="50"
                placeholder="5000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                autoFocus
                required
                className="w-full pl-9 pr-3 py-2.5 text-lg font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[2000, 3000, 5000, 8000, 10000, 15000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlyLimit(preset.toString())}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                >
                  {settings.currency.symbol}{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span>{editingBudget ? 'Update Budget' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
