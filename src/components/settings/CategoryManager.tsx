import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { AVAILABLE_ICONS, COLOR_PALETTE } from '../../constants/categories';
import { CategoryIcon } from '../common/CategoryIcon';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useTransactions();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'BOTH'>('EXPENSE');
  const [icon, setIcon] = useState('ShoppingCart');
  const [color, setColor] = useState('#10b981');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    const exists = categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      setError('A category with this name already exists');
      return;
    }

    addCategory({
      name: name.trim(),
      type,
      icon,
      color,
    });

    setName('');
    setIsAdding(false);
    setError('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Category Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize financial categories and icons
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold transition hover:bg-emerald-100 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* New Category Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              New Custom Category
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Pet Care, Charity, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE' | 'BOTH')}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          {/* Color Palette Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Choose Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Choose Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap max-h-24 overflow-y-auto p-1">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    icon === ic
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CategoryIcon iconName={ic} color={color} size={16} showBackground={false} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CategoryIcon categoryName={c.name} size={18} />
              <div className="min-w-0">
                <span className="block font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {c.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {c.type}
                </span>
              </div>
            </div>

            {c.isCustom && (
              <button
                onClick={() => deleteCategory(c.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Delete custom category"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
