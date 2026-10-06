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
      .map(([name, value]) => {
        const catObj = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          value,
          color: catObj?.color || '#94a3b8',
          percent: total > 0 ? (value / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions, categories]);

  if (categoryData.length === 0 || totalExpense === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col items-center justify-center min-h-[320px] text-center">
        <p className="text-xs font-semibold text-slate-400">No expenses recorded this month yet</p>
      </div>
    );
  }

  // Top 5 categories + Others for clean display in legend
  const topCategories = categoryData.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This Month • Total {formatCurrency(totalExpense, settings.currency)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
        {/* Donut Chart */}
        <div className="h-52 w-52 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
                        <div className="font-semibold text-slate-200">{data.name}</div>
                        <div className="font-extrabold text-sm text-emerald-400 mt-0.5">
                          {formatCurrency(data.value, settings.currency)} ({formatPercentage(data.percent)})
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Total
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {formatCurrency(totalExpense, settings.currency)}
            </span>
          </div>
        </div>

        {/* Categories Legend List */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {topCategories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-right">
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(cat.value, settings.currency)}
                </span>
                <span className="text-[10px] text-slate-400 w-8 text-right">
                  {formatPercentage(cat.percent)}
                </span>
              </div>
            </div>
          ))}
          {categoryData.length > 5 && (
            <div className="text-[11px] text-slate-400 pt-1 text-right">
              +{categoryData.length - 5} more categories
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
