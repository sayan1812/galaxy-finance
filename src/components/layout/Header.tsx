import React, { useState } from 'react';
import { 
  Plus, 
  Sun, 
  Moon,
  Orbit,
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
import { useTheme } from '../../context/ThemeContext';
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
  const { theme, cycleTheme } = useTheme();
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
    <header className="sticky top-0 z-30 bg-[#0D0D11]/90 backdrop-blur-md border-b border-white/[0.07] transition-colors shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Mobile / Tablet) */}
          <div className="flex items-center gap-3 cursor-pointer lg:hidden" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-[#4A121A] border border-[#E53935]/40 flex items-center justify-center text-[#FBFBFB] shadow-md shadow-[#4A121A]/40 btn-hover">
              <WalletCards size={20} className="stroke-[2.2] text-[#E53935]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#FBFBFB]">
                  Galaxy Finance
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#4A121A]/50 text-[#E53935] border border-[#E53935]/30">
                  {settings.currency.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Today Date on Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13131A] border border-white/[0.06] text-[#8E929D] text-xs font-mono font-semibold">
              <Calendar size={13} className="text-[#E53935]" />
              <span>Today: {todayStr}</span>
            </div>
          </div>

          {/* Tablet Nav Links */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 bg-[#13131A] p-1 rounded-xl border border-white/[0.06]">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer nav-item-hover ${
                    isActive
                      ? 'bg-[#D32F2F] text-[#FBFBFB] shadow-xs'
                      : 'text-[#8E929D] hover:text-[#FBFBFB]'
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#4A121A]/40 text-[#E53935] border border-[#E53935]/40 text-xs font-mono font-medium cursor-pointer hover:bg-[#4A121A] transition animate-pulse"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13131A] hover:bg-[#181822] border border-white/[0.08] text-[#8E929D] hover:text-[#FBFBFB] text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Open Cosmic AI Agent"
            >
              <Bot size={15} className="text-[#E53935]" />
              <span className="hidden sm:inline">AI Agent</span>
            </button>

            {/* Theme Mode Toggle (Light / Dark / Galaxy) */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl bg-[#13131A] border border-white/[0.08] text-[#8E929D] hover:text-[#FBFBFB] flex items-center justify-center shadow-xs cursor-pointer transition-all"
              title={`Active Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / Galaxy)`}
              aria-label="Cycle theme"
            >
              {theme === 'light' && <Sun size={16} className="text-amber-400" />}
              {theme === 'dark' && <Moon size={16} className="text-[#8E929D]" />}
              {theme === 'galaxy' && <Orbit size={16} className="text-[#E53935]" />}
            </button>

            {/* + Add Cash Button */}
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="btn-slate-subtle flex items-center gap-1 px-3 py-2 rounded-xl font-semibold text-xs tracking-wide shadow-xs transition cursor-pointer"
              title="Quick manual cash wallet entry"
            >
              <Banknote size={15} />
              <span>+ Cash</span>
            </button>

            {/* + Add Transaction Primary Crimson Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-crimson flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
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
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#13131A] border border-white/[0.08] hover:border-[#E53935]/40 transition cursor-pointer text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#4A121A] text-[#E53935] border border-[#4A121A] flex items-center justify-center font-bold text-[11px] font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium text-[#FBFBFB] truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </span>
                  {user.emailVerified && (
                    <ShieldCheck size={13} className="text-emerald-400" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#13131A] border border-white/[0.08] text-[#8E929D] hover:text-[#FBFBFB] hover:border-white/[0.15] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && isAuthenticated && user && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#13131A] border border-[rgba(74,18,26,0.4)] shadow-2xl p-2 z-50 text-[#FBFBFB] animate-micro-pop"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                    <p className="font-semibold text-xs text-[#FBFBFB] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#8E929D] truncate font-mono">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <ShieldCheck size={11} />
                      <span>{user.emailVerified ? 'Verified Account' : 'Verification Pending'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setCurrentTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/[0.04] text-[#8E929D] hover:text-[#FBFBFB] transition"
                  >
                    <Settings2 size={14} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[#4A121A]/30 text-[#E53935] transition mt-1"
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
