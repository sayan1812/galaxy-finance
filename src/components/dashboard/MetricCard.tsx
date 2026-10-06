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
 * MetricCard — Crimson Noir & Slate Edition
 * Executive financial telemetry card with wine-tinted border and precision crimson rim light on hover.
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
          iconBg: 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40',
          accent: 'text-emerald-400',
        };
      case 'rose':
        return {
          iconBg: 'bg-[#4A121A]/40 text-[#E53935] border border-[#4A121A]',
          accent: 'text-[#E53935]',
        };
      case 'indigo':
        return {
          iconBg: 'bg-[#4A121A]/30 text-[#E53935] border border-[#4A121A]/50',
          accent: 'text-[#FBFBFB]',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-950/40 text-amber-400 border border-amber-800/40',
          accent: 'text-amber-400',
        };
      case 'sky':
        return {
          iconBg: 'bg-slate-800/50 text-[#8E929D] border border-slate-700/50',
          accent: 'text-[#FBFBFB]',
        };
      case 'default':
      default:
        return {
          iconBg: 'bg-[#181822] text-[#8E929D] border border-white/[0.08]',
          accent: 'text-[#FBFBFB]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="relative p-4 sm:p-5 rounded-3xl fin-card bg-[#13131A] dark:bg-[#13131A] light:bg-white border border-[rgba(74,18,26,0.35)] shadow-md select-none overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#8E929D] tracking-wide">
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
          <p className="text-[11px] text-[#8E929D] font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <span className="absolute bottom-3.5 right-3.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.04] text-[#8E929D] border border-white/[0.08]">
          {badge}
        </span>
      )}
    </div>
  );
};
