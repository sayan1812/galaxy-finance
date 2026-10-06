import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Inbox } from 'lucide-react';
import type { Transaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { TransactionItem } from './TransactionItem';
import { getRelativeDateLabel, formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { ConfirmModal } from '../layout/ConfirmModal';

interface TransactionListProps {
  transactions: Transaction[];
  showGroupHeaders?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  showGroupHeaders = true,
}) => {
  const { 
    setIsAddModalOpen, 
    bulkDeleteTransactions, 
    settings 
  } = useTransactions();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Group transactions by Date String (YYYY-MM-DD)
  const grouped = useMemo(() => {
    if (!showGroupHeaders) return null;

    const groups: { [key: string]: { label: string; date: string; items: Transaction[]; totalExpense: number; totalIncome: number } } = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: getRelativeDateLabel(t.date),
          date: t.date,
          items: [],
          totalExpense: 0,
          totalIncome: 0,
        };
      }

      groups[dateKey].items.push(t);
      if (t.type === 'EXPENSE') {
        groups[dateKey].totalExpense += t.amount;
      } else {
        groups[dateKey].totalIncome += t.amount;
      }
    });

    return Object.entries(groups).map(([key, val]) => ({
      key,
      ...val,
    }));
  }, [transactions, showGroupHeaders]);

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <Inbox size={32} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          No Transactions Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          No financial records match your current filters or search query. Record your first transaction now!
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk action toolbar if items are selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold pl-2">
            <span>{selectedIds.length} item(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-slate-200 transition"
            >
              {selectedIds.length === transactions.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-xs"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Grouped View */}
      {grouped ? (
        grouped.map((group) => (
          <div key={group.key} className="space-y-2.5">
            {/* Date Group Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {group.label}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {formatDate(group.date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {group.totalExpense > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    -{formatCurrency(group.totalExpense, settings.currency)}
                  </span>
                )}
                {group.totalIncome > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{formatCurrency(group.totalIncome, settings.currency)}
                  </span>
                )}
              </div>
            </div>

            {/* List of items in this group */}
            <div className="space-y-2">
              {group.items.map((t) => (
                <TransactionItem key={t.id} transaction={t} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} showDate />
          ))}
        </div>
      )}

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Transactions?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} transactions? This action cannot be reversed.`}
        confirmLabel={`Delete ${selectedIds.length} items`}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  );
};
