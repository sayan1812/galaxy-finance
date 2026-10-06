import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { isSameMonth } from '../../utils/dateUtils';

interface YearCalendarProps {
  year: number;
  onSelectMonth: (monthIndex: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const YearCalendar: React.FC<YearCalendarProps> = ({ year, onSelectMonth }) => {
  const { transactions, settings } = useTransactions();

  // Aggregate by month (0-11)
  const monthStats = React.useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const monthTxns = transactions.filter((t) => isSameMonth(t.date, year, idx));

      const income = monthTxns
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTxns
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;

      return {
        monthIndex: idx,
        name,
        income,
        expense,
        net,
        count: monthTxns.length,
      };
    });
  }, [transactions, year]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {monthStats.map((m) => (
        <div
          key={m.name}
          onClick={() => onSelectMonth(m.monthIndex)}
          className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {m.name} {year}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              {m.count} txns
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ArrowDownLeft size={13} className="text-emerald-500" />
                <span>Income</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(m.income, settings.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ArrowUpRight size={13} className="text-rose-500" />
                <span>Expense</span>
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{formatCurrency(m.expense, settings.currency)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold">
              <span>Net Savings:</span>
              <span
                className={
                  m.net >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {m.net >= 0 ? '+' : ''}{formatCurrency(m.net, settings.currency)}
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-end text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>View Month</span>
            <ChevronRight size={13} />
          </div>
        </div>
      ))}
    </div>
  );
};
