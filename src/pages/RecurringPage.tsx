import React, { useState } from 'react';
import { Plus, RotateCcw, CheckCircle2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import type { RecurringTransaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { RecurringItem } from '../components/recurring/RecurringItem';
import { RecurringModal } from '../components/recurring/RecurringModal';
import { ConfirmModal } from '../components/layout/ConfirmModal';

export const RecurringPage: React.FC = () => {
  const { 
    recurring, 
    deleteRecurring, 
    processRecurringItem, 
    dueRecurringCount,
    settings 
  } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate monthly commitments
  const monthlyExpenses = recurring
    .filter((r: RecurringTransaction) => r.isActive && r.type === 'EXPENSE')
    .reduce((sum: number, r: RecurringTransaction) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'yearly') return sum + r.amount / 12;
      return sum + r.amount;
    }, 0);

  const monthlyIncome = recurring
    .filter((r: RecurringTransaction) => r.isActive && r.type === 'INCOME')
    .reduce((sum: number, r: RecurringTransaction) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'yearly') return sum + r.amount / 12;
      return sum + r.amount;
    }, 0);

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleProcessAllDue = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    recurring
      .filter((r: RecurringTransaction) => r.isActive && new Date(r.nextDueDate) <= today)
      .forEach((r: RecurringTransaction) => processRecurringItem(r.id));
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteRecurring(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Financial Transactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automate monthly salary, flat rent, subscriptions (Netflix, Prime), and utility bills
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dueRecurringCount > 0 && (
            <button
              onClick={handleProcessAllDue}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Process All Due ({dueRecurringCount})</span>
            </button>
          )}

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Recurring</span>
          </button>
        </div>
      </div>

      {/* Commitments Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fixed Monthly Inflow */}
        <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Estimated Monthly Recurring Inflow
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(monthlyIncome, settings.currency)}
            </div>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/60 mt-0.5">
              Salary, business retainers, recurring investments
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        {/* Fixed Monthly Outflow */}
        <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              Estimated Monthly Recurring Outflow
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(monthlyExpenses, settings.currency)}
            </div>
            <p className="text-[11px] text-rose-700/70 dark:text-rose-400/60 mt-0.5">
              Rent, EMIs, Broadband, Netflix subscriptions
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      {/* List of Recurring Items */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Active Schedules ({recurring.length})
        </h3>

        {recurring.length > 0 ? (
          <div className="space-y-3">
            {recurring.map((item: RecurringTransaction) => (
              <RecurringItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <RotateCcw size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No Recurring Transactions Configured
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add recurring entries like monthly rent, subscriptions, or salaries so you never miss logging them.
            </p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Add First Recurring Item
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Recurring Schedule?"
        message="Are you sure you want to remove this recurring schedule? Transactions already generated in your history will remain intact."
        confirmLabel="Remove Schedule"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
