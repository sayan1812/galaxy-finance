import React from 'react';
import { Edit3, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Budget } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { isSameMonth } from '../../utils/dateUtils';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
}) => {
  const { transactions, settings } = useTransactions();

  // Current month spent for this category (timezone-safe)
  const now = new Date();
  const spent = transactions
    .filter((t) => {
      if (t.type !== 'EXPENSE') return false;
      if (t.category.trim().toLowerCase() !== budget.category.trim().toLowerCase()) return false;
      return isSameMonth(t.date, now.getFullYear(), now.getMonth());
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget.monthlyLimit - spent;
  const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
  const clampedPercent = Math.min(percentage, 100);

  const isOverBudget = spent >= budget.monthlyLimit;
  const isNearLimit = percentage >= (settings.budgetAlertThreshold || 80) && !isOverBudget;

  const getStatusStyles = () => {
    if (isOverBudget) {
      return {
        progressBar: 'bg-rose-500',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        text: 'text-rose-600 dark:text-rose-400',
        label: 'Over Budget',
        icon: AlertCircle,
      };
    }
    if (isNearLimit) {
      return {
        progressBar: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        text: 'text-amber-600 dark:text-amber-400',
        label: 'Approaching Limit',
        icon: AlertTriangle,
      };
    }
    return {
      progressBar: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'On Track',
      icon: CheckCircle2,
    };
  };

  const status = getStatusStyles();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CategoryIcon categoryName={budget.category} size={22} />
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {budget.category}
            </h4>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.badge}`}>
              <StatusIcon size={12} />
              <span>{status.label}</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Edit Budget"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Delete Budget"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {formatPercentage(percentage)} used
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {remaining >= 0 ? (
              <span>{formatCurrency(remaining, settings.currency)} left</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                Exceeded by {formatCurrency(Math.abs(remaining), settings.currency)}
              </span>
            )}
          </span>
        </div>

        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status.progressBar}`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>

      {/* Financial Details Footer */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Spent this month</span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            {formatCurrency(spent, settings.currency)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Monthly Limit</span>
          <span className="font-bold text-sm text-slate-600 dark:text-slate-300">
            {formatCurrency(budget.monthlyLimit, settings.currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
