import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { isSameMonth } from '../../utils/dateUtils';
import { getCategoryThemeColor } from '../../utils/categoryColors';
import { PieChart as PieChartIcon, Inbox } from 'lucide-react';
import type { Transaction } from '../../types';

interface ExpenseCategoryChartProps {
  transactions?: Transaction[];
  title?: string;
  subtitle?: string;
  className?: string;
  showPeriodSelector?: boolean;
}

interface CategoryAggregate {
  category: string;
  amount: number;
  percentage: number;
  color: {
    fill: string;
    text: string;
    border: string;
  };
}

export const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({
  transactions: propTransactions,
  title = 'Expense Distribution',
  subtitle,
  className = '',
  showPeriodSelector = false,
}) => {
  const { transactions: contextTransactions, settings } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';

  const [periodFilter, setPeriodFilter] = useState<'month' | 'all'>('month');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 1. Filter expense transactions
  const { sortedCategories, totalExpense } = useMemo(() => {
    let sourceTx: Transaction[];

    if (propTransactions) {
      sourceTx = propTransactions;
    } else if (periodFilter === 'month') {
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      sourceTx = contextTransactions.filter((t) => isSameMonth(t.date, curYear, curMonth));
    } else {
      sourceTx = contextTransactions;
    }

    // Filter type === 'EXPENSE'
    const expenses = sourceTx.filter(
      (t) => t.type?.toUpperCase() === 'EXPENSE'
    );

    // 2. Aggregate totals per category
    const totals: Record<string, number> = {};
    let total = 0;

    expenses.forEach((t) => {
      const cat = t.category?.trim() || 'Other';
      totals[cat] = (totals[cat] || 0) + Number(t.amount || 0);
      total += Number(t.amount || 0);
    });

    // 3. Compute percentage slice and color mapping
    const aggregates: CategoryAggregate[] = Object.entries(totals).map(
      ([category, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        const color = getCategoryThemeColor(category, isDark);
        return {
          category,
          amount,
          percentage,
          color,
        };
      }
    );

    // 4. Sort categories in descending order of spending volume
    aggregates.sort((a, b) => b.amount - a.amount);

    return {
      sortedCategories: aggregates,
      totalExpense: total,
    };
  }, [propTransactions, contextTransactions, periodFilter, isDark]);

  // Chart pie data
  const pieChartData = useMemo(() => {
    return sortedCategories.map((item) => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage,
      color: item.color.fill,
      textColor: item.color.text,
      borderColor: item.color.border,
    }));
  }, [sortedCategories]);

  // Custom outer radial leader lines and perimeter labels (Money-Manager style)
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, index, name } = props;
    if (!percent || percent < 0.02) return null; // Skip slices < 2% to avoid overlap

    const RADIAN = Math.PI / 180;
    // 1. Point on the slice perimeter
    const rStart = outerRadius + 4;
    const sx = cx + rStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + rStart * Math.sin(-midAngle * RADIAN);

    // 2. Elbow inflection point
    const rElbow = outerRadius + 20;
    const mx = cx + rElbow * Math.cos(-midAngle * RADIAN);
    const my = cy + rElbow * Math.sin(-midAngle * RADIAN);

    // 3. Horizontal extension endpoint
    const isRight = Math.cos(-midAngle * RADIAN) >= 0;
    const ex = isRight ? mx + 16 : mx - 16;
    const ey = my;

    // 4. Anchor and text coordinates
    const textAnchor = isRight ? 'start' : 'end';
    const textX = isRight ? ex + 4 : ex - 4;
    const textY = ey;

    const percentageStr = `${Math.round(percent * 100)}%`;
    const truncatedName = name.length > 14 ? `${name.substring(0, 13)}…` : name;
    const sliceColor = pieChartData[index]?.color || (isDark ? '#89D7B7' : '#059669');

    return (
      <g key={`leader-label-${index}`} className="transition-opacity duration-200">
        {/* Curved pointer line */}
        <path
          d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
          stroke={isDark ? 'rgba(137, 215, 183, 0.45)' : 'rgba(5, 150, 105, 0.5)'}
          strokeWidth={1.5}
          fill="none"
        />
        {/* Small radial pin dot */}
        <circle cx={sx} cy={sy} r={2} fill={sliceColor} />

        {/* Category Label */}
        <text
          x={textX}
          y={textY - 3}
          textAnchor={textAnchor}
          dominantBaseline="auto"
          fill={isDark ? '#FFF4E1' : '#064E3B'}
          style={{ fontSize: '11px', fontWeight: 600 }}
        >
          {truncatedName}
        </text>

        {/* Percentage Label */}
        <text
          x={textX}
          y={textY + 11}
          textAnchor={textAnchor}
          dominantBaseline="auto"
          fill={isDark ? '#89D7B7' : '#047857'}
          style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}
        >
          {percentageStr}
        </text>
      </g>
    );
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-colors duration-200 ${
        isDark
          ? 'bg-[#10221E] border border-[#89D7B7]/15 text-[#FFF4E1]'
          : 'bg-white border border-slate-200 shadow-sm text-slate-900'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-[#1A312C] text-[#89D7B7]' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <PieChartIcon size={18} />
            </div>
            <h3
              className={`font-black text-base sm:text-lg tracking-tight ${
                isDark ? 'text-[#FFF4E1]' : 'text-slate-900'
              }`}
            >
              {title}
            </h3>
          </div>
          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-[#89D7B7]/70' : 'text-slate-500'
            }`}
          >
            {subtitle || (
              <>
                Total Expenses:{' '}
                <strong
                  className={`font-mono font-bold ${
                    isDark ? 'text-[#FFF4E1]' : 'text-slate-900'
                  }`}
                >
                  {formatCurrency(totalExpense, settings?.currency)}
                </strong>
              </>
            )}
          </p>
        </div>

        {/* Optional Period Selector (When self-controlled) */}
        {showPeriodSelector && !propTransactions && (
          <div
            className={`flex items-center p-1 rounded-xl text-xs font-semibold ${
              isDark
                ? 'bg-[#1A312C]/90 border border-[#89D7B7]/20 text-[#89D7B7]'
                : 'bg-slate-100 border border-slate-200 text-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'month'
                  ? isDark
                    ? 'bg-[#89D7B7] text-[#10221E] font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:opacity-80'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                periodFilter === 'all'
                  ? isDark
                    ? 'bg-[#89D7B7] text-[#10221E] font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:opacity-80'
              }`}
            >
              All Time
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Donut Chart + Category Breakdown */}
      {totalExpense === 0 || sortedCategories.length === 0 ? (
        /* Empty State */
        <div
          className={`h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center ${
            isDark
              ? 'border-[#89D7B7]/20 bg-[#1A312C]/30 text-[#89D7B7]/70'
              : 'border-slate-200 bg-slate-50/50 text-slate-400'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
              isDark ? 'bg-[#1A312C] text-[#89D7B7]' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Inbox size={24} />
          </div>
          <p className="text-sm font-semibold">No expense records found for this period</p>
          <p className="text-xs opacity-75 mt-1">
            Log transactions with type "Expense" to generate the category breakdown.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Donut / Pie Chart */}
          <div className="relative w-full h-72 sm:h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 15, right: 25, bottom: 15, left: 25 }}>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  animationEasing="ease-out"
                  label={renderCustomizedLabel}
                  labelLine={false}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, index) => setActiveIndex(activeIndex === index ? null : index)}
                >
                  {pieChartData.map((entry, index) => {
                    const isSelected = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={isDark ? '#10221E' : '#FFFFFF'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-200 cursor-pointer outline-none"
                        style={{
                          transformOrigin: 'center center',
                          filter: isSelected
                            ? isDark
                              ? 'drop-shadow(0 0 8px rgba(137, 215, 183, 0.45))'
                              : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))'
                            : 'none',
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  cursor={false}
                  wrapperStyle={{ pointerEvents: 'none', zIndex: 40 }}
                  position={{ y: 6 }}
                  offset={20}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const categoryColor = getCategoryThemeColor(data.name, isDark);
                      return (
                        <div
                          className={`pointer-events-none select-none px-3.5 py-2.5 rounded-2xl shadow-xl text-xs backdrop-blur-md border ${
                            isDark
                              ? 'bg-[#10221E]/95 border-[#89D7B7]/30 text-[#FFF4E1]'
                              : 'bg-white/95 border-slate-200 text-[#1E293B]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: categoryColor.fill }}
                            />
                            <span className="font-bold text-sm">{data.name}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="opacity-80">
                              {formatCurrency(data.value, settings?.currency)}
                            </span>
                            <span
                              className="font-bold px-1.5 py-0.5 rounded text-[11px]"
                              style={{
                                backgroundColor: categoryColor.fill,
                                color: categoryColor.text,
                              }}
                            >
                              {data.percentage.toFixed(1)}%
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

            {/* Central Donut Callout Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-bold ${
                  isDark ? 'text-[#89D7B7]/80' : 'text-emerald-800/80'
                }`}
              >
                TOTAL EXPENSE
              </span>
              <span
                className={`text-base sm:text-xl font-black font-mono tracking-tight my-0.5 ${
                  isDark ? 'text-[#FFF4E1]' : 'text-emerald-950'
                }`}
              >
                {formatCurrency(totalExpense, settings?.currency)}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-bold font-mono ${
                  isDark ? 'text-[#89D7B7]' : 'text-emerald-700'
                }`}
              >
                {sortedCategories.length} {sortedCategories.length === 1 ? 'Category' : 'Categories'}
              </span>
            </div>
          </div>

          {/* Category List View with Percentage Badges */}
          <div className="w-full divide-y divide-emerald-900/20 dark:divide-emerald-900/30">
            {sortedCategories.map((item, idx) => {
              const color = getCategoryThemeColor(item.category, isDark);
              const isHovered = activeIndex === idx;

              return (
                <div
                  key={item.category}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between py-2.5 px-3 border-b border-emerald-900/20 hover:bg-emerald-500/5 transition-colors cursor-pointer rounded-xl ${
                    isHovered
                      ? isDark
                        ? 'bg-[#1A312C]/60 scale-[1.01]'
                        : 'bg-emerald-50/70 scale-[1.01]'
                      : ''
                  }`}
                >
                  {/* Left: Badge + Category Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      style={{ backgroundColor: color.fill, color: color.text }}
                      className="px-2.5 py-1 text-xs font-bold rounded-md min-w-[44px] text-center shadow-xs shrink-0"
                    >
                      {Math.round(item.percentage)}%
                    </span>
                    <span className="text-sm font-medium text-[var(--text-primary)] dark:text-[#FFF4E1] truncate">
                      {item.category}
                    </span>
                  </div>

                  {/* Right: Calculated Amount */}
                  <span className="text-sm font-bold text-[var(--text-headings)] dark:text-[#89D7B7] font-mono shrink-0 ml-3">
                    {formatCurrency(item.amount, settings?.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryChart;
