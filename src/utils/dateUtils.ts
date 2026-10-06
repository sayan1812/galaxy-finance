import type { TimeRangeFilter } from '../types';

export function getLocalDateTimeInputValue(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  const clean = dateString.slice(0, 10);
  if (clean.length === 10 && clean.includes('-')) {
    const [y, m, d] = clean.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d, 12, 0, 0); // midday avoids boundary and daylight saving shift
    }
  }
  return new Date(dateString);
}

export function getLocalDateComponents(dateString: string): { year: number; month: number; day: number } | null {
  if (!dateString) return null;
  const clean = dateString.slice(0, 10);
  const parts = clean.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  return { year: parts[0], month: parts[1] - 1, day: parts[2] };
}

export function isSameMonth(dateString: string, targetYear: number, targetMonth: number): boolean {
  const comp = getLocalDateComponents(dateString);
  if (!comp) return false;
  return comp.year === targetYear && comp.month === targetMonth;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getRelativeDateLabel(dateString: string): string {
  const date = parseLocalDate(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return 'Today';
  }
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function filterByTimeRange(
  dateString: string, 
  filter: TimeRangeFilter, 
  customStart?: string, 
  customEnd?: string
): boolean {
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return true;
  
  const now = new Date();

  switch (filter) {
    case 'today':
      return isSameDay(date, now);

    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return isSameDay(date, yesterday);
    }

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(monday);
      endOfWeek.setDate(monday.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return date >= monday && date <= endOfWeek;
    }

    case 'this_month':
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );

    case 'last_month': {
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      return (
        date.getFullYear() === lastMonthYear &&
        date.getMonth() === lastMonth
      );
    }

    case 'this_year':
      return date.getFullYear() === now.getFullYear();

    case 'custom': {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      return true;
    }

    case 'all':
    default:
      return true;
  }
}

export function getStartAndEndDateForFilter(
  filter: TimeRangeFilter,
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date; label: string } {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  let label = 'All Time';

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = `Today (${formatDate(now.toISOString())})`;
      break;

    case 'yesterday': {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      start = new Date(y);
      start.setHours(0, 0, 0, 0);
      end = new Date(y);
      end.setHours(23, 59, 59, 999);
      label = `Yesterday (${formatDate(y.toISOString())})`;
      break;
    }

    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      label = 'This Week';
      break;
    }

    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      break;
    }

    case 'last_month': {
      const lmYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      start = new Date(lmYear, lm, 1, 0, 0, 0, 0);
      end = new Date(lmYear, lm + 1, 0, 23, 59, 59, 999);
      label = start.toLocaleString('default', { month: 'long', year: 'numeric' });
      break;
    }

    case 'this_year': {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      label = `${now.getFullYear()}`;
      break;
    }

    case 'custom': {
      if (customStart && customEnd) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        label = `${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}`;
      } else {
        label = 'Custom Range';
      }
      break;
    }
  }

  return { start, end, label };
}
