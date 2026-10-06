import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { 
  TimeRangeFilter, 
  SortOption, 
  TransactionType, 
  PaymentMethod,
  TransactionSource
} from '../../types';
import { PAYMENT_METHODS } from '../../constants/categories';
import { useTransactions } from '../../context/TransactionContext';

export interface FilterState {
  searchQuery: string;
  timeRange: TimeRangeFilter;
  customStartDate: string;
  customEndDate: string;
  type: 'all' | TransactionType;
  source: 'all' | TransactionSource;
  category: string;
  paymentMethod: 'all' | PaymentMethod;
  sortBy: SortOption;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
}) => {
  const { categories } = useTransactions();

  const handleReset = () => {
    setFilters({
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
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.timeRange !== 'all' ||
    filters.type !== 'all' ||
    filters.source !== 'all' ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.sortBy !== 'date_desc';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Top Row: Search & Quick Type Pills & Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant, notes, category, reference..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Toggle Pills: All / Expense / Income */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Types' },
            { id: 'EXPENSE', label: 'Expenses' },
            { id: 'INCOME', label: 'Income' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilters((prev) => ({ ...prev, type: t.id as FilterState['type'] }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.type === t.id
                  ? t.id === 'EXPENSE'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : t.id === 'INCOME'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Source Toggle Pills: All / Auto / Manual */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'AUTOMATIC', label: 'Online / Auto' },
            { id: 'MANUAL', label: 'Cash / Manual' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilters((prev) => ({ ...prev, source: s.id as FilterState['source'] }))}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.source === s.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer self-end sm:self-auto"
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Second Row: Dropdown Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Date Range Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Date Period
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, timeRange: e.target.value as TimeRangeFilter }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Date Range...</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value as 'all' | PaymentMethod }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Option */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Custom Date Picker Inputs if 'custom' is active */}
      {filters.timeRange === 'custom' && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.customStartDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, customStartDate: e.target.value }))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={filters.customEndDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, customEndDate: e.target.value }))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs"
            />
          </div>
        </div>
      )}

      {/* Results Count Banner */}
      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-1 flex items-center justify-between">
        <span>Showing {totalMatches} matching record{totalMatches === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
};
