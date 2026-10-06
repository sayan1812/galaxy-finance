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
          iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
          border: 'hover:border-emerald-500/50',
          accent: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
          border: 'hover:border-rose-500/50',
          accent: 'text-rose-600 dark:text-rose-400',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
          border: 'hover:border-indigo-500/50',
          accent: 'text-indigo-600 dark:text-indigo-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
          border: 'hover:border-amber-500/50',
          accent: 'text-amber-600 dark:text-amber-400',
        };
      case 'sky':
        return {
          iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
          border: 'hover:border-sky-500/50',
          accent: 'text-sky-600 dark:text-sky-400',
        };
      case 'default':
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          border: 'hover:border-slate-400 dark:hover:border-slate-700',
          accent: 'text-slate-900 dark:text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all ${styles.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${styles.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${styles.accent}`}>
          {amount}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <span className="absolute bottom-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {badge}
        </span>
      )}
    </div>
  );
};
