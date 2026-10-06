import React from 'react';
import { 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import type { RecurringTransaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';

interface RecurringItemProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: string) => void;
}

export const RecurringItem: React.FC<RecurringItemProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const { toggleRecurringActive, processRecurringItem, settings } = useTransactions();

  const isIncome = item.type === 'INCOME';

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dueDate = new Date(item.nextDueDate);
  const isDue = dueDate <= today;

  const getFrequencyLabel = () => {
    switch (item.frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Every week';
      case 'monthly': return 'Every month';
      case 'yearly': return 'Every year';
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
      item.isActive 
        ? isDue 
          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' 
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 shadow-xs' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <CategoryIcon categoryName={item.category} size={22} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {item.title}
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                {getFrequencyLabel()}
              </span>
              {isDue && item.isActive && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                  Due Now
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span>{item.category}</span>
              <span>•</span>
              <PaymentMethodBadge method={item.paymentMethod} size="sm" />
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Next: {formatDate(item.nextDueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-left sm:text-right">
            <span
              className={`font-black text-sm sm:text-base ${
                isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(item.amount, settings.currency)}
            </span>
            <span className="block text-[11px] text-slate-400">
              {item.isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {item.isActive && (
              <button
                onClick={() => processRecurringItem(item.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Record transaction now and advance next due date"
              >
                <CheckCircle2 size={14} />
                <span>Process</span>
              </button>
            )}

            <button
              onClick={() => toggleRecurringActive(item.id)}
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                item.isActive 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={item.isActive ? 'Pause rule' : 'Resume rule'}
            >
              {item.isActive ? <Pause size={14} /> : <Play size={14} />}
            </button>

            <button
              onClick={() => onEdit(item)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>

            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
