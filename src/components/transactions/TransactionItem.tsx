import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Copy, Edit3 } from 'lucide-react';
import type { Transaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
  onSelect?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  showDate = false,
  onSelect,
}) => {
  const { 
    setSelectedTransaction, 
    setEditingTransaction, 
    setIsAddModalOpen, 
    duplicateTransaction,
    settings 
  } = useTransactions();

  const isIncome = transaction.type === 'INCOME';

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedTransaction(transaction);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateTransaction(transaction.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const timeDisplay = transaction.time || formatTime(transaction.createdAt || transaction.date);

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Left: Icon & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        <CategoryIcon categoryName={transaction.category} size={20} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {transaction.merchant || transaction.category}
            </h4>
            {transaction.merchant && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                {transaction.category}
              </span>
            )}
            {transaction.account && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 truncate max-w-[120px] hidden sm:inline-block">
                {transaction.account}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>
              {showDate ? `${formatDate(transaction.date)}, ${timeDisplay}` : timeDisplay}
            </span>
            <span>•</span>
            <PaymentMethodBadge 
              method={transaction.paymentMethod} 
              source={transaction.source} 
              size="sm" 
              showSource={true} 
            />
            {transaction.description && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline truncate max-w-[180px] text-slate-600 dark:text-slate-300">
                  {transaction.description}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & Quick Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div
            className={`flex items-center justify-end font-bold text-sm sm:text-base tracking-tight ${
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size={16} className="inline mr-0.5" />
            ) : (
              <ArrowUpRight size={16} className="inline mr-0.5" />
            )}
            <span>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, settings.currency)}
            </span>
          </div>

          {transaction.transactionReference && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:block truncate max-w-[120px]">
              {transaction.transactionReference}
            </span>
          )}
        </div>

        {/* Hover quick action buttons for desktop */}
        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Duplicate"
            aria-label="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
            title="Edit"
            aria-label="Edit"
          >
            <Edit3 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
