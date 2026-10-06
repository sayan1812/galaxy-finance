import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Banknote, 
  Smartphone,
  Plus
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { YearCalendar } from '../components/calendar/YearCalendar';
import { DayDetailDrawer } from '../components/calendar/DayDetailDrawer';
import { formatCurrency } from '../utils/formatters';
import { isSameMonth } from '../utils/dateUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarPage: React.FC = () => {
  const { transactions, settings, setIsAddCashModalOpen, setIsAddModalOpen } = useTransactions();

  const today = new Date();
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'income' | 'expense' | 'cash' | 'bank' | 'upi' | 'card'>('all');

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
  };

  // Section 13: Calendar filters: Income, Expense, Cash, Bank, UPI, Card
  const filteredCalendarTxns = transactions.filter((t) => {
    if (calendarFilter === 'income') return t.type === 'INCOME';
    if (calendarFilter === 'expense') return t.type === 'EXPENSE';
    if (calendarFilter === 'cash') return t.paymentMethod === 'CASH';
    if (calendarFilter === 'bank') return t.paymentMethod === 'BANK_TRANSFER' || Boolean(t.bankAccountId);
    if (calendarFilter === 'upi') return t.paymentMethod === 'UPI';
    if (calendarFilter === 'card') return t.paymentMethod === 'DEBIT_CARD' || t.paymentMethod === 'CREDIT_CARD';
    return true;
  });

  // Calculate current viewed month totals (timezone-safe)
  const currentMonthTxns = filteredCalendarTxns.filter((t) =>
    isSameMonth(t.date, currentYear, currentMonth)
  );

  const monthIncome = currentMonthTxns
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = currentMonthTxns
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthNet = monthIncome - monthExpense;

  const monthCashSpent = currentMonthTxns
    .filter((t) => t.type === 'EXPENSE' && t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthOnlineSpent = currentMonthTxns
    .filter((t) => t.type === 'EXPENSE' && t.paymentMethod !== 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="text-emerald-600 dark:text-emerald-400" size={26} />
            <span>Financial Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual day-by-day cash & online spending breakdown with itemized views
          </p>
        </div>

        {/* View mode toggle & Quick Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'year'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Year View
            </button>
          </div>

          <button
            onClick={() => setIsAddCashModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-bold text-xs hover:bg-amber-100 transition cursor-pointer"
          >
            <Banknote size={15} />
            <span>+ Add Cash</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Record</span>
          </button>
        </div>
      </div>

      {/* Month / Year Navigator & Monthly Metric Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* Month/Year Title & Controls */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 dark:text-white min-w-[190px]">
              {viewMode === 'month' ? `${MONTH_NAMES[currentMonth]} ${currentYear}` : `Year ${currentYear}`}
            </h2>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Quick Legend: Income / Expense / Cash / Online */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Income</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Expense</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Cash</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Online</span>
            </span>
          </div>
        </div>

        {/* Section 13 Filter Pills: Income, Expense, Cash, Bank, UPI, Card */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Filter:</span>
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'income', label: 'Income Only' },
            { id: 'expense', label: 'Expense Only' },
            { id: 'cash', label: 'Cash Only' },
            { id: 'bank', label: 'Bank Transfers' },
            { id: 'upi', label: 'UPI / QR' },
            { id: 'card', label: 'Cards (Debit/Credit)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setCalendarFilter(f.id as typeof calendarFilter)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                calendarFilter === f.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Aggregate Banner for Current Month */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <ArrowDownLeft size={14} />
              <span>Month's Income</span>
            </div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">
              +{formatCurrency(monthIncome, settings.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <ArrowUpRight size={14} />
              <span>Month's Expense</span>
            </div>
            <div className="text-lg font-black text-rose-700 dark:text-rose-300 mt-1">
              -{formatCurrency(monthExpense, settings.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Month's Net Balance
            </div>
            <div className={`text-lg font-black mt-1 ${monthNet >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-rose-600 dark:text-rose-400'}`}>
              {monthNet >= 0 ? '+' : ''}{formatCurrency(monthNet, settings.currency)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Cash vs Online Spending
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Banknote size={13} />
                <span>{formatCurrency(monthCashSpent, settings.currency)}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                <Smartphone size={13} />
                <span>{formatCurrency(monthOnlineSpent, settings.currency)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar View: Month or Year */}
      {viewMode === 'month' ? (
        <MonthCalendar
          year={currentYear}
          month={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={(dateStr) => setSelectedDate(dateStr)}
          customTransactions={filteredCalendarTxns}
        />
      ) : (
        <YearCalendar
          year={currentYear}
          onSelectMonth={(monthIdx) => {
            setCurrentMonth(monthIdx);
            setViewMode('month');
          }}
        />
      )}

      {/* Day Detail Drawer (Opens on date click) */}
      <DayDetailDrawer
        dateStr={selectedDate}
        onClose={() => setSelectedDate(null)}
        onAddTransactionForDate={(_dateStr) => {
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
};
