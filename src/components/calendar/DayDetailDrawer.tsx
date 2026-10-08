import React from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar as CalendarIcon, 
  Plus, 
  Banknote, 
  Smartphone
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { TransactionItem } from '../transactions/TransactionItem';

interface DayDetailDrawerProps {
  dateStr: string | null; // YYYY-MM-DD
  onClose: () => void;
  onAddTransactionForDate?: (dateStr: string) => void;
}

export const DayDetailDrawer: React.FC<DayDetailDrawerProps> = ({
  dateStr,
  onClose,
  onAddTransactionForDate,
}) => {
  const { transactions, settings, setIsAddCashModalOpen, setIsAddModalOpen } = useTransactions();

  if (!dateStr) return null;

  // Filter all transactions on this date
  const dayTransactions = transactions.filter((t) => {
    return t.date && t.date.slice(0, 10) === dateStr;
  });

  const totalIncome = dayTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = dayTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const cashSpent = dayTransactions
    .filter((t) => t.type === 'EXPENSE' && t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  const onlineSpent = dayTransactions
    .filter((t) => t.type === 'EXPENSE' && t.paymentMethod !== 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddCash = () => {
    setIsAddCashModalOpen(true);
  };

  const handleAddGeneral = () => {
    if (onAddTransactionForDate) {
      onAddTransactionForDate(dateStr);
    } else {
      setIsAddModalOpen(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-3 sm:p-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md h-[90vh] sm:h-full bg-white dark:bg-slate-900 sm:rounded-l-3xl shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {formatDate(dateStr)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dayTransactions.length} transaction{dayTransactions.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Day Financial Summary Cards */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 grid grid-cols-3 gap-2">
          {/* Income */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <ArrowDownLeft size={12} />
              <span>Income</span>
            </div>
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 truncate">
              {formatCurrency(totalIncome, settings.currency)}
            </div>
          </div>

          {/* Expense */}
          <div className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <ArrowUpRight size={12} />
              <span>Expense</span>
            </div>
            <div className="text-sm font-extrabold text-rose-700 dark:text-rose-300 mt-1 truncate">
              {formatCurrency(totalExpense, settings.currency)}
            </div>
          </div>

          {/* Net */}
          <div className={`p-2.5 rounded-2xl border ${
            netBalance >= 0
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-300'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider">
              Net Balance
            </div>
            <div className="text-sm font-extrabold mt-1 truncate">
              {formatCurrency(netBalance, settings.currency)}
            </div>
          </div>
        </div>

        {/* Method Breakdown Pills */}
        {(cashSpent > 0 || onlineSpent > 0) && (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Banknote size={13} className="text-amber-500" />
                <span>Cash: <strong>{formatCurrency(cashSpent, settings.currency)}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Smartphone size={13} className="text-emerald-500" />
                <span>Online: <strong>{formatCurrency(onlineSpent, settings.currency)}</strong></span>
              </span>
            </div>
          </div>
        )}

        {/* Itemized Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {dayTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <CalendarIcon size={26} />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No Transactions on this Day
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                No expenses or income entries have been recorded for {formatDate(dateStr)}.
              </p>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleAddCash}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  <Banknote size={14} />
                  <span>Add Cash</span>
                </button>
                <button
                  onClick={handleAddGeneral}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Record Transaction</span>
                </button>
              </div>
            </div>
          ) : (
            dayTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} showDate={false} />
            ))
          )}
        </div>

        {/* Drawer Bottom Quick Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2">
          <button
            onClick={handleAddCash}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
          >
            <Banknote size={15} />
            <span>Add Cash Entry</span>
          </button>
          <button
            onClick={handleAddGeneral}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
