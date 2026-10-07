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
    <div className="relative p-6 sm:p-7 rounded-3xl fin-card bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl backdrop-blur-xl text-left text-[var(--text-primary)] overflow-hidden">
      {/* Background Subtle Mesh Flare */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--divider)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--row-hover-bg)] border border-[var(--card-border)] text-[var(--accent-primary)] shadow-inner">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[var(--text-headings)] flex items-center gap-2">
              <span>Financial Command Center</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Precision telemetry across bank vaults, physical cash, and cashflow dynamics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[var(--row-hover-bg)] border border-[var(--card-border)] text-[var(--accent-primary)] text-xs font-mono font-bold tracking-tight">
            NET AVAILABLE: {formatCurrency(netAvailableMoney, settings.currency)}
          </span>
        </div>
      </div>

      {/* Top 6 Core Telemetry Counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        {/* Net Available */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-primary)] block mb-1 font-mono">
            Net Available
          </span>
          <div className="text-lg sm:text-xl font-black text-[var(--text-headings)] font-mono truncate">
            {formatCurrency(netAvailableMoney, settings.currency)}
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
            Banks + Cash
          </span>
        </div>

        {/* Total Banks */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-1 font-mono">
            Total Banks
          </span>
          <div className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
            <Building2 size={16} className="text-[var(--text-secondary)]" />
            <span>{totalBanks} Vaults</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
            Active Accounts
          </span>
        </div>

        {/* Total Bank Balance */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-1 font-mono">
            Bank Balances
          </span>
          <div className="text-lg sm:text-xl font-black text-[var(--text-primary)] font-mono truncate">
            {formatCurrency(totalBankBalance, settings.currency)}
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
            All Bank Vaults
          </span>
        </div>

        {/* Cash Available */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-1 font-mono">
            Cash Wallet
          </span>
          <div className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-1.5 font-mono truncate">
            <Wallet size={16} className="text-[var(--text-secondary)]" />
            <span>{formatCurrency(cashBalance, settings.currency)}</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block">
            Physical Reserves
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 block mb-1 font-mono flex items-center gap-1">
            <TrendingDown size={11} /> Total Outflow
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-500 font-mono truncate">
            {formatCurrency(totalExpenseAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block truncate">
            Month: {formatCurrency(thisMonthExpense, settings.currency)}
          </span>
        </div>

        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 block mb-1 font-mono flex items-center gap-1">
            <TrendingUp size={11} /> Total Inflow
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-500 font-mono truncate">
            {formatCurrency(totalIncomeAllTime, settings.currency)}
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 block truncate">
            Month: {formatCurrency(thisMonthIncome, settings.currency)}
          </span>
        </div>
      </div>

      {/* Analytical Insights Quad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Highest Expense Category */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)] flex-shrink-0">
            <PieChart size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] block">
              Highest Expense Category
            </span>
            <div className="text-sm font-black text-[var(--text-primary)] truncate">
              {highestExpenseCategory ? highestExpenseCategory.category : 'N/A'}
            </div>
            {highestExpenseCategory && (
              <span className="text-[11px] text-rose-500 font-mono font-semibold">
                {formatCurrency(highestExpenseCategory.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Largest Single Transaction */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)] flex-shrink-0">
            <Award size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] block">
              Largest Transaction
            </span>
            <div className="text-sm font-black text-[var(--text-primary)] truncate">
              {largestTransaction ? largestTransaction.merchant || largestTransaction.category : 'N/A'}
            </div>
            {largestTransaction && (
              <span className="text-[11px] text-[var(--text-primary)] font-mono font-semibold">
                {formatCurrency(largestTransaction.amount, settings.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Most Used Payment Method */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--row-hover-bg)] text-[var(--text-secondary)] border border-[var(--card-border)] flex-shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] block">
              Primary Payment Channel
            </span>
            <div className="text-sm font-black text-[var(--text-primary)]">
              {mostUsedPaymentMethod.replace('_', ' ')}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              Most Frequent
            </span>
          </div>
        </div>

        {/* Highest Balance Bank */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-subsurface)] border border-[var(--card-border)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--row-hover-bg)] text-emerald-500 border border-[var(--card-border)] flex-shrink-0">
            <Building2 size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] block">
              Highest Balance Bank
            </span>
            <div className="text-sm font-black text-[var(--text-primary)] truncate">
              {highestBalanceBank ? highestBalanceBank.name : 'N/A'}
            </div>
            {highestBalanceBank && (
              <span className="text-[11px] text-emerald-500 font-mono font-semibold">
                {formatCurrency(highestBalanceBank.balance, settings.currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
