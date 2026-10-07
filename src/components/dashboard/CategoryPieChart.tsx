import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { isSameMonth } from '../../utils/dateUtils';

const DARK_JADE_PIE_PALETTE = [
  '#89D7B7', // Luminous Jade
  '#428475', // Mid Emerald
  '#AEEED3', // Mint Glow
  '#FFF4E1', // Soft Cream
  '#55A9A0', // Soft Spruce
  '#287A74', // Rich Pine Teal
  '#FF8A8A', // Soft Coral Outflow
];

const LIGHT_JADE_PIE_PALETTE = [
  '#287A74', // Rich Pine Teal
  '#55A9A0', // Soft Spruce
  '#AEEED3', // Mint Glow
  '#143834', // Charcoal Emerald
  '#389E89', // Seafoam Teal
  '#D9534F', // Coral Outflow
  '#E0C870', // Amber Mist
];

export const CategoryPieChart: React.FC = () => {
  const { transactions, categories, settings } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';

  const piePalette = isDark ? DARK_JADE_PIE_PALETTE : LIGHT_JADE_PIE_PALETTE;

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
        const fallbackColor = piePalette[index % piePalette.length];
        return {
          name,
          value,
          color: catObj?.color || fallbackColor,
          percent: total > 0 ? (value / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { categoryData: sorted, totalExpense: total };
  }, [transactions, categories, piePalette]);

  // Bi-modal tooltip styles
  const tooltipBg = isDark ? 'rgba(66, 132, 117, 0.94)' : 'rgba(255, 255, 255, 0.96)';
  const tooltipBorder = isDark ? 'rgba(137, 215, 183, 0.3)' : 'rgba(40, 122, 116, 0.22)';
  const tooltipShadow = isDark ? '0 8px 24px -4px rgba(0, 0, 0, 0.5)' : '0 8px 24px -4px rgba(40, 122, 116, 0.12)';
  const tooltipText = isDark ? '#FFF4E1' : '#143834';
  const tooltipMuted = isDark ? 'rgba(255, 244, 225, 0.72)' : '#55A9A0';
  const strokeColor = isDark ? '#1A312C' : '#FFFFFF';

  return (
    <div className="fin-card p-5 rounded-3xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[var(--text-headings)]">
            Monthly Category Allocation
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Total: <strong className="text-[var(--text-primary)] font-mono">{formatCurrency(totalExpense, settings.currency)}</strong>
          </p>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-[var(--text-secondary)]">
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={strokeColor} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  offset={12}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div 
                          className="pointer-events-none select-none text-left"
                          style={{
                            backgroundColor: tooltipBg,
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: `1px solid ${tooltipBorder}`,
                            borderRadius: '10px',
                            padding: '8px 12px',
                            boxShadow: tooltipShadow,
                            minWidth: '130px',
                          }}
                        >
                          <div 
                            className="font-semibold text-xs flex items-center gap-1.5 pb-1 border-b mb-1.5"
                            style={{ borderColor: tooltipBorder, color: tooltipText }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                            {data.name}
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[11px]" style={{ color: tooltipMuted }}>Amount</span>
                            <span className="font-bold font-mono text-xs text-[var(--accent-outflow)] tabular-nums">
                              {formatCurrency(data.value, settings.currency)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 mt-0.5">
                            <span className="text-[11px]" style={{ color: tooltipMuted }}>Share</span>
                            <span className="text-[11px] font-mono tabular-nums" style={{ color: tooltipText }}>
                              {formatPercentage(data.percent)}
                            </span>
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
              <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">Month</span>
              <span className="text-xs font-black font-mono text-[var(--text-primary)] max-w-[80px] truncate text-center">
                {formatCurrency(totalExpense, settings.currency)}
              </span>
            </div>
          </div>

          {/* Interactive Legends */}
          <div className="flex-1 w-full space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categoryData.slice(0, 6).map((item) => (
              <div 
                key={item.name}
                className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-[var(--row-hover-bg)] transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium truncate text-[var(--text-primary)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[var(--text-primary)]">{formatCurrency(item.value, settings.currency)}</span>
                  <span className="text-[var(--text-secondary)] w-9 text-right text-[11px]">{formatPercentage(item.percent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
