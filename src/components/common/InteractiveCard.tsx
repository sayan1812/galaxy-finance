import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InteractiveCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'crimson' | 'slate' | 'wine';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * InteractiveCard — Crimson Noir & Slate Edition
 * Demonstrates exact micro-interactions:
 * - Rest: #13131A fill, 1px wine border rgba(74,18,26,0.35), scale: 1, translateY: 0.
 * - Hover: translateY(-3px), scale: 1.012, border-color: rgba(229,57,53,0.35), shadow: 0 10px 25px -5px rgba(74,18,26,0.25).
 * - Transition: 250ms cubic-bezier(0.2, 0.0, 0, 1.0).
 */
export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'slate',
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-3xl fin-card bg-[#13131A] border border-[rgba(74,18,26,0.35)] cursor-pointer select-none overflow-hidden ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-semibold text-[#8E929D] tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className="p-2.2 rounded-xl bg-[#4A121A]/30 border border-[#4A121A]/50 text-[#E53935] flex items-center justify-center">
            <Icon size={17} />
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div className="space-y-1">
        <div className="text-2xl font-black tracking-tight text-[#FBFBFB] font-mono">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[#8E929D] font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer Info: Badge or Trend */}
      {(badge || trend) && (
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
          {trend && (
            <span
              className={`font-semibold font-mono ${
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-[#E53935]'
                  : 'text-[#8E929D]'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
            </span>
          )}

          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-bold ml-auto text-[10px] uppercase tracking-wider ${
                badgeVariant === 'crimson'
                  ? 'bg-[#D32F2F]/20 text-[#E53935] border border-[#D32F2F]/30'
                  : badgeVariant === 'wine'
                  ? 'bg-[#4A121A]/40 text-[#FBFBFB] border border-[#4A121A]'
                  : 'bg-white/[0.04] text-[#8E929D] border border-white/[0.08]'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
