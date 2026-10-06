import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCompactCurrency } from '../../utils/formatters';
import type { Transaction } from '../../types';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-11
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  customTransactions?: Transaction[];
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  year,
  month,
  selectedDate,
  onSelectDate,
  customTransactions,
}) => {
  const { transactions: ctxTransactions, settings } = useTransactions();
  const transactions = customTransactions || ctxTransactions;

  // Helper to format 2-digit number
  const pad = (n: number) => n.toString().padStart(2, '0');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1);
  const startingDay = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Map transactions by YYYY-MM-DD
  const transactionsByDate = React.useMemo(() => {
    const map = new Map<string, { income: number; expense: number; txns: Transaction[]; hasCash: boolean; hasOnline: boolean }>();

    transactions.forEach((tx) => {
      const dStr = tx.date ? tx.date.slice(0, 10) : '';
      if (!dStr) return;

      const current = map.get(dStr) || { income: 0, expense: 0, txns: [], hasCash: false, hasOnline: false };
      current.txns.push(tx);
      if (tx.type === 'INCOME') {
        current.income += tx.amount;
      } else {
        current.expense += tx.amount;
      }
      if (tx.paymentMethod === 'CASH') {
        current.hasCash = true;
      } else {
        current.hasOnline = true;
      }
      map.set(dStr, current);
    });

    return map;
  }, [transactions]);

  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days grid construction
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${pad(prevMonthDate.getMonth() + 1)}-${pad(dayNum)}`;
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextMonthDate = new Date(year, month + 1, dayNum);
      const dateStr = `${nextMonthDate.getFullYear()}-${pad(nextMonthDate.getMonth() + 1)}-${pad(dayNum)}`;
      calendarCells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
      });
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center py-2.5">
        {weekDayLabels.map((lbl, idx) => (
          <div
            key={lbl}
            className={`text-xs font-bold uppercase tracking-wider ${
              idx >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {lbl}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
        {calendarCells.map((cell) => {
          const stats = transactionsByDate.get(cell.dateStr);
          const hasTransactions = Boolean(stats && stats.txns.length > 0);
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;

          const income = stats ? stats.income : 0;
          const expense = stats ? stats.expense : 0;
          const net = income - expense;

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[78px] sm:min-h-[96px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer select-none group relative ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/40 dark:bg-slate-950/40 opacity-40 hover:opacity-80'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              } ${isSelected ? 'ring-2 ring-emerald-500 z-10 bg-emerald-50/20 dark:bg-emerald-950/30' : ''}`}
            >
              {/* Day Number and Method Badges */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isToday
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-600'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {/* Cash & Online Dot Indicators */}
                {hasTransactions && (
                  <div className="flex items-center gap-1">
                    {stats?.hasCash && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-500"
                        title="Contains Cash transaction"
                      />
                    )}
                    {stats?.hasOnline && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                        title="Contains Online (UPI/Card/Bank) transaction"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Day Totals Summary */}
              {hasTransactions ? (
                <div className="mt-1 space-y-0.5 text-right overflow-hidden">
                  {income > 0 && (
                    <div className="text-[10px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                      +{formatCompactCurrency(income, settings.currency)}
                    </div>
                  )}
                  {expense > 0 && (
                    <div className="text-[10px] sm:text-xs font-extrabold text-rose-600 dark:text-rose-400 truncate">
                      -{formatCompactCurrency(expense, settings.currency)}
                    </div>
                  )}

                  {/* Net badge indicator */}
                  <div
                    className={`text-[9px] font-semibold px-1 py-0.2 rounded-md inline-block ${
                      net >= 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    Net: {net >= 0 ? '+' : ''}{formatCompactCurrency(net, settings.currency)}
                  </div>
                </div>
              ) : (
                <div className="hidden group-hover:block text-[10px] text-slate-300 dark:text-slate-600 text-center py-2">
                  + Add
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
