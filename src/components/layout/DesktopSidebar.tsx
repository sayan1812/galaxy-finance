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
import logoImg from '../../assets/logo.png';

interface DesktopSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    setIsAddCashModalOpen, 
    setIsCashExpenseModalOpen,
    setIsAddModalOpen,
    dueRecurringCount
  } = useTransactions();

  const navItems = [
    { id: 'dashboard', label: 'Galaxy Dashboard', icon: Orbit },
    { id: 'calendar', label: 'Cosmic Calendar', icon: Calendar },
    { id: 'banks', label: 'Banks & Vaults', icon: Building2 },
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
          <img
            src={logoImg}
            alt="Galaxy Finance Logo"
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[var(--text-headings)] leading-tight">
              Galaxy <span className="text-[#38BDF8]">Finance</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#89D7B7] font-semibold -mt-0.5">
              Your Wealth • In Orbit
            </span>
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
              <Banknote size={14} className="text-emerald-500" />
              <span>Cash Inflow</span>
            </button>
            <button
              onClick={() => setIsCashExpenseModalOpen(true)}
              className="btn-slate-subtle flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all cursor-pointer text-[var(--accent-outflow)]"
            >
              <Minus size={14} />
              <span>Outflow</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full btn-hover flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Record Transaction</span>
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
    </aside>
  );
};
