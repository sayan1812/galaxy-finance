import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Flame, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Trophy 
} from 'lucide-react';
import type { Transaction, CurrencyConfig } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ReportSummaryProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  transactions,
  currency,
}) => {
  // Calculations
  const incomeList = transactions.filter((t: Transaction) => t.type === 'INCOME');
  const expenseList = transactions.filter((t: Transaction) => t.type === 'EXPENSE');

  const totalIncome = incomeList.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalExpense = expenseList.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Highest spending category
  const categoryTotals: { [key: string]: number } = {};
  expenseList.forEach((t: Transaction) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  let highestCategory = { name: 'None', amount: 0, percent: 0 };
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > highestCategory.amount) {
      highestCategory = {
        name: cat,
        amount: amt,
        percent: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
      };
    }
  });

  // Highest single transaction
  const highestTxn: Transaction | null = expenseList.reduce<Transaction | null>(
    (max: Transaction | null, t: Transaction) => (!max || t.amount > max.amount ? t : max),
    null
  );

  // Payment Breakdown
  const cashSpending = expenseList
    .filter((t: Transaction) => t.paymentMethod === 'CASH')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const upiSpending = expenseList
    .filter((t: Transaction) => t.paymentMethod === 'UPI')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const cardSpending = expenseList
    .filter((t: Transaction) => t.paymentMethod === 'CREDIT_CARD' || t.paymentMethod === 'DEBIT_CARD')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const bankTransferSpending = expenseList
    .filter((t: Transaction) => t.paymentMethod === 'BANK_TRANSFER')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* 3 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Income Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome, currency)}
          </div>
          <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/60 mt-1 font-medium">
            {incomeList.length} income entries
          </p>
        </div>

        {/* Expense Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpense, currency)}
          </div>
          <p className="text-[11px] text-rose-700/70 dark:text-rose-400/60 mt-1 font-medium">
            {expenseList.length} expense entries
          </p>
        </div>

        {/* Net Savings Card */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs ${
          netBalance >= 0
            ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-800/60'
            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Wallet size={18} />
            </div>
          </div>
          <div className={`text-2xl font-black ${
            netBalance >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {formatCurrency(netBalance, currency)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {totalIncome > 0 ? `Savings Rate: ${formatPercentage(savingsRate)}` : 'No income recorded'}
          </p>
        </div>
      </div>

      {/* Highlights: Highest Category & Highest Transaction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Highest Category */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Flame size={24} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Top Spending Category
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                {highestCategory.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPercentage(highestCategory.percent)} of total spending
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(highestCategory.amount, currency)}
            </div>
          </div>
        </div>

        {/* Highest Single Transaction */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Trophy size={24} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Largest Expense
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5 truncate max-w-[160px]">
                {highestTxn ? (highestTxn.merchant || highestTxn.category) : 'None'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {highestTxn ? highestTxn.category : '-'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              {highestTxn ? formatCurrency(highestTxn.amount, currency) : formatCurrency(0, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Spending Breakdown Grid */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Payment Method Breakdown (Selected Period)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* UPI */}
          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-1">
              <Smartphone size={14} />
              <span>UPI Spending</span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(upiSpending, currency)}
            </div>
            <span className="text-[10px] text-slate-400">
              {totalExpense > 0 ? formatPercentage((upiSpending / totalExpense) * 100) : '0%'} of spend
            </span>
          </div>

          {/* Cash */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              <Banknote size={14} />
              <span>Cash Spending</span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(cashSpending, currency)}
            </div>
            <span className="text-[10px] text-slate-400">
              {totalExpense > 0 ? formatPercentage((cashSpending / totalExpense) * 100) : '0%'} of spend
            </span>
          </div>

          {/* Cards */}
          <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold mb-1">
              <CreditCard size={14} />
              <span>Card Spending</span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(cardSpending, currency)}
            </div>
            <span className="text-[10px] text-slate-400">
              {totalExpense > 0 ? formatPercentage((cardSpending / totalExpense) * 100) : '0%'} of spend
            </span>
          </div>

          {/* Bank Transfer */}
          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1">
              <Wallet size={14} />
              <span>Bank Transfer</span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(bankTransferSpending, currency)}
            </div>
            <span className="text-[10px] text-slate-400">
              {totalExpense > 0 ? formatPercentage((bankTransferSpending / totalExpense) * 100) : '0%'} of spend
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
