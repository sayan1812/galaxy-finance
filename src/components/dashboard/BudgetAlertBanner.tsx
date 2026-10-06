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
        ? 'bg-[#13131A] border-[#E53935]/40 text-[#FBFBFB]'
        : 'bg-[#13131A] border-amber-500/30 text-[#FBFBFB]'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            overBudgetCount > 0 
              ? 'bg-[#4A121A] text-[#E53935] border border-[#E53935]/40' 
              : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
          }`}>
            {overBudgetCount > 0 ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-mono">
              {overBudgetCount > 0
                ? `${overBudgetCount} Category budget limit exceeded!`
                : `${alerts.length} Category approaching budget limit (≥${settings.budgetAlertThreshold}%)`}
            </h4>
            <div className="text-xs text-[#8E929D] mt-0.5 flex flex-wrap gap-2 font-mono">
              {alerts.slice(0, 3).map((a) => (
                <span key={a.category} className="inline-flex items-center gap-1 font-medium">
                  <strong className="text-[#FBFBFB]">{a.category}</strong>: {formatPercentage(a.percentage)} used ({formatCurrency(a.spent, settings.currency)} / {formatCurrency(a.budgetLimit, settings.currency)})
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
              ? 'btn-crimson'
              : 'bg-amber-500 hover:bg-amber-400 text-black font-bold'
          }`}
        >
          <span>View Budgets</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
