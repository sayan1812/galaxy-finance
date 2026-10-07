import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Returns formatted date string using en-GB locale (e.g., "08 Oct 2026")
 */
function getFormattedToday(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Reactive Real-Time Date Badge
 * - Formats as `Today: <DD MMM YYYY>`
 * - Automatically recalculates at midnight and on tab focus
 */
export const RealtimeDateBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [formattedToday, setFormattedToday] = useState<string>(getFormattedToday);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      const msUntilMidnight = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

      timerId = setTimeout(() => {
        setFormattedToday(getFormattedToday());
        scheduleMidnightUpdate();
      }, msUntilMidnight);
    };

    scheduleMidnightUpdate();

    // Re-check on tab focus / wake
    const handleFocus = () => {
      setFormattedToday(getFormattedToday());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] text-xs font-mono font-semibold shadow-xs select-none ${className}`}
    >
      <Calendar size={13} className="text-[var(--accent-primary)] shrink-0" />
      <span>Today: {formattedToday}</span>
    </div>
  );
};

export default RealtimeDateBadge;
