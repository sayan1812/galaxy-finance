import React from 'react';
import { 
  Orbit, 
  Calendar, 
  ListFilter, 
  Banknote, 
  FileText, 
  PiggyBank, 
  Building2, 
  RotateCcw, 
  Settings2,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';

interface DesktopSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    setIsAddCashModalOpen, 
    setIsCashExpenseModalOpen,
    setIsAddModalOpen,
    setIsAiModalOpen,
    dueRecurringCount,
    bankAccounts
  } = useTransactions();

  const navItems = [
    { id: 'dashboard', label: 'Galaxy Dashboard', icon: Orbit },
    { id: 'calendar', label: 'Cosmic Calendar', icon: Calendar },
    { id: 'banks', label: 'Banks & Vaults', icon: Building2, badge: bankAccounts.length },
    { id: 'transactions', label: 'Transactions Log', icon: ListFilter },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
    { id: 'budgets', label: 'Monthly Budgets', icon: PiggyBank },
    { id: 'recurring', label: 'Recurring Schedules', icon: RotateCcw, badge: dueRecurringCount },
    { id: 'settings', label: 'Cosmic Settings', icon: Settings2 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/85 backdrop-blur-2xl border-r border-slate-200/80 p-5 min-h-screen sticky top-0 text-left justify-between select-none shadow-[2px_0_20px_rgba(0,0,0,0.03)] z-30">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform border border-indigo-400/40">
            <Orbit size={24} className="stroke-[2.2] animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900">
                RupeeWise
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                GALAXY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              3D Cosmic Finance
            </p>
          </div>
        </div>

        {/* Primary Call-to-Actions: Add Cash & Full Record */}
        <div className="space-y-2">
          {/* Quick Cash Operations */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <Banknote size={15} />
              <span>+ Add Cash</span>
            </button>
            <button
              onClick={() => setIsCashExpenseModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs active:scale-98 transition-all cursor-pointer"
            >
              <Minus size={15} />
              <span>− Cash Exp</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>+ Record Transaction</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Controls */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        {/* AI Assistant Quick Launcher */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 via-cyan-50 to-indigo-50 hover:from-purple-100 hover:to-cyan-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition shadow-xs cursor-pointer mb-2"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Cosmic AI Agent</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold">
            ASK AI
          </span>
        </button>

        {/* Sync Status Mini Widget */}
        <SyncStatusBar compact />
      </div>
    </aside>
  );
};
