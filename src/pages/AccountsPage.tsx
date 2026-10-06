import React from 'react';
import { 
  Building2, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatters';
import { SyncStatusBar } from '../components/sync/SyncStatusBar';
import type { ConnectedAccount } from '../types';

export const AccountsPage: React.FC = () => {
  const { connectedAccounts, syncStatus, triggerSync, settings, cashBalance } = useTransactions();

  const getAccountIcon = (type: ConnectedAccount['type']) => {
    switch (type) {
      case 'BANK_ACCOUNT':
        return <Building2 size={22} className="text-blue-600 dark:text-blue-400" />;
      case 'CREDIT_CARD':
        return <CreditCard size={22} className="text-purple-600 dark:text-purple-400" />;
      case 'UPI':
        return <Smartphone size={22} className="text-emerald-600 dark:text-emerald-400" />;
      case 'WALLET':
      default:
        return <Wallet size={22} className="text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="text-emerald-600 dark:text-emerald-400" size={26} />
            <span>Connected Financial Accounts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Integration-ready open banking & financial feeds for automated online transaction imports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSync(false)}
            disabled={syncStatus.state === 'SYNCING'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <RefreshCw size={14} className={syncStatus.state === 'SYNCING' ? 'animate-spin' : ''} />
            <span>Sync All Accounts</span>
          </button>
        </div>
      </div>

      {/* Sync Status Bar Banner */}
      <SyncStatusBar />

      {/* Security Architecture Notice (Per requirements: Do NOT pretend frontend directly accesses bank data) */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
        <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Integration-Ready Banking Architecture</span>
          <p className="leading-relaxed text-blue-800 dark:text-blue-300/90">
            For security, no confidential banking PINs, net-banking passwords, or CVVs are ever requested or stored. 
            All account numbers are masked (<code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.2 rounded font-mono">•••• 4821</code>). 
            Transactions are received securely via webhook/open-banking feed adapters with duplicate protection and merchant auto-categorization.
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectedAccounts.map((account) => {
          const isCash = account.type === 'WALLET';
          const displayBalance = isCash ? cashBalance : account.balance;

          return (
            <div
              key={account.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {account.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {account.institution} • <span className="font-mono">{account.accountMask}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {account.status}
                  </span>
                </div>

                <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isCash ? 'Available Cash Balance' : 'Account Balance / Limit'}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatCurrency(displayBalance, settings.currency)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Feed: <strong className="text-slate-700 dark:text-slate-300">{account.provider}</strong></span>
                <span className="text-[11px]">
                  {account.lastSyncedAt ? `Synced ${new Date(account.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not synced'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test / Simulation Tools Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Online Transaction Import & Conflict Testing
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Test incoming transaction payloads from online financial providers (UPI, Card POS, Net Banking) to verify the automatic categorization rules, merchant memory, and duplicate detection prompts.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => triggerSync(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Simulate Incoming Online Transaction (UPI/Card)</span>
          </button>

          <button
            onClick={() => triggerSync(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 font-bold text-xs hover:bg-amber-100 transition cursor-pointer"
          >
            <ShieldAlert size={14} />
            <span>Test Duplicate Conflict Detection Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
