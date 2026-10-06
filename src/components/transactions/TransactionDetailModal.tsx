import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  CreditCard, 
  Building2, 
  FileText, 
  Hash, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';
import { ConfirmModal } from '../layout/ConfirmModal';

export const TransactionDetailModal: React.FC = () => {
  const { 
    selectedTransaction, 
    setSelectedTransaction,
    setEditingTransaction,
    setIsAddModalOpen,
    duplicateTransaction,
    deleteTransaction,
    settings 
  } = useTransactions();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!selectedTransaction) return null;

  const isIncome = selectedTransaction.type === 'INCOME';

  const handleEdit = () => {
    const txn = selectedTransaction;
    setSelectedTransaction(null);
    setEditingTransaction(txn);
    setIsAddModalOpen(true);
  };

  const handleDuplicate = () => {
    duplicateTransaction(selectedTransaction.id);
    setSelectedTransaction(null);
  };

  const handleDelete = () => {
    deleteTransaction(selectedTransaction.id);
    setIsDeleteConfirmOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => setSelectedTransaction(null)}
      >
        <div 
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top colored strip / Header */}
          <div className={`p-6 text-center relative ${
            isIncome 
              ? 'bg-gradient-to-b from-emerald-500/15 to-transparent' 
              : 'bg-gradient-to-b from-rose-500/15 to-transparent'
          }`}>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-3">
              <CategoryIcon categoryName={selectedTransaction.category} size={28} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isIncome 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
              }`}>
                {isIncome ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                <span>{selectedTransaction.type}</span>
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                selectedTransaction.source === 'AUTOMATIC'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
              }`}>
                {selectedTransaction.source === 'AUTOMATIC' ? 'AUTO FEED' : 'MANUAL CASH'}
              </span>
            </div>

            <div className={`text-3xl sm:text-4xl font-black tracking-tight ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isIncome ? '+' : '-'}{formatCurrency(selectedTransaction.amount, settings.currency)}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatDate(selectedTransaction.date)} at {selectedTransaction.time || formatTime(selectedTransaction.date)}
            </p>
          </div>

          {/* Details List */}
          <div className="px-6 py-4 space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CategoryIcon categoryName={selectedTransaction.category} size={14} showBackground={false} />
                Category
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedTransaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard size={14} />
                Payment Method
              </span>
              <PaymentMethodBadge method={selectedTransaction.paymentMethod} size="sm" />
            </div>

            {selectedTransaction.account && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Wallet size={14} />
                  Account / Source
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[200px] truncate">
                  {selectedTransaction.account}
                </span>
              </div>
            )}

            {selectedTransaction.merchant && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 size={14} />
                  Merchant / Payee
                </span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[200px] truncate">
                  {selectedTransaction.merchant}
                </span>
              </div>
            )}

            {selectedTransaction.description && (
              <div className="flex items-start justify-between pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <FileText size={14} />
                  Note
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[220px]">
                  {selectedTransaction.description}
                </span>
              </div>
            )}

            {selectedTransaction.transactionReference && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hash size={14} />
                  Reference ID
                </span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {selectedTransaction.transactionReference}
                </span>
              </div>
            )}

            {selectedTransaction.isRecurring && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Repeat size={14} />
                  Recurring
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                  Auto-scheduled
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Duplicate this transaction"
            >
              <Copy size={15} />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Edit3 size={15} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
              title="Delete transaction"
              aria-label="Delete transaction"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this ${selectedTransaction.category} ${selectedTransaction.type} of ${formatCurrency(selectedTransaction.amount, settings.currency)}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};
