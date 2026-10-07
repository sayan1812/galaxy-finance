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
import { useTheme } from '../../context/ThemeContext';
import { formatCompactCurrency } from '../../utils/formatters';
import { CustomChartTooltip } from './CustomChartTooltip';

export const IncomeExpenseChart: React.FC = () => {
  const { transactions, settings } = useTransactions();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';

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

  // Color tokens
  const gridStroke = isDark ? 'rgba(137, 215, 183, 0.15)' : 'rgba(40, 122, 116, 0.12)';
  const tickColor = isDark ? 'rgba(255, 244, 225, 0.72)' : '#55A9A0';
  const axisColor = isDark ? 'rgba(137, 215, 183, 0.22)' : 'rgba(40, 122, 116, 0.18)';
  const cursorFill = isDark ? 'rgba(66, 132, 117, 0.2)' : 'rgba(174, 238, 211, 0.35)';
  const inflowFill = isDark ? '#89D7B7' : '#287A74';
  const outflowFill = isDark ? '#FF8A8A' : '#D9534F';

  return (
    <div className="fin-card p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base tracking-tight text-[var(--text-headings)]">
            Monthly Cash Flow
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            6-Month Inflow vs Outflow Telemetry
          </p>
        </div>
      </div>

      <div className="h-64 w-full chart-container-fluid">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.8} />
            <XAxis 
              dataKey="label" 
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
              content={<CustomChartTooltip currency={settings.currency} type="cashflow" />}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', color: tickColor }}
            />
            <Bar 
              dataKey="income" 
              name="Inflow"
              fill={inflowFill} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={20}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
              className="transition-opacity hover:opacity-90 cursor-pointer"
            />
            <Bar 
              dataKey="expense" 
              name="Outflow"
              fill={outflowFill} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={20}
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

export const MonthlyCashFlowChart = IncomeExpenseChart;
