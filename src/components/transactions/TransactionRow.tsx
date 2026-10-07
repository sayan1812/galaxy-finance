import { ArrowUpRight, ArrowDownLeft, Copy, Edit3, Trash2 } from 'lucide-react';
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
 * TransactionRow — Adaptive Bi-Modal Fintech Telemetry Row
 * - Theme-compliant surface with responsive borders
 * - Emerald for inflows, soft coral/crimson for outflows
 * - High-contrast headings and metadata
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
    requestDeleteTransaction,
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    requestDeleteTransaction(transaction.id);
  };

  const timeDisplay = transaction.time || formatTime(transaction.createdAt || transaction.date);

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--row-hover-bg)] cursor-pointer select-none transition-all duration-150 shadow-xs"
    >
      {/* Left: Category Icon & Metadata */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
        <div className="txn-icon transition-transform duration-200">
          <CategoryIcon categoryName={transaction.category} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-[var(--text-headings)] truncate">
              {transaction.merchant || transaction.category}
            </h4>
            {transaction.merchant && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--card-border)] truncate max-w-[130px]">
                {transaction.category}
              </span>
            )}
            {transaction.account && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--card-border)] truncate max-w-[120px] hidden sm:inline-block font-mono">
                {transaction.account}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)] flex-wrap">
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
                <span className="hidden sm:inline truncate max-w-[200px] text-[var(--text-muted)]">
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
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
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
            <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:block truncate max-w-[130px]">
              {transaction.transactionReference}
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={handleDuplicate}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition"
            title="Duplicate"
            aria-label="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-sunken)] transition"
            title="Edit"
            aria-label="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition"
            title="Delete Transaction"
            aria-label="Delete Transaction"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
