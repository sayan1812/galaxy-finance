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
    <aside className="hidden lg:flex flex-col w-64 bg-[#0D0D11]/95 backdrop-blur-2xl border-r border-white/[0.07] p-5 min-h-screen sticky top-0 text-left justify-between select-none shadow-[2px_0_20px_rgba(0,0,0,0.5)] z-30 transition-colors">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#4A121A] flex items-center justify-center text-[#FBFBFB] shadow-md shadow-[#4A121A]/50 group-hover:scale-105 transition-transform border border-[#E53935]/40">
            <Orbit size={22} className="stroke-[2.2] text-[#E53935]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#FBFBFB]">
                Galaxy
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#4A121A]/50 text-[#E53935] border border-[#E53935]/30">
                NOIR
              </span>
            </div>
            <p className="text-[11px] text-[#8E929D] font-medium">
              Crimson & Slate Edition
            </p>
          </div>
        </div>

        {/* Primary Call-to-Actions */}
        <div className="space-y-2">
          {/* Quick Cash Operations */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="btn-slate-subtle flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all cursor-pointer"
            >
              <Banknote size={14} />
              <span>+ Cash</span>
            </button>
            <button
              onClick={() => setIsCashExpenseModalOpen(true)}
              className="btn-slate-subtle flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all cursor-pointer text-[#E53935]"
            >
              <Minus size={14} />
              <span>− Outflow</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full btn-crimson flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left nav-item-hover ${
                  isActive
                    ? 'bg-[#4A121A]/35 text-[#FBFBFB] border border-[#E53935]/35 shadow-xs'
                    : 'text-[#8E929D] hover:text-[#FBFBFB] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-[#E53935]' : 'text-[#8E929D]'} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4A121A]/60 text-[#E53935] border border-[#E53935]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Controls */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        {/* AI Assistant Quick Launcher */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#13131A] hover:bg-[#181822] border border-white/[0.08] text-[#8E929D] hover:text-[#FBFBFB] text-xs font-bold transition shadow-xs cursor-pointer mb-2"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-[#E53935]" />
            <span>Fintech AI Agent</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#4A121A]/40 text-[#E53935] border border-[#E53935]/30 font-bold">
            PRO
          </span>
        </button>

        {/* Sync Status Mini Widget */}
        <SyncStatusBar compact />
      </div>
    </aside>
  );
};
