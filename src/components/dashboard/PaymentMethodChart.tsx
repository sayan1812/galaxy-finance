import React, { useMemo } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { PAYMENT_METHODS } from '../../constants/categories';
import type { PaymentMethod } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';
import { isSameMonth } from '../../utils/dateUtils';

export const PaymentMethodChart: React.FC = () => {
  const { transactions, settings } = useTransactions();

  const { methodStats, totalExpense } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const monthExpenses = transactions.filter((t) => {
      if (t.type !== 'EXPENSE') return false;
      return isSameMonth(t.date, curYear, curMonth);
    });

    const total = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const stats = PAYMENT_METHODS.map((pm) => {
      const amount = monthExpenses
        .filter((t) => t.paymentMethod === pm.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = total > 0 ? (amount / total) * 100 : 0;

      return {
        method: pm.id,
        label: pm.label,
        amount,
        percent,
      };
    }).sort((a, b) => b.amount - a.amount);

    return { methodStats: stats, totalExpense: total };
  }, [transactions]);

  const getMethodColor = (m: PaymentMethod) => {
    switch (m) {
      case 'UPI': return 'bg-[#E53935]';
      case 'CASH': return 'bg-[#4A121A]';
      case 'CREDIT_CARD': return 'bg-[#D32F2F]';
      case 'DEBIT_CARD': return 'bg-[#8E929D]';
      case 'BANK_TRANSFER': return 'bg-[#5A5D6B]';
      default: return 'bg-[#8E929D]';
    }
  };

  return (
    <div className="bg-[#13131A] p-5 rounded-3xl border border-[rgba(74,18,26,0.35)] shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#FBFBFB]">
            Payment Mode Spending
          </h3>
          <p className="text-xs text-[#8E929D] font-mono">
            This Month • Total {formatCurrency(totalExpense, settings.currency)}
          </p>
        </div>
      </div>

      {totalExpense > 0 ? (
        <div className="space-y-4">
          <div className="h-3 w-full bg-[#0D0D11] border border-white/[0.04] rounded-full overflow-hidden flex">
            {methodStats.map((item) => {
              if (item.percent <= 0) return null;
              return (
                <div
                  key={item.method}
                  style={{ width: `${item.percent}%` }}
                  className={`${getMethodColor(item.method)} h-full transition-all`}
                  title={`${item.label}: ${formatCurrency(item.amount, settings.currency)} (${formatPercentage(item.percent)})`}
                />
              );
            })}
          </div>

          <div className="space-y-2.5">
            {methodStats.map((item) => (
              <div key={item.method} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getMethodColor(item.method)}`} />
                  <PaymentMethodBadge method={item.method} size="sm" showIcon={false} />
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-[#FBFBFB]">
                    {formatCurrency(item.amount, settings.currency)}
                  </span>
                  <span className="text-[11px] text-[#8E929D] font-medium w-9 text-right">
                    {formatPercentage(item.percent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-[#8E929D]">
          Zero expense entries recorded for this month.
        </div>
      )}
    </div>
  );
};
