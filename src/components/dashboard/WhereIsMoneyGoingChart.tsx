import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import type { PaymentMethod } from '../../types';
import { CustomChartTooltip } from './CustomChartTooltip';

export const WhereIsMoneyGoingChart: React.FC = () => {
  const { transactions, settings } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Aggregate spending by payment method across all expense transactions
  const data = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'EXPENSE');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const darkColors: Record<PaymentMethod, string> = {
      UPI: '#89D7B7',
      DEBIT_CARD: '#428475',
      CREDIT_CARD: '#FF8A8A',
      CASH: '#FFF4E1',
      BANK_TRANSFER: 'rgba(137, 215, 183, 0.45)',
      OTHER: 'rgba(255, 244, 225, 0.45)',
    };

    const lightColors: Record<PaymentMethod, string> = {
      UPI: '#287A74',
      DEBIT_CARD: '#55A9A0',
      CREDIT_CARD: '#D9534F',
      CASH: '#AEEED3',
      BANK_TRANSFER: 'rgba(40, 122, 116, 0.35)',
      OTHER: 'rgba(20, 56, 52, 0.35)',
    };

    const colorMap = isDark ? darkColors : lightColors;

    const methods: { method: PaymentMethod; label: string }[] = [
      { method: 'UPI', label: 'UPI / QR' },
      { method: 'DEBIT_CARD', label: 'Debit Card' },
      { method: 'CREDIT_CARD', label: 'Credit Card' },
      { method: 'CASH', label: 'Cash Reserve' },
      { method: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { method: 'OTHER', label: 'Other Methods' },
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
        color: colorMap[m.method],
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions, isDark]);

  const totalSpent = React.useMemo(() => {
    return data.reduce((s, d) => s + d.amount, 0);
  }, [data]);

  const cursorFill = isDark ? 'rgba(66, 132, 117, 0.2)' : 'rgba(174, 238, 211, 0.35)';
  const tickColor = isDark ? 'rgba(255, 244, 225, 0.72)' : '#55A9A0';
  const axisColor = isDark ? 'rgba(137, 215, 183, 0.22)' : 'rgba(40, 122, 116, 0.18)';

  return (
    <div className="fin-card p-6 sm:p-7 rounded-3xl text-left flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
        <div>
          <h3 className="text-base font-black tracking-tight text-[var(--text-headings)] flex items-center gap-2">
            <TrendingDown size={18} className="text-[var(--accent-primary)]" />
            <span>Outflow Channel Distribution</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Spending distribution across payment channels
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] block">
            Total Analyzed
          </span>
          <span className="text-sm font-black font-mono text-[var(--text-primary)]">
            {formatCurrency(totalSpent, settings.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bars / Breakdown Grid with Soft Row Highlight & Glow */}
      <div className="space-y-2 my-5">
        {data.map((item, idx) => (
          <div 
            key={item.method} 
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="p-2 rounded-xl transition-all duration-200 group cursor-default"
            style={{
              backgroundColor: hoveredIndex === idx ? (isDark ? 'rgba(137, 215, 183, 0.12)' : 'rgba(174, 238, 211, 0.25)') : 'transparent',
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="font-black text-[var(--text-primary)]">
                  {formatCurrency(item.amount, settings.currency)}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Glowing Bar with hover accent glow */}
            <div className="w-full h-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.max(item.amount > 0 ? 3 : 0, item.percentage)}%`,
                  backgroundColor: item.color,
                  boxShadow: hoveredIndex === idx ? (isDark ? '0 0 10px rgba(137, 215, 183, 0.45)' : '0 0 10px rgba(40, 122, 116, 0.35)') : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mini Bar Chart with Jade/Emerald Cursor & Custom Tooltip */}
      <div className="h-36 w-full pt-2 chart-container-fluid">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke={tickColor} 
              fontSize={10} 
              tickLine={false} 
              axisLine={{ stroke: axisColor }} 
            />
            <YAxis 
              stroke={tickColor} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: cursorFill, radius: 6 }}
              offset={12}
              content={<CustomChartTooltip currency={settings.currency} type="channel" />}
            />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.amount > 0 ? entry.color : (isDark ? 'rgba(137, 215, 183, 0.2)' : 'rgba(40, 122, 116, 0.15)')} 
                  className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const OutflowChannelDistribution = WhereIsMoneyGoingChart;
