import React, { useState, useMemo } from 'react';
import { Plus, Download, Banknote } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { FilterBar } from '../components/transactions/FilterBar';
import type { FilterState } from '../components/transactions/FilterBar';
import { TransactionList } from '../components/transactions/TransactionList';
import { filterByTimeRange } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/exportUtils';

export const TransactionsPage: React.FC = () => {
  const { transactions, settings, setIsAddModalOpen, setIsAddCashModalOpen } = useTransactions();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    timeRange: 'all',
    customStartDate: '',
    customEndDate: '',
    type: 'all',
    source: 'all',
    category: 'all',
    paymentMethod: 'all',
    sortBy: 'date_desc',
  });

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          (t.transactionReference && t.transactionReference.toLowerCase().includes(q)) ||
          (t.account && t.account.toLowerCase().includes(q))
      );
    }

    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.source !== 'all') {
      result = result.filter((t) => t.source === filters.source);
    }

    if (filters.category !== 'all') {
      result = result.filter((t) => t.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.paymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === filters.paymentMethod);
    }

    if (filters.timeRange !== 'all') {
      result = result.filter((t) =>
        filterByTimeRange(t.date, filters.timeRange, filters.customStartDate, filters.customEndDate)
      );
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'date_desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [transactions, filters]);

  // Aggregates for filtered list
  const filteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredNet = filteredIncome - filteredExpense;

  const handleExportFilteredCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(filteredTransactions, settings.currency, `Filtered_Transactions_${today}.csv`);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter by source, payment method, category, and inspect all records
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportFilteredCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddCashModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
          >
            <Banknote size={15} />
            <span>+ Add Cash</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Record</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        totalMatches={filteredTransactions.length}
      />

      {/* Filtered Summary Banner */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Filtered Income</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(filteredIncome, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Filtered Expense</span>
          <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrency(filteredExpense, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Filtered Net</span>
          <span className={`text-sm sm:text-base font-extrabold ${filteredNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {filteredNet >= 0 ? '+' : ''}{formatCurrency(filteredNet, settings.currency)}
          </span>
        </div>
      </div>

      {/* Transaction List with Date Groups */}
      <TransactionList transactions={filteredTransactions} />
    </div>
  );
};
