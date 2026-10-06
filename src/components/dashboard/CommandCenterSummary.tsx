import React from 'react';
import { 
  Building2, 
  Wallet, 
  Sparkles, 
  Award, 
  CreditCard,
  PieChart,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

/**
 * CommandCenterSummary — Crimson Noir & Slate Edition
 * Executive Bloomberg-terminal meets Swiss minimalism fintech command panel.
 */
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
    <div className="relative p-6 sm:p-7 rounded-3xl fin-card bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-xl backdrop-blur-xl text-left text-[#FBFBFB] overflow-hidden">
      {/* Background Subtle Wine Mesh Flare */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #4A121A 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#4A121A]/40 border border-[#4A121A] text-[#E53935] shadow-inner">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#FBFBFB] flex items-center gap-2">
              <span>Financial Command Center</span>
            </h2>
            <p className="text-xs text-[#8E929D] font-medium">
              Precision telemetry across bank vaults, physical cash, and cashflow dynamics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#4A121A]/30 border border-[#E53935]/30 text-[#E53935] text-xs font-mono font-bold tracking-tight">
            NET AVAILABLE: {formatCurrency(netAvailableMoney, settings.currency)}
          </span>
        </div>
      </div>

      {/* Top 6 Core Telemetry Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        {/* Net Available */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-[rgba(74,18,26,0.4)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#E53935] block mb-1 font-mono">
            Net Available
          </span>
          <div className="text-lg sm:text-xl font-black text-[#FBFBFB] font-mono truncate">
            {formatCurrency(netAvailableMoney, settings.currency)}
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block">
            Banks + Cash
          </span>
        </div>

        {/* Total Banks */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-white/[0.06] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E929D] block mb-1 font-mono">
            Total Banks
          </span>
          <div className="text-lg sm:text-xl font-black text-[#FBFBFB] flex items-center gap-1.5 font-mono">
            <Building2 size={16} className="text-[#8E929D]" />
            <span>{totalBanks} Vaults</span>
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block">
            Active Accounts
          </span>
        </div>

        {/* Total Bank Balance */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-white/[0.06] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E929D] block mb-1 font-mono">
            Bank Balances
          </span>
          <div className="text-lg sm:text-xl font-black text-[#FBFBFB] font-mono truncate">
            {formatCurrency(totalBankBalance, settings.currency)}
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block">
            All Bank Vaults
          </span>
        </div>

        {/* Cash Available */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-white/[0.06] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E929D] block mb-1 font-mono">
            Cash Wallet
          </span>
          <div className="text-lg sm:text-xl font-black text-[#FBFBFB] flex items-center gap-1.5 font-mono truncate">
            <Wallet size={16} className="text-[#8E929D]" />
            <span>{formatCurrency(cashBalance, settings.currency)}</span>
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block">
            Physical Reserves
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-[#4A121A]/50 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#E53935] block mb-1 font-mono flex items-center gap-1">
            <TrendingDown size={11} /> Total Outflow
          </span>
          <div className="text-lg sm:text-xl font-black text-[#E53935] font-mono truncate">
            {formatCurrency(totalExpenseAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block truncate">
            Month: {formatCurrency(thisMonthExpense, settings.currency)}
          </span>
        </div>

        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-[#0D0D11] border border-white/[0.06] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1 font-mono flex items-center gap-1">
            <TrendingUp size={11} /> Total Inflow
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono truncate">
            {formatCurrency(totalIncomeAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-[#8E929D] mt-1 block truncate">
            Month: {formatCurrency(thisMonthIncome, settings.currency)}
          </span>
        </div>
      </div>

      {/* Analytical Insights Quad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Highest Expense Category */}
        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/90 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#4A121A]/40 text-[#E53935] border border-[#4A121A] flex-shrink-0">
            <PieChart size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">
              Highest Expense Category
            </span>
            <div className="text-sm font-black text-[#FBFBFB] truncate">
              {highestExpenseCategory ? highestExpenseCategory.category : 'N/A'}
            </div>
            {highestExpenseCategory && (
              <span className="text-[11px] text-[#E53935] font-mono font-semibold">
                {formatCurrency(highestExpenseCategory.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Largest Single Transaction */}
        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/90 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] text-[#FBFBFB] border border-white/[0.08] flex-shrink-0">
            <Award size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">
              Largest Transaction
            </span>
            <div className="text-sm font-black text-[#FBFBFB] truncate">
              {largestTransaction ? largestTransaction.merchant || largestTransaction.category : 'N/A'}
            </div>
            {largestTransaction && (
              <span className="text-[11px] text-[#FBFBFB] font-mono font-semibold">
                {formatCurrency(largestTransaction.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Most Used Payment Method */}
        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/90 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.04] text-[#8E929D] border border-white/[0.08] flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">
              Primary Payment Channel
            </span>
            <div className="text-sm font-black text-[#FBFBFB]">
              {mostUsedPaymentMethod.replace('_', ' ')}
            </div>
            <span className="text-[11px] text-[#8E929D] font-medium">
              Most Frequent
            </span>
          </div>
        </div>

        {/* Highest Balance Bank */}
        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/90 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 flex-shrink-0">
            <Building2 size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">
              Highest Balance Bank
            </span>
            <div className="text-sm font-black text-[#FBFBFB] truncate">
              {highestBalanceBank ? highestBalanceBank.name : 'N/A'}
            </div>
            {highestBalanceBank && (
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                {formatCurrency(highestBalanceBank.balance, settings.currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
