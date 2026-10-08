import React from 'react';
import { Wallet, ArrowUpRight, Plus, Sparkles, Building2, Eye, EyeOff } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  className?: string;
}

/**
 * BalanceCard — Adaptive Bi-Modal Fintech Telemetry Display
 * High-contrast, theme-aware capital telemetry with jade/emerald accents.
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({ className = '' }) => {
  const { commandCenterStats, settings, setIsAddModalOpen, setIsAddCashModalOpen, isMasked, toggleMask } = useTransactions();
  const { netAvailableMoney, totalBankBalance, cashBalance, totalBanks } = commandCenterStats;

  return (
    <div
      className={`relative p-6 sm:p-7 rounded-3xl overflow-hidden fin-card bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl transition-colors duration-200 ${className}`}
    >
      {/* Ambient Jade Glow Sub-surface */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
        }}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-5 border-b border-[var(--divider)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                Liquidity Telemetry
              </span>
              <button
                type="button"
                onClick={toggleMask}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-headings)] hover:bg-[var(--row-hover-bg)] transition cursor-pointer"
                title={isMasked ? "Show Balances" : "Mask Balances"}
              >
                {isMasked ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-headings)]">
              Net Available Capital
            </h2>
          </div>
        </div>

        {/* Vital Metric Tag */}
        <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-mono font-bold tracking-tight">
          SYS•ONLINE
        </span>
      </div>

      {/* Hero Financial Metric */}
      <div className="my-6">
        <span className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
          True Available Money (Bank Vaults + Physical Cash)
        </span>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-headings)] font-mono">
            {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(netAvailableMoney, settings.currency)}
          </h1>
          <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            Real-time Solvency
          </span>
        </div>
      </div>

      {/* Vault Breakdown Telemetry */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 size={13} className="text-[var(--text-secondary)]" /> Bank Vaults ({totalBanks})
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--text-headings)] font-mono">
            {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(totalBankBalance, settings.currency)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--card-border)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-[var(--accent-primary)]" /> Physical Cash Wallet
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--text-headings)] font-mono">
            {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(cashBalance, settings.currency)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 px-5 py-3 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:opacity-90 active:scale-[0.98] transition shadow-md"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Post Transaction</span>
        </button>

        <button
          onClick={() => setIsAddCashModalOpen(true)}
          className="px-4 py-3 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--surface-sunken)] text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--row-hover-bg)] active:scale-[0.98] transition"
        >
          <ArrowUpRight size={14} />
          <span>Adjust Cash</span>
        </button>
      </div>
    </div>
  );
};
