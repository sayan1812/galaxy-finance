import React from 'react';
import type { CurrencyConfig } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

export interface CustomChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency?: CurrencyConfig;
  type?: 'cashflow' | 'daily' | 'channel' | 'category' | 'auto';
  title?: string;
}

/**
 * GALAXY FINANCE — BI-MODAL JADE/EMERALD CHART TOOLTIP
 * Dark: Glassmorphic Mid Emerald (#428475), Rim (rgba(137, 215, 183, 0.3)), Text (#FFF4E1), Inflow (#89D7B7), Outflow (#FF8A8A)
 * Light: Glassmorphic White/Mint, Rim (rgba(40, 122, 116, 0.25)), Text (#143834), Inflow (#287A74), Outflow (#D9534F)
 */
export const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({
  active,
  payload,
  label,
  currency,
  type = 'auto',
  title,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || theme === 'galaxy';

  if (!active || !payload || !payload.length) {
    return null;
  }

  const rawData = payload[0]?.payload || {};
  const displayTitle = title || label || rawData.label || rawData.displayDate || rawData.name || rawData.date;

  const isCashFlow = type === 'cashflow' || ('income' in rawData && 'expense' in rawData);
  const isChannel = type === 'channel' || ('method' in rawData && 'percentage' in rawData);
  const isDaily = type === 'daily' || ('displayDate' in rawData && 'amount' in rawData && !('income' in rawData));

  // Bi-modal styling variables
  const containerBg = isDark ? 'rgba(16, 34, 30, 0.95)' : 'rgba(255, 255, 255, 0.96)';
  const borderColor = isDark ? 'rgba(137, 215, 183, 0.3)' : 'rgba(40, 122, 116, 0.22)';
  const shadow = isDark 
    ? '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 0 16px rgba(137, 215, 183, 0.25)' 
    : '0 8px 24px -4px rgba(40, 122, 116, 0.12), 0 0 14px rgba(174, 238, 211, 0.35)';
  const labelColor = isDark ? 'rgba(255, 244, 225, 0.7)' : '#55A9A0';
  const headingColor = isDark ? '#89D7B7' : '#287A74';
  const textColor = isDark ? '#FFF4E1' : '#143834';
  const inflowColor = isDark ? '#89D7B7' : '#287A74';
  const outflowColor = isDark ? '#F87171' : '#D9534F';

  return (
    <div
      className="pointer-events-none select-none transition-all duration-150 text-left rounded-xl p-3 shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: containerBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        minWidth: '145px',
      }}
    >
      {/* Header / Date */}
      {displayTitle && (
        <div
          className="uppercase tracking-wider font-mono font-bold pb-1.5 mb-1.5 border-b text-xs"
          style={{
            borderColor,
            color: headingColor,
            fontSize: '11px',
            letterSpacing: '0.08em',
          }}
        >
          {String(displayTitle)}
        </div>
      )}

      {/* Cash Flow Mode (Inflow vs Outflow vs Net) */}
      {isCashFlow ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium" style={{ color: labelColor }}>Inflow</span>
            <span className="font-mono font-bold text-[12px] tabular-nums" style={{ color: inflowColor }}>
              {formatCurrency(Number(rawData.income || 0), currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium" style={{ color: labelColor }}>Outflow</span>
            <span className="font-mono font-bold text-[12px] tabular-nums" style={{ color: outflowColor }}>
              {formatCurrency(Number(rawData.expense || 0), currency)}
            </span>
          </div>
          {('income' in rawData || 'expense' in rawData) && (() => {
            const net = Number(rawData.income || 0) - Number(rawData.expense || 0);
            return (
              <div 
                className="border-t pt-1.5 mt-1 flex items-center justify-between gap-4"
                style={{ borderColor }}
              >
                <span className="text-[12px] font-bold" style={{ color: headingColor }}>Net Cash</span>
                <span
                  className="font-mono font-bold text-[13px] tabular-nums"
                  style={{ color: net >= 0 ? inflowColor : outflowColor }}
                >
                  {formatCurrency(net, currency)}
                </span>
              </div>
            );
          })()}
        </div>
      ) : isChannel ? (
        /* Channel / Outflow Channel Mode */
        <div className="space-y-1 mt-0.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-[#FFF4E1]/70" style={{ color: labelColor }}>Amount</span>
            <span className="font-mono font-bold text-sm tabular-nums" style={{ color: outflowColor }}>
              {formatCurrency(Number(rawData.amount || payload[0]?.value || 0), currency)}
            </span>
          </div>
          {(rawData.percentage !== undefined || rawData.share !== undefined) && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[#FFF4E1]/70" style={{ color: labelColor }}>Share</span>
              <span className="font-mono font-semibold text-xs tabular-nums" style={{ color: headingColor }}>
                {rawData.share !== undefined ? `${rawData.share}%` : (rawData.percentage !== undefined ? `${rawData.percentage}%` : '0%')}
              </span>
            </div>
          )}
        </div>
      ) : isDaily ? (
        /* Daily Trajectory Mode */
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium" style={{ color: labelColor }}>Outflow</span>
            <span className="font-mono font-bold text-[13px] tabular-nums" style={{ color: outflowColor }}>
              {formatCurrency(Number(rawData.amount || 0), currency)}
            </span>
          </div>
        </div>
      ) : (
        /* Default / Payload Iteration */
        <div className="space-y-1">
          {payload.map((item, index) => {
            const val = Number(item.value || 0);
            const isNegativeOrExpense = item.name?.toLowerCase().includes('outflow') || item.name?.toLowerCase().includes('expense');
            const isPositiveOrIncome = item.name?.toLowerCase().includes('inflow') || item.name?.toLowerCase().includes('income');
            const valColor = isPositiveOrIncome ? inflowColor : isNegativeOrExpense ? outflowColor : textColor;

            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-[12px] flex items-center gap-1.5" style={{ color: labelColor }}>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: item.color || item.fill || inflowColor }}
                  />
                  {item.name || 'Value'}
                </span>
                <span className="font-mono font-bold text-[12px] tabular-nums" style={{ color: valColor }}>
                  {formatCurrency(val, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
