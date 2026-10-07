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
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import { CustomChartTooltip } from './CustomChartTooltip';

export const DailyExpenseChart: React.FC = () => {
  const { transactions, settings } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';
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

      // Sum all expenses for this day
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

  // Bi-modal tokens
  const gridStroke = isDark ? 'rgba(137, 215, 183, 0.15)' : 'rgba(40, 122, 116, 0.12)';
  const tickColor = isDark ? 'rgba(255, 244, 225, 0.72)' : '#55A9A0';
  const axisColor = isDark ? 'rgba(137, 215, 183, 0.22)' : 'rgba(40, 122, 116, 0.18)';
  const cursorFill = isDark ? 'rgba(66, 132, 117, 0.2)' : 'rgba(174, 238, 211, 0.35)';
  const barFill = isDark ? '#FF8A8A' : '#D9534F';

  return (
    <div className="fin-card p-5 rounded-3xl flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[var(--text-headings)]">
            Daily Outflow Trajectory
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Avg {formatCurrency(avgDailyExpense, settings.currency)}/day • Total {formatCurrency(totalPeriodExpense, settings.currency)}
          </p>
        </div>

        {/* Days count toggle pills */}
        <div className="flex items-center p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
          {([7, 14, 30] as const).map((count) => (
            <button
              key={count}
              onClick={() => setDaysCount(count)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                daysCount === count
                  ? 'bg-[var(--accent-primary)] text-[var(--bg-page)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {count}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full chart-container-fluid">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.8} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 11, fill: tickColor }} 
              axisLine={{ stroke: axisColor }} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: tickColor }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => formatCompactCurrency(v, settings.currency)}
            />
            <Tooltip
              cursor={{ fill: cursorFill, radius: 6 }}
              offset={12}
              content={<CustomChartTooltip currency={settings.currency} type="daily" />}
            />
            <Bar 
              dataKey="amount" 
              name="Outflow"
              fill={barFill} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={24}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              className="transition-opacity hover:opacity-90 cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
