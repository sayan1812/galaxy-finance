import React from 'react';
import { Wallet, ShieldCheck, ArrowUpRight, Plus, Sparkles, Building2 } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  className?: string;
}

/**
 * BalanceCard — Crimson Noir & Slate Edition
 * Executive, high-contrast fintech telemetry display with precision wine sub-surface and crimson accents.
 */
export const BalanceCard: React.FC<BalanceCardProps> = ({ className = '' }) => {
  const { commandCenterStats, settings, setIsAddModalOpen, setIsAddCashModalOpen } = useTransactions();
  const { netAvailableMoney, totalBankBalance, cashBalance, totalBanks } = commandCenterStats;

  return (
    <div
      className={`relative p-6 sm:p-7 rounded-3xl overflow-hidden fin-card bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-xl ${className}`}
      style={{
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Ambient Deep Wine Sub-surface Flare (Precision non-neon mesh) */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, #4A121A 0%, transparent 70%)',
        }}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A121A]/40 border border-[#4A121A] flex items-center justify-center text-[#E53935] shadow-inner">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#8E929D] uppercase">
                Liquidity Telemetry
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8E929D] bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                <ShieldCheck size={11} className="text-[#E53935]" /> Verified
              </span>
            </div>
            <h2 className="text-sm font-semibold text-[#FBFBFB]">
              Net Available Capital
            </h2>
          </div>
        </div>

        {/* Vital Metric Tag */}
        <span className="px-3 py-1 rounded-full bg-[#4A121A]/30 border border-[#E53935]/30 text-[#E53935] text-xs font-mono font-bold tracking-tight">
          SYS•ONLINE
        </span>
      </div>

      {/* Hero Financial Metric */}
      <div className="my-6">
        <span className="text-xs font-medium text-[#8E929D] block mb-1">
          True Available Money (Bank Vaults + Physical Cash)
        </span>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FBFBFB] font-mono">
            {formatCurrency(netAvailableMoney, settings.currency)}
          </h1>
          <span className="text-xs font-semibold text-[#8E929D] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] animate-pulse" />
            Real-time Solvency
          </span>
        </div>
      </div>

      {/* Vault Breakdown Telemetry */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#8E929D] mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 size={13} className="text-[#8E929D]" /> Bank Vaults ({totalBanks})
            </span>
          </div>
          <div className="text-lg font-bold text-[#FBFBFB] font-mono">
            {formatCurrency(totalBankBalance, settings.currency)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0D0D11]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#8E929D] mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-[#E53935]" /> Physical Cash Wallet
            </span>
          </div>
          <div className="text-lg font-bold text-[#FBFBFB] font-mono">
            {formatCurrency(cashBalance, settings.currency)}
          </div>
        </div>
      </div>

      {/* Action Buttons: Primary Crimson CTA & Secondary Slate Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 btn-crimson px-5 py-3 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Post Transaction</span>
        </button>

        <button
          onClick={() => setIsAddCashModalOpen(true)}
          className="btn-slate-subtle px-4 py-3 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowUpRight size={14} />
          <span>Adjust Cash</span>
        </button>
      </div>
    </div>
  );
};
