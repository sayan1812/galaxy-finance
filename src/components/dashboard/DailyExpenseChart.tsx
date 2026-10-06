import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

export const DailyExpenseChart: React.FC = () => {
  const { transactions, settings } = useTransactions();
  const [daysCount, setDaysCount] = useState<7 | 14 | 30>(7);

  const chartData = useMemo(() => {
    const data: { date: string; displayDate: string; amount: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const displayDate = d.toLocaleDateString('en-IN', {
        weekday: daysCount === 7 ? 'short' : undefined,
        day: 'numeric',
        month: daysCount > 7 ? 'short' : undefined,
      });

      // Sum all expenses for this day (timezone-safe key comparison)
      const dayExpense = transactions
        .filter((t) => {
          if (t.type !== 'EXPENSE') return false;
          return t.date && t.date.slice(0, 10) === dateKey;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        date: dateKey,
        displayDate,
        amount: dayExpense,
      });
    }

    return data;
  }, [transactions, daysCount]);

  const totalPeriodExpense = chartData.reduce((sum, d) => sum + d.amount, 0);
  const avgDailyExpense = Math.round(totalPeriodExpense / daysCount);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Daily Expense Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Avg {formatCurrency(avgDailyExpense, settings.currency)}/day • Total {formatCurrency(totalPeriodExpense, settings.currency)}
          </p>
        </div>

        {/* Days count toggle pills */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {([7, 14, 30] as const).map((count) => (
            <button
              key={count}
              onClick={() => setDaysCount(count)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                daysCount === count
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {count}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => formatCompactCurrency(v, settings.currency)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
                      <div className="font-medium text-slate-400">{data.displayDate}</div>
                      <div className="font-extrabold text-sm text-emerald-400 mt-0.5">
                        {formatCurrency(data.amount, settings.currency)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="amount" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={36} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
