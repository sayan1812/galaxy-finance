import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';

export const IncomeExpenseChart: React.FC = () => {
  const { transactions, settings } = useTransactions();

  const data = useMemo(() => {
    const monthsData: { [key: string]: { monthKey: string; label: string; income: number; expense: number } } = {};
    const now = new Date();

    // Prepare last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('default', { month: 'short' });
      monthsData[key] = { monthKey: key, label, income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const key = t.date ? t.date.slice(0, 7) : '';
      if (monthsData[key]) {
        if (t.type === 'INCOME') {
          monthsData[key].income += t.amount;
        } else {
          monthsData[key].expense += t.amount;
        }
      }
    });

    return Object.values(monthsData);
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Monthly Income vs Expense
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            6-Month Cash Flow Trend
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis 
              dataKey="label" 
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const net = item.income - item.expense;
                  return (
                    <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl text-xs shadow-xl border border-slate-700 space-y-1">
                      <div className="font-bold text-slate-300">{item.label}</div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Income:</span>
                        <span className="font-bold">+{formatCurrency(item.income, settings.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-rose-400">
                        <span>Expense:</span>
                        <span className="font-bold">-{formatCurrency(item.expense, settings.currency)}</span>
                      </div>
                      <div className="border-t border-slate-700 pt-1 flex items-center justify-between gap-4 text-slate-200">
                        <span>Net:</span>
                        <span className={`font-extrabold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {net >= 0 ? '+' : ''}{formatCurrency(net, settings.currency)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} 
            />
            <Bar 
              name="Income" 
              dataKey="income" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={28} 
            />
            <Bar 
              name="Expense" 
              dataKey="expense" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={28} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
