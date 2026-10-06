import React, { useState } from 'react';
import { Plus, PiggyBank } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import type { Budget } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { ConfirmModal } from '../components/layout/ConfirmModal';

export const BudgetsPage: React.FC = () => {
  const { budgets, deleteBudget, getBudgetStatusList, settings } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const budgetStatuses = getBudgetStatusList();

  const totalBudgeted = budgets.reduce((sum: number, b: Budget) => sum + b.monthlyLimit, 0);
  const totalSpent = budgetStatuses.reduce((sum: number, b) => sum + b.spent, 0);
  const overallRemaining = totalBudgeted - totalSpent;
  const overallPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteBudget(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Category Budgets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set spending targets and prevent overspending with automated warnings
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Overview Stat Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Budget Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(totalSpent, settings.currency)}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {formatCurrency(totalBudgeted, settings.currency)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {overallRemaining >= 0
                ? `${formatCurrency(overallRemaining, settings.currency)} remaining across all category budgets`
                : `Exceeded total budget allocation by ${formatCurrency(Math.abs(overallRemaining), settings.currency)}`}
            </p>
          </div>

          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPercentage(overallPercent)}
            </span>
            <span className="block text-[11px] text-slate-400">overall utilized</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercent >= 100
                ? 'bg-rose-500'
                : overallPercent >= (settings.budgetAlertThreshold || 80)
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Budgets Grid */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b: Budget) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PiggyBank size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Budgets Set Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first budget (e.g. Food: ₹5,000, Shopping: ₹3,000) to keep your monthly spending under control.
          </p>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Create Category Budget
          </button>
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        editingBudget={editingBudget}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Budget Target?"
        message="Are you sure you want to remove this category budget? Existing transaction records will not be deleted."
        confirmLabel="Remove Budget"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
