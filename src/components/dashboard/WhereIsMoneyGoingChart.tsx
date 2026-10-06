import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { 
  TrendingDown
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import type { PaymentMethod } from '../../types';

export const WhereIsMoneyGoingChart: React.FC = () => {
  const { transactions, settings } = useTransactions();

  // Aggregate spending by payment method across all expense transactions
  const data = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const methods: { method: PaymentMethod; label: string; color: string }[] = [
      { method: 'UPI', label: 'UPI / QR', color: '#E53935' },
      { method: 'DEBIT_CARD', label: 'Debit Card', color: '#8E929D' },
      { method: 'CREDIT_CARD', label: 'Credit Card', color: '#D32F2F' },
      { method: 'CASH', label: 'Cash Wallet', color: '#4A121A' },
      { method: 'BANK_TRANSFER', label: 'Bank Transfer', color: '#5A5D6B' },
    ];

    return methods.map((m) => {
      const amount = expenses
        .filter((t) => t.paymentMethod === m.method)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;

      return {
        name: m.label,
        method: m.method,
        amount,
        percentage: Math.round(percentage * 10) / 10,
        color: m.color,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalSpent = React.useMemo(() => {
    return data.reduce((s, d) => s + d.amount, 0);
  }, [data]);

  return (
    <div className="fin-card p-6 sm:p-7 rounded-3xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-xl backdrop-blur-xl text-left text-[#FBFBFB] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-black tracking-tight text-[#FBFBFB] flex items-center gap-2">
            <TrendingDown size={18} className="text-[#E53935]" />
            <span>Outflow Channel Distribution</span>
          </h3>
          <p className="text-xs text-[#8E929D] mt-0.5">
            Spending distribution across payment channels
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">
            Total Analyzed
          </span>
          <span className="text-sm font-black font-mono text-[#FBFBFB]">
            {formatCurrency(totalSpent, settings.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bars / Breakdown Grid */}
      <div className="space-y-3.5 my-5">
        {data.map((item) => (
          <div key={item.method} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="font-bold text-[#FBFBFB]">{item.name}</span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="font-black text-[#FBFBFB]">
                  {formatCurrency(item.amount, settings.currency)}
                </span>
                <span className="text-[11px] text-[#8E929D] w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Glowing Bar */}
            <div className="w-full h-2 rounded-full bg-[#0D0D11] border border-white/[0.04] overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${Math.max(2, item.percentage)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mini Bar Chart */}
      <div className="h-32 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke="#8E929D" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#8E929D" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-[#13131A] border border-[rgba(74,18,26,0.5)] text-xs shadow-2xl text-[#FBFBFB]">
                      <span className="font-bold block">{d.name}</span>
                      <span className="font-black font-mono text-[#E53935]">{formatCurrency(d.amount, settings.currency)}</span>
                      <span className="text-[10px] text-[#8E929D] block">{d.percentage}% of total outflows</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="amount" 
              radius={[6, 6, 0, 0]}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
