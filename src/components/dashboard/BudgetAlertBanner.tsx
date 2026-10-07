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
    <div className={`p-4 rounded-3xl border transition-all fin-card ${
      overBudgetCount > 0
        ? 'bg-[var(--card-bg)] border-rose-500/40 text-[var(--text-primary)]'
        : 'bg-[var(--card-bg)] border-amber-500/40 text-[var(--text-primary)]'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            overBudgetCount > 0 
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' 
              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
          }`}>
            {overBudgetCount > 0 ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-mono text-[var(--text-headings)]">
              {overBudgetCount > 0
                ? `${overBudgetCount} Category budget limit exceeded!`
                : `${alerts.length} Category approaching budget limit (≥${settings.budgetAlertThreshold}%)`}
            </h4>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex flex-wrap gap-2 font-mono">
              {alerts.slice(0, 3).map((a) => (
                <span key={a.category} className="inline-flex items-center gap-1 font-medium">
                  <strong className="text-[var(--text-primary)]">{a.category}</strong>: {formatPercentage(a.percentage)} used ({formatCurrency(a.spent, settings.currency)} / {formatCurrency(a.budgetLimit, settings.currency)})
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
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'btn-primary'
          }`}
        >
          <span>View Budgets</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
