import React, { useState } from 'react';
import { 
  Plus, 
  Sun, 
  WalletCards, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  ListFilter, 
  PiggyBank, 
  RotateCcw, 
  Settings2,
  Building2,
  Banknote,
  Bot,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateUtils';
import { SyncStatusBar } from '../sync/SyncStatusBar';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    settings, 
    setIsAddModalOpen, 
    setIsAddCashModalOpen,
    setIsAiModalOpen,
    dueRecurringCount 
  } = useTransactions();

  const { user, isAuthenticated, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'banks', label: 'Banks', icon: Building2 },
    { id: 'transactions', label: 'Transactions', icon: ListFilter },
    { id: 'reports', label: 'Reports', icon: CheckCircle2 },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'recurring', label: 'Recurring', icon: RotateCcw, badge: dueRecurringCount },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  const todayStr = formatDate(new Date().toISOString());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Mobile / Tablet) */}
          <div className="flex items-center gap-3 cursor-pointer lg:hidden" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <WalletCards size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  RupeeWise
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                  {settings.currency.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Today Date on Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Calendar size={14} className="text-cyan-600" />
              <span>Today: {todayStr}</span>
            </div>
          </div>

          {/* Tablet Nav Links */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Due Recurring Pill */}
            {dueRecurringCount > 0 && (
              <button
                onClick={() => setCurrentTab('recurring')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition animate-pulse"
                title={`${dueRecurringCount} recurring item(s) due today`}
              >
                <Clock size={13} />
                <span className="hidden sm:inline">Due:</span>
                <span className="font-bold">{dueRecurringCount}</span>
              </button>
            )}

            {/* Quick Sync Button */}
            <div className="hidden sm:block">
              <SyncStatusBar compact />
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Open Cosmic AI Agent"
            >
              <Bot size={15} className="text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">AI Agent</span>
            </button>

            {/* Light Mode Active Indicator */}
            <div
              className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs"
              title="Light Mode Active (Dark & Night modes withdrawn)"
            >
              <Sun size={17} className="text-amber-500" />
            </div>

            {/* + Add Cash Button */}
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              title="Quick manual cash wallet entry"
            >
              <Banknote size={15} />
              <span>+ Cash</span>
            </button>

            {/* + Add Transaction Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Record Transaction</span>
              <span className="sm:hidden">Record</span>
            </button>

            {/* User Profile / Auth Button */}
            <div className="relative">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-cyan-500/50 transition cursor-pointer text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium text-slate-800 truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </span>
                  {user.emailVerified && (
                    <ShieldCheck size={13} className="text-emerald-500" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-cyan-600 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && isAuthenticated && user && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-slate-800 animate-micro-pop"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-xs text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <ShieldCheck size={11} />
                      <span>{user.emailVerified ? 'Verified Account' : 'Verification Pending'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setCurrentTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-100 text-slate-700 transition"
                  >
                    <Settings2 size={14} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-rose-50 text-rose-600 transition mt-1"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
