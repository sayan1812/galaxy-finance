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
    <div className="fin-card bg-[#13131A] p-5 rounded-2xl border border-[rgba(74,18,26,0.35)] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#FBFBFB] tracking-tight">
            Monthly Cash Flow
          </h3>
          <p className="text-xs text-[#8E929D]">
            6-Month Inflow vs Outflow Telemetry
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8E929D" opacity={0.12} />
            <XAxis 
              dataKey="label" 
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const net = item.income - item.expense;
                  return (
                    <div className="bg-[#13131A] text-[#FBFBFB] px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-[rgba(74,18,26,0.5)] space-y-1.5 backdrop-blur-md">
                      <div className="font-semibold text-[#8E929D] uppercase tracking-wider text-[10px]">{item.label}</div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400 font-mono">
                        <span className="text-[#8E929D] font-sans">Inflow:</span>
                        <span className="font-bold">+{formatCurrency(item.income, settings.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-[#E53935] font-mono">
                        <span className="text-[#8E929D] font-sans">Outflow:</span>
                        <span className="font-bold">-{formatCurrency(item.expense, settings.currency)}</span>
                      </div>
                      <div className="border-t border-[rgba(255,255,255,0.08)] pt-1 flex items-center justify-between gap-4 text-[#FBFBFB] font-mono">
                        <span className="text-[#8E929D] font-sans">Net:</span>
                        <span className={`font-bold ${net >= 0 ? 'text-emerald-400' : 'text-[#E53935]'}`}>
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
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', color: '#8E929D' }}
            />
            <Bar 
              dataKey="income" 
              name="Inflow"
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={20}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="expense" 
              name="Outflow"
              fill="#E53935" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={20}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
