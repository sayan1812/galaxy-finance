import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar 
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { ReportSummary } from '../components/reports/ReportSummary';
import { ExportButtons } from '../components/reports/ExportButtons';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { PaymentMethodChart } from '../components/dashboard/PaymentMethodChart';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { DailyExpenseChart } from '../components/dashboard/DailyExpenseChart';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { PaymentMethodBadge } from '../components/common/PaymentMethodBadge';
import { formatCurrency } from '../utils/formatters';
import { 
  filterByTimeRange, 
  getStartAndEndDateForFilter, 
  formatDate, 
  formatTime,
  isSameMonth
} from '../utils/dateUtils';
import type { TimeRangeFilter, Transaction } from '../types';

export const ReportsPage: React.FC = () => {
  const { transactions, settings } = useTransactions();

  const [period, setPeriod] = useState<TimeRangeFilter>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [reportTab, setReportTab] = useState<'summary' | 'daily' | 'yearly' | 'charts' | 'items'>('summary');

  // Filter transactions by selected period
  const reportTransactions = useMemo(() => {
    return transactions.filter((t) =>
      filterByTimeRange(t.date, period, customStart, customEnd)
    );
  }, [transactions, period, customStart, customEnd]);

  const { label: periodLabel } = useMemo(() => {
    return getStartAndEndDateForFilter(period, customStart, customEnd);
  }, [period, customStart, customEnd]);

  // Daily Breakdown Aggregates
  const dailyBreakdown = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; txCount: number }>();

    reportTransactions.forEach((t) => {
      const d = t.date ? t.date.slice(0, 10) : '';
      if (!d) return;

      const current = map.get(d) || { income: 0, expense: 0, txCount: 0 };
      current.txCount++;
      if (t.type === 'INCOME') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      map.set(d, current);
    });

    return Array.from(map.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
        txCount: data.txCount,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reportTransactions]);

  // Yearly Month-by-Month Table (Per Requirement Section 8)
  const yearlyBreakdown = useMemo(() => {
    const curYear = new Date().getFullYear();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return months.map((monthName, idx) => {
      const monthTxns = transactions.filter((t) => isSameMonth(t.date, curYear, idx));

      const income = monthTxns
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTxns
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;

      return {
        month: monthName,
        income,
        expense,
        net,
        count: monthTxns.length,
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={26} />
            <span>Financial Statements & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export comprehensive audits, daily logs, and tax statements
          </p>
        </div>

        {/* Export Buttons (CSV and PDF) */}
        <ExportButtons
          transactions={reportTransactions}
          periodLabel={periodLabel}
          currency={settings.currency}
        />
      </div>

      {/* Date Period Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'this_year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as TimeRangeFilter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  period === p.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
            <Calendar size={14} />
            <span>{periodLabel}</span>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex-1 sm:max-w-xs">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
            <div className="flex-1 sm:max-w-xs">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reports Section Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setReportTab('summary')}
          className={`pb-2.5 px-3 font-bold transition cursor-pointer whitespace-nowrap ${
            reportTab === 'summary'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Executive Summary
        </button>

        <button
          onClick={() => setReportTab('daily')}
          className={`pb-2.5 px-3 font-bold transition cursor-pointer whitespace-nowrap ${
            reportTab === 'daily'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Daily Income & Expenses
        </button>

        <button
          onClick={() => setReportTab('yearly')}
          className={`pb-2.5 px-3 font-bold transition cursor-pointer whitespace-nowrap ${
            reportTab === 'yearly'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Yearly Month-by-Month
        </button>

        <button
          onClick={() => setReportTab('charts')}
          className={`pb-2.5 px-3 font-bold transition cursor-pointer whitespace-nowrap ${
            reportTab === 'charts'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Visual Analytics
        </button>

        <button
          onClick={() => setReportTab('items')}
          className={`pb-2.5 px-3 font-bold transition cursor-pointer whitespace-nowrap ${
            reportTab === 'items'
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Itemized Statement ({reportTransactions.length})
        </button>
      </div>

      {/* Tab 1: Executive Summary */}
      {reportTab === 'summary' && (
        <ReportSummary
          transactions={reportTransactions}
          currency={settings.currency}
        />
      )}

      {/* Tab 2: Daily Breakdown Table */}
      {reportTab === 'daily' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Daily Income, Expense & Net Balance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of daily net cashflow for the selected period
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {dailyBreakdown.length} active days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Transactions</th>
                  <th className="pb-3 text-right">Income</th>
                  <th className="pb-3 text-right">Expense</th>
                  <th className="pb-3 text-right pr-2">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {dailyBreakdown.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-3 text-slate-500">
                      {row.txCount} item{row.txCount === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {row.income > 0 ? formatCurrency(row.income, settings.currency) : '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {row.expense > 0 ? formatCurrency(row.expense, settings.currency) : '-'}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span
                        className={`font-black ${
                          row.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(row.net, settings.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Yearly Month-by-Month Table (Section 8 Requirement) */}
      {reportTab === 'yearly' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Yearly Month-by-Month Statement ({new Date().getFullYear()})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                12-month calendar comparison of income, expenses, and savings
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pl-2">Month</th>
                  <th className="pb-3">Count</th>
                  <th className="pb-3 text-right">Total Income</th>
                  <th className="pb-3 text-right">Total Expense</th>
                  <th className="pb-3 text-right pr-2">Net Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {yearlyBreakdown.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">
                      {row.month}
                    </td>
                    <td className="py-3 text-slate-500">
                      {row.count} records
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {row.income > 0 ? formatCurrency(row.income, settings.currency) : '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {row.expense > 0 ? formatCurrency(row.expense, settings.currency) : '-'}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span
                        className={`font-black ${
                          row.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatCurrency(row.net, settings.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Visual Analytics (Charts) */}
      {reportTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoryPieChart />
          <PaymentMethodChart />
          <DailyExpenseChart />
          <IncomeExpenseChart />
        </div>
      )}

      {/* Tab 5: Itemized Statement */}
      {reportTab === 'items' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Itemized Financial Records
            </h3>
            <span className="text-xs text-slate-400">
              {reportTransactions.length} items in period
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pl-1">Date & Time</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Merchant / Payee</th>
                  <th className="pb-3">Details / Ref</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reportTransactions.map((t: Transaction) => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 pl-1 text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(t.date)}</div>
                        <div className="text-[10px] text-slate-400">{t.time || formatTime(t.date)}</div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.source === 'AUTOMATIC'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {t.source === 'AUTOMATIC' ? 'AUTO' : 'MANUAL'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon categoryName={t.category} size={13} showBackground={false} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{t.category}</span>
                        </div>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={t.paymentMethod} size="sm" />
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[140px]">
                        {t.merchant || '-'}
                      </td>
                      <td className="py-3 text-slate-500 truncate max-w-[200px]">
                        {t.description || (t.transactionReference ? `Ref: ${t.transactionReference}` : '-')}
                      </td>
                      <td className="py-3 text-right pr-2 whitespace-nowrap">
                        <span
                          className={`font-black text-sm ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {formatCurrency(t.amount, settings.currency)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
