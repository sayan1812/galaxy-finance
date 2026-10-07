import React from 'react';
import type { CurrencyConfig } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
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
  const containerBg = isDark ? 'rgba(66, 132, 117, 0.92)' : 'rgba(255, 255, 255, 0.96)';
  const borderColor = isDark ? 'rgba(137, 215, 183, 0.32)' : 'rgba(40, 122, 116, 0.22)';
  const shadow = isDark 
    ? '0 10px 30px -4px rgba(0, 0, 0, 0.5), 0 0 16px rgba(137, 215, 183, 0.2)' 
    : '0 8px 24px -4px rgba(40, 122, 116, 0.12), 0 0 14px rgba(174, 238, 211, 0.35)';
  const labelColor = isDark ? 'rgba(255, 244, 225, 0.72)' : '#55A9A0';
  const headingColor = isDark ? '#FFF4E1' : '#287A74';
  const textColor = isDark ? '#FFF4E1' : '#143834';
  const inflowColor = isDark ? '#89D7B7' : '#287A74';
  const outflowColor = isDark ? '#FF8A8A' : '#D9534F';

  return (
    <div
      className="pointer-events-none select-none transition-all duration-150 text-left"
      style={{
        backgroundColor: containerBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: shadow,
        minWidth: '140px',
      }}
    >
      {/* Header / Date */}
      {displayTitle && (
        <div
          className="uppercase tracking-wider font-mono font-semibold pb-1.5 mb-1.5 border-b"
          style={{
            borderColor,
            color: labelColor,
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
              +{formatCurrency(Number(rawData.income || 0), currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium" style={{ color: labelColor }}>Outflow</span>
            <span className="font-mono font-bold text-[12px] tabular-nums" style={{ color: outflowColor }}>
              -{formatCurrency(Number(rawData.expense || 0), currency)}
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
                  {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                </span>
              </div>
            );
          })()}
        </div>
      ) : isChannel ? (
        /* Channel / Outflow Channel Mode */
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] font-medium" style={{ color: labelColor }}>Amount</span>
            <span className="font-mono font-bold text-[12px] tabular-nums" style={{ color: outflowColor }}>
              {formatCurrency(Number(rawData.amount || 0), currency)}
            </span>
          </div>
          {rawData.percentage !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] font-medium" style={{ color: labelColor }}>Share</span>
              <span className="font-mono font-medium text-[11px] tabular-nums" style={{ color: textColor }}>
                {formatPercentage(Number(rawData.percentage))}
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
