import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useCurrentTime } from '../../hooks/useCurrentTime';

/**
 * Reactive Real-Time Date & Clock Badge
 * - Formats as `Today: <DD MMM YYYY> • <HH:MM AM/PM>`
 * - Automatically updates live state every second via useCurrentTime hook
 */
export const RealtimeDateBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const currentTime = useCurrentTime();

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(currentTime);

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(currentTime).toUpperCase();

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] text-xs font-mono font-semibold shadow-xs select-none ${className}`}
    >
      <Calendar size={13} className="text-[var(--accent-primary)] shrink-0" />
      <span>Today: {datePart} • {timePart}</span>
      <Clock size={12} className="text-[var(--accent-primary)] shrink-0 animate-pulse ml-0.5 opacity-70" />
    </div>
  );
};

export default RealtimeDateBadge;
