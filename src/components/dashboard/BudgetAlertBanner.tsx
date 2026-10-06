import React from 'react';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface BudgetAlertBannerProps {
  onViewBudgets: () => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({ onViewBudgets }) => {
  const { getBudgetStatusList, settings } = useTransactions();

  if (!settings.enableBudgetAlerts) return null;

  const budgetStatuses = getBudgetStatusList();
  const alerts = budgetStatuses.filter((b) => b.isOverBudget || b.isNearLimit);

  if (alerts.length === 0) return null;

  const overBudgetCount = alerts.filter((b) => b.isOverBudget).length;

  return (
    <div className={`p-4 rounded-3xl border transition-all ${
      overBudgetCount > 0
        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
        : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            overBudgetCount > 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300'
          }`}>
            {overBudgetCount > 0 ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold">
              {overBudgetCount > 0
                ? `${overBudgetCount} Category budget limit exceeded!`
                : `${alerts.length} Category approaching budget limit (≥${settings.budgetAlertThreshold}%)`}
            </h4>
            <div className="text-xs opacity-90 mt-0.5 flex flex-wrap gap-2">
              {alerts.slice(0, 3).map((a) => (
                <span key={a.category} className="inline-flex items-center gap-1 font-medium">
                  <strong>{a.category}</strong>: {formatPercentage(a.percentage)} used ({formatCurrency(a.spent, settings.currency)} / {formatCurrency(a.budgetLimit, settings.currency)})
                </span>
              ))}
              {alerts.length > 3 && (
                <span>+{alerts.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onViewBudgets}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
            overBudgetCount > 0
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
          }`}
        >
          <span>Manage Budgets</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
