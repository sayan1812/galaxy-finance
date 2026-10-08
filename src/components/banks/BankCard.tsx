import React from 'react';
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit3, 
  Trash2, 
  Receipt
} from 'lucide-react';
import type { BankComputedStats } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

interface BankCardProps {
  bankStats: BankComputedStats;
  onEdit: () => void;
  onDelete: () => void;
  onViewTransactions: () => void;
}

export const BankCard: React.FC<BankCardProps> = ({
  bankStats,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  const { settings, isMasked } = useTransactions();
  const { bank, currentBalance, totalIncome, totalExpense, transactionCount } = bankStats;

  return (
    <div className="relative group p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 backdrop-blur-xl flex flex-col justify-between overflow-hidden text-left">
      {/* Ambient Planet Glow Accent */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-all group-hover:opacity-40"
        style={{ backgroundColor: bank.planetColor || bank.color || '#38bdf8' }}
      />

      <div>
        {/* Top Header: Bank Info & Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{
                backgroundColor: `${bank.planetColor || bank.color || '#38bdf8'}18`,
                border: `1px solid ${bank.planetColor || bank.color || '#38bdf8'}40`,
                color: bank.planetColor || bank.color || '#38bdf8',
              }}
            >
              <Building2 size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  {bank.bankName}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {bank.accountType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {bank.nickname || 'Primary Account'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
            <button
              onClick={onEdit}
              title="Edit Bank Account"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={onDelete}
              title="Delete Bank Account"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Current Balance Display (Live dynamic computation) */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Current Available Balance
          </span>
          <div className="text-2xl font-black text-white tracking-tight">
            {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(currentBalance, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {bank.accountNumberMasked || 'XXXX XXXX 4521'}
          </div>
        </div>

        {/* Inflow vs Outflow Mini Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-1 text-emerald-400 font-bold mb-1">
              <ArrowDownLeft size={13} />
              <span>Income</span>
            </div>
            <div className="font-extrabold text-slate-100">
              {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(totalIncome, settings.currency)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-1 text-rose-400 font-bold mb-1">
              <ArrowUpRight size={13} />
              <span>Expenses</span>
            </div>
            <div className="font-extrabold text-slate-100">
              {isMasked ? `${settings.currency.symbol} ••••••` : formatCurrency(totalExpense, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Transaction Count & View Button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <Receipt size={14} className="text-indigo-400" />
          <span>{transactionCount} transactions</span>
        </div>

        <button
          onClick={onViewTransactions}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition cursor-pointer"
        >
          <span>View Statement</span>
        </button>
      </div>
    </div>
  );
};
