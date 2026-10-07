import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'emerald' | 'rose' | 'indigo' | 'amber' | 'sky';
  badge?: string;
}

/**
 * MetricCard — Adaptive Bi-Modal Fintech Telemetry Card
 * High-contrast, theme-aware card with jade/emerald accents.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default',
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
          accent: 'text-emerald-500 dark:text-emerald-400',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
          accent: 'text-rose-500 dark:text-rose-400',
        };
      case 'indigo':
        return {
          iconBg: 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30',
          accent: 'text-[var(--text-headings)]',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
          accent: 'text-amber-500 dark:text-amber-400',
        };
      case 'sky':
        return {
          iconBg: 'bg-sky-500/15 text-sky-500 border border-sky-500/30',
          accent: 'text-[var(--text-headings)]',
        };
      case 'default':
      default:
        return {
          iconBg: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--card-border)]',
          accent: 'text-[var(--text-headings)]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="relative p-4 sm:p-5 rounded-3xl fin-card bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md select-none overflow-hidden transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
          <Icon size={17} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${styles.accent}`}>
          {amount}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-[var(--text-secondary)] font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <span className="absolute bottom-3.5 right-3.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--card-border)]">
          {badge}
        </span>
      )}
    </div>
  );
};
