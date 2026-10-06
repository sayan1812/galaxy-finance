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

  return (
    <div className="bg-[#13131A] p-5 rounded-3xl border border-[rgba(74,18,26,0.35)] shadow-md flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#FBFBFB]">
            Daily Outflow Trajectory
          </h3>
          <p className="text-xs text-[#8E929D] font-mono">
            Avg {formatCurrency(avgDailyExpense, settings.currency)}/day • Total {formatCurrency(totalPeriodExpense, settings.currency)}
          </p>
        </div>

        {/* Days count toggle pills */}
        <div className="flex items-center p-1 bg-[#0D0D11] border border-white/[0.06] rounded-xl">
          {([7, 14, 30] as const).map((count) => (
            <button
              key={count}
              onClick={() => setDaysCount(count)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                daysCount === count
                  ? 'bg-[#D32F2F] text-[#FBFBFB] shadow-xs'
                  : 'text-[#8E929D] hover:text-[#FBFBFB]'
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 11, fill: '#8E929D' }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#8E929D' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(v) => formatCompactCurrency(v, settings.currency)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(74, 18, 26, 0.25)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#13131A] text-[#FBFBFB] px-3 py-2 rounded-xl text-xs shadow-2xl border border-[rgba(74,18,26,0.5)]">
                      <div className="font-mono text-[#8E929D]">{data.displayDate}</div>
                      <div className="font-bold font-mono text-sm text-[#E53935] mt-0.5">
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
              fill="#E53935" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={36} 
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
