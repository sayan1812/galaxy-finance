import React from 'react';
import { ShieldCheck, Heart, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryManager } from '../components/settings/CategoryManager';
import { DataManagement } from '../components/settings/DataManagement';

interface SettingsPageProps {
  onNavigate?: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { bankAccounts, totalBankBalance, cashBalance, settings } = useTransactions();

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={24} />
          <span>Cosmic & Financial Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Preferences, 3D Galaxy intensity, currency configuration, bank vaults, and offline data backups
        </p>
      </div>

      {/* Quick Bank & Vault Management Gateway */}
      {onNavigate && (
        <div 
          onClick={() => onNavigate('banks')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/30 hover:border-cyan-500/50 shadow-lg transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                Manage Banks & Financial Vaults ({bankAccounts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Total Bank Balances: <strong className="text-white">{formatCurrency(totalBankBalance, settings.currency)}</strong> • Cash: <strong className="text-amber-400">{formatCurrency(cashBalance, settings.currency)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Manage</span>
            <ChevronRight size={16} />
          </div>
        </div>
      )}

      {/* General & Data Management */}
      <DataManagement />

      {/* Custom Category Manager */}
      <CategoryManager />

      {/* App Info Footer */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300">
          <ShieldCheck size={16} className="text-cyan-400" />
          <span>RupeeWise Galaxy — 100% Client-Side Privacy & Zero Sensitive Data Storage</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
          All financial data, accounts, and transactions are stored safely inside your browser's persistent storage. No bank passwords, PINs, or CVVs are ever requested.
        </p>
        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
          Crafted with <Heart size={10} className="text-rose-500 fill-rose-500" /> for modern personal finance & cosmic wealth tracking
        </p>
      </div>
    </div>
  );
};
