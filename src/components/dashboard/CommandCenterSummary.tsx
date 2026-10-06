import React from 'react';
import { 
  Building2, 
  Wallet, 
  Sparkles, 
  Award, 
  CreditCard,
  PieChart
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

export const CommandCenterSummary: React.FC = () => {
  const { commandCenterStats, settings } = useTransactions();
  const {
    netAvailableMoney,
    totalBanks,
    totalBankBalance,
    cashBalance,
    totalExpenseAllTime,
    totalIncomeAllTime,
    thisMonthExpense,
    thisMonthIncome,
    highestExpenseCategory,
    largestTransaction,
    mostUsedPaymentMethod,
    highestBalanceBank,
  } = commandCenterStats;

  return (
    <div className="relative p-6 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-xl text-left text-slate-900 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-indigo-100/40 via-cyan-100/30 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 shadow-xs">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Financial Command Center</span>
            </h2>
            <p className="text-xs text-slate-500">
              Cosmic telemetry across bank vaults, physical cash, and cashflow dynamics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-mono font-bold">
            NET AVAILABLE: {formatCurrency(netAvailableMoney, settings.currency)}
          </span>
        </div>
      </div>

      {/* Top 6 Core Telemetry Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        {/* Net Available */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block mb-1">
            Net Available
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {formatCurrency(netAvailableMoney, settings.currency)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Banks + Cash
          </span>
        </div>

        {/* Total Banks */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
            Total Banks
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
            <Building2 size={18} className="text-blue-600" />
            <span>{totalBanks} Accounts</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Active Vaults
          </span>
        </div>

        {/* Total Bank Balance */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
            Total Bank Balance
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {formatCurrency(totalBankBalance, settings.currency)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            All Bank Accounts
          </span>
        </div>

        {/* Cash Available */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block mb-1">
            Cash Wallet
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-700 flex items-center gap-1.5">
            <Wallet size={18} />
            <span>{formatCurrency(cashBalance, settings.currency)}</span>
          </div>
          <span className="text-[10px] text-amber-800/80 mt-1 block">
            Physical Reserves
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block mb-1">
            Total Expense
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-700">
            {formatCurrency(totalExpenseAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-rose-800/80 mt-1 block">
            This Month: {formatCurrency(thisMonthExpense, settings.currency)}
          </span>
        </div>

        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block mb-1">
            Total Income
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-700">
            {formatCurrency(totalIncomeAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-emerald-800/80 mt-1 block">
            This Month: {formatCurrency(thisMonthIncome, settings.currency)}
          </span>
        </div>
      </div>

      {/* Analytical Insights Quad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Highest Expense Category */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
            <PieChart size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Highest Expense Category
            </span>
            <div className="text-sm font-black text-slate-900 truncate">
              {highestExpenseCategory ? highestExpenseCategory.category : 'N/A'}
            </div>
            {highestExpenseCategory && (
              <span className="text-[11px] text-rose-600 font-semibold">
                {formatCurrency(highestExpenseCategory.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Largest Single Transaction */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 flex-shrink-0">
            <Award size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Largest Transaction
            </span>
            <div className="text-sm font-black text-slate-900 truncate">
              {largestTransaction ? largestTransaction.merchant || largestTransaction.category : 'N/A'}
            </div>
            {largestTransaction && (
              <span className="text-[11px] text-indigo-700 font-semibold">
                {formatCurrency(largestTransaction.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Most Used Payment Method */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700 flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Primary Payment Channel
            </span>
            <div className="text-sm font-black text-slate-900">
              {mostUsedPaymentMethod.replace('_', ' ')}
            </div>
            <span className="text-[11px] text-cyan-700 font-semibold">
              Most Frequent
            </span>
          </div>
        </div>

        {/* Highest Balance Bank */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
            <Building2 size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Highest Balance Bank
            </span>
            <div className="text-sm font-black text-slate-900 truncate">
              {highestBalanceBank ? highestBalanceBank.name : 'N/A'}
            </div>
            {highestBalanceBank && (
              <span className="text-[11px] text-emerald-700 font-semibold">
                {formatCurrency(highestBalanceBank.balance, settings.currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
