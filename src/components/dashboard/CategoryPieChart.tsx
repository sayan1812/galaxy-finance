import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { isSameMonth } from '../../utils/dateUtils';

const CRIMSON_NOIR_PALETTE = [
  '#E53935', // Vivid Crimson Ruby
  '#4A121A', // Deep Wine
  '#8E929D', // Cool Steel Slate
  '#D32F2F', // Primary Crimson
  '#5C1721', // Wine Rich
  '#626673', // Slate Deep
  '#B71C1C', // Dark Crimson
  '#A8ABB5', // Light Steel
  '#3A0D14', // Pitch Wine
];

export const CategoryPieChart: React.FC = () => {
  const { transactions, categories, settings } = useTransactions();

  const { categoryData, totalExpense } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // Current month expenses (timezone-safe)
    const monthExpenses = transactions.filter((t) => {
      if (t.type !== 'EXPENSE') return false;
      return isSameMonth(t.date, curYear, curMonth);
    });

    const total = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const map: { [cat: string]: number } = {};
    monthExpenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(map)
      .map(([name, value], index) => {
        const catObj = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
        const fallbackColor = CRIMSON_NOIR_PALETTE[index % CRIMSON_NOIR_PALETTE.length];
        return {
          name,
          value,
          color: catObj?.color || fallbackColor,
          percent: total > 0 ? (value / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions, categories]);

  return (
    <div className="bg-[#13131A] p-5 rounded-3xl border border-[rgba(74,18,26,0.35)] shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#FBFBFB]">
            Monthly Category Allocation
          </h3>
          <p className="text-xs text-[#8E929D]">
            Total: <strong className="text-[#FBFBFB] font-mono">{formatCurrency(totalExpense, settings.currency)}</strong>
          </p>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-[#8E929D]">
          Zero expense entries recorded for this month.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Donut Chart */}
          <div className="h-56 w-56 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={600}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0D0D11" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#13131A] text-[#FBFBFB] px-3 py-2 rounded-xl text-xs shadow-2xl border border-[rgba(74,18,26,0.5)]">
                          <div className="font-semibold">{data.name}</div>
                          <div className="font-bold font-mono text-[#E53935]">
                            {formatCurrency(data.value, settings.currency)}
                          </div>
                          <div className="text-[10px] text-[#8E929D] font-mono">
                            {formatPercentage(data.percent)} of total
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[#8E929D] font-mono uppercase tracking-wider">Month</span>
              <span className="text-xs font-black font-mono text-[#FBFBFB] max-w-[80px] truncate text-center">
                {formatCurrency(totalExpense, settings.currency)}
              </span>
            </div>
          </div>

          {/* Interactive Legends */}
          <div className="flex-1 w-full space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categoryData.slice(0, 6).map((item) => (
              <div 
                key={item.name}
                className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-[#8E929D] font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono flex-shrink-0">
                  <span className="font-bold text-[#FBFBFB]">
                    {formatCurrency(item.value, settings.currency)}
                  </span>
                  <span className="text-[10px] text-[#8E929D] w-9 text-right">
                    {formatPercentage(item.percent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
