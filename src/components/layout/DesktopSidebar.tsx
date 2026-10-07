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
    <aside className="hidden lg:flex flex-col w-64 bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--divider)] p-5 min-h-screen sticky top-0 text-left justify-between select-none shadow-[2px_0_20px_rgba(0,0,0,0.15)] z-30 transition-colors">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--btn-primary-text)] shadow-md shadow-[var(--accent-glow)] group-hover:scale-105 transition-transform border border-[var(--card-border)]">
            <Orbit size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[var(--text-headings)]">
                Galaxy
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)]">
                JADE
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Emerald Wealth System
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
              className="btn-slate-subtle flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all cursor-pointer text-[var(--accent-outflow)]"
            >
              <Minus size={14} />
              <span>− Outflow</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full btn-hover flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
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
                    ? 'bg-[var(--row-hover-bg)] text-[var(--text-headings)] border border-[var(--card-border-hover)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover-bg)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Controls */}
      <div className="pt-4 border-t border-[var(--divider)] space-y-3">
        {/* Sync Status Mini Widget */}
        <SyncStatusBar compact />
      </div>
    </aside>
  );
};
