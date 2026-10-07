import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InteractiveCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'crimson' | 'slate' | 'wine' | 'emerald';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * InteractiveCard — Adaptive Bi-Modal Fintech Card
 * High contrast, responsive to theme tokens with subtle interactive elevation.
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
      className={`relative p-5 rounded-3xl fin-card bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-primary)]/40 cursor-pointer select-none overflow-hidden transition-all duration-200 shadow-md ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
          {title}
        </span>
        {Icon && (
          <div className="p-2.2 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] flex items-center justify-center">
            <Icon size={17} />
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div className="space-y-1">
        <div className="text-2xl font-black tracking-tight text-[var(--text-headings)] font-mono">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer Info: Badge or Trend */}
      {(badge || trend) && (
        <div className="mt-4 pt-3 border-t border-[var(--divider)] flex items-center justify-between text-[11px]">
          {trend && (
            <span
              className={`font-semibold font-mono ${
                trend.direction === 'up'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.label}
            </span>
          )}

          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full font-bold ml-auto text-[10px] uppercase tracking-wider ${
                badgeVariant === 'crimson'
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  : badgeVariant === 'emerald'
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--card-border)]'
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
