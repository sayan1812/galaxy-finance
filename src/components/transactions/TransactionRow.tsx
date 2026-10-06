import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Copy, Edit3 } from 'lucide-react';
import type { Transaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';

interface TransactionRowProps {
  transaction: Transaction;
  showDate?: boolean;
  onSelect?: () => void;
}

/**
 * TransactionRow — Crimson Noir & Slate Edition
 * Exact micro-interaction specifications:
 * - Rest: Flat row with faint bottom hairline divider (rgba(255, 255, 255, 0.06)).
 * - Hover: translateX(4px), background tint rgba(255, 255, 255, 0.03), leading category icon scales slightly (1.06) with subtle wine-red highlight.
 */
export const TransactionRow: React.FC<TransactionRowProps> = ({
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
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#13131A] border border-[rgba(74,18,26,0.3)] txn-row-hover cursor-pointer select-none border-b border-b-white/[0.06]"
    >
      {/* Left: Category Icon & Metadata */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
        {/* Leading Category Icon with hover scale 1.06 & wine-red glow */}
        <div className="txn-icon transition-transform duration-200">
          <CategoryIcon categoryName={transaction.category} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-[#FBFBFB] truncate">
              {transaction.merchant || transaction.category}
            </h4>
            {transaction.merchant && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#4A121A]/30 text-[#8E929D] border border-white/[0.04] truncate max-w-[130px]">
                {transaction.category}
              </span>
            )}
            {transaction.account && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[#8E929D] border border-white/[0.06] truncate max-w-[120px] hidden sm:inline-block font-mono">
                {transaction.account}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#8E929D] flex-wrap">
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
                <span className="hidden sm:inline truncate max-w-[200px] text-[#8E929D]">
                  {transaction.description}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Currency Inflow / Outflow */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div
            className={`flex items-center justify-end font-bold text-sm sm:text-base font-mono tracking-tight ${
              isIncome
                ? 'text-emerald-400'
                : 'text-[#E53935]'
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
            <span className="text-[10px] text-[#8E929D]/70 font-mono hidden sm:block truncate max-w-[130px]">
              {transaction.transactionReference}
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-[#8E929D] hover:text-[#FBFBFB] hover:bg-white/[0.06] transition"
            title="Duplicate"
            aria-label="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-[#8E929D] hover:text-[#E53935] hover:bg-[#4A121A]/40 transition"
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
