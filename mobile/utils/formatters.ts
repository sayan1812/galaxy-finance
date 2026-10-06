export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const num = roundToTwoDecimals(Number(amount) || 0);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0
  });
}

export function maskAccountNumber(acc: string | undefined | null): string {
  if (!acc) return '•••• •••• ••••';
  const clean = acc.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(d: Date = new Date()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats YYYY-MM-DD without UTC timezone shift.
 * Ensures 11:30 PM local transactions appear on the correct day.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (h === undefined || m === undefined) return timeStr;
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${m} ${ampm}`;
}

export function getRelativeDay(dateStr: string): string {
  if (!dateStr) return '';
  const today = getLocalDateString(new Date());
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = getLocalDateString(d);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDate(dateStr);
}

export const CATEGORIES = [
  { name: 'Food & Dining', icon: 'restaurant-outline', color: '#f97316' },
  { name: 'Groceries', icon: 'cart-outline', color: '#10b981' },
  { name: 'Transportation', icon: 'car-outline', color: '#06b6d4' },
  { name: 'Fuel', icon: 'speedometer-outline', color: '#eab308' },
  { name: 'Shopping', icon: 'bag-handle-outline', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: 'receipt-outline', color: '#8b5cf6' },
  { name: 'Rent', icon: 'home-outline', color: '#6366f1' },
  { name: 'Entertainment', icon: 'film-outline', color: '#d946ef' },
  { name: 'Healthcare', icon: 'medkit-outline', color: '#ef4444' },
  { name: 'Travel', icon: 'airplane-outline', color: '#14b8a6' },
  { name: 'Salary', icon: 'wallet-outline', color: '#22c55e' },
  { name: 'Freelance & Business', icon: 'briefcase-outline', color: '#3b82f6' },
  { name: 'Investments', icon: 'trending-up-outline', color: '#a855f7' },
  { name: 'Other', icon: 'cube-outline', color: '#64748b' }
];

export const PAYMENT_METHODS = [
  { name: 'Cash', icon: 'cash-outline', color: '#10b981' },
  { name: 'UPI', icon: 'flash-outline', color: '#8b5cf6' },
  { name: 'Debit Card', icon: 'card-outline', color: '#06b6d4' },
  { name: 'Credit Card', icon: 'card', color: '#f43f5e' },
  { name: 'Bank Transfer', icon: 'business-outline', color: '#3b82f6' },
  { name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#64748b' }
];
