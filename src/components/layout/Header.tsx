import React, { useState } from 'react';
import { 
  Plus, 
  Sun, 
  Moon,
  Orbit,
  WalletCards, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Calendar,
  ListFilter, 
  PiggyBank, 
  RotateCcw, 
  Settings2,
  Building2,
  Banknote,
  User,
  LogOut,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SyncStatusBar } from '../sync/SyncStatusBar';
import { RealtimeDateBadge } from '../common/RealtimeDateBadge';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenDrawer }) => {
  const { 
    setIsAddModalOpen, 
    setIsAddCashModalOpen,
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

  return (
    <header className="sticky top-0 z-30 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--divider)] transition-colors shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hamburger Menu (Mobile / Tablet) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            {/* Hamburger Menu Trigger Button */}
            <button
              onClick={onOpenDrawer}
              className="p-2 -ml-1 rounded-xl text-[var(--text-primary)] hover:bg-[var(--row-hover-bg)] active:scale-95 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open mobile navigation menu"
              title="Open Navigation Menu"
            >
              <Menu size={22} className="stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-primary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--btn-primary-text)] shadow-md shadow-[var(--accent-glow)] btn-hover">
                <WalletCards size={18} className="stroke-[2.2]" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[var(--text-headings)] whitespace-nowrap">
                Galaxy Finance
              </span>
            </div>
          </div>

          {/* Real-time Reactive Date on Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <RealtimeDateBadge />
          </div>

          {/* Tablet Nav Links */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)]">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer nav-item-hover ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] shadow-xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            {/* Due Recurring Pill (Desktop/Tablet) */}
            {dueRecurringCount > 0 && (
              <button
                onClick={() => setCurrentTab('recurring')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--row-hover-bg)] text-[var(--accent-outflow)] border border-[var(--accent-outflow)]/40 text-xs font-mono font-medium cursor-pointer hover:bg-[var(--row-hover-bg)] transition animate-pulse"
                title={`${dueRecurringCount} recurring item(s) due today`}
              >
                <Clock size={13} />
                <span className="hidden sm:inline">Due:</span>
                <span className="font-bold">{dueRecurringCount}</span>
              </button>
            )}

            {/* Quick Sync Button (Desktop) */}
            <div className="hidden md:block">
              <SyncStatusBar compact />
            </div>

            {/* Theme Mode Toggle (Desktop) */}
            <button
              onClick={cycleTheme}
              className="hidden md:flex p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] items-center justify-center shadow-xs cursor-pointer transition-all"
              title={`Active Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / Galaxy)`}
              aria-label="Cycle theme"
            >
              {theme === 'light' && <Sun size={16} className="text-amber-500" />}
              {theme === 'dark' && <Moon size={16} className="text-[#89D7B7]" />}
              {theme === 'galaxy' && <Orbit size={16} className="text-[#89D7B7]" />}
            </button>

            {/* Cash Button (Desktop) */}
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="hidden md:flex btn-slate-subtle items-center gap-1 px-3 py-2 rounded-xl font-semibold text-xs tracking-wide shadow-xs transition cursor-pointer"
              title="Quick manual cash wallet entry"
            >
              <Banknote size={15} />
              <span>Cash</span>
            </button>

            {/* + Record Primary Action Button (Optimized for Mobile Pill & Desktop) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-hover flex items-center justify-center gap-1.5 px-[14px] py-[6px] min-h-[44px] rounded-full md:rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus size={16} className="stroke-[2.5] shrink-0" />
              <span className="hidden md:inline">Record Transaction</span>
              <span className="md:hidden font-bold">+ Record</span>
            </button>

            {/* User Profile / Auth Button (Desktop/Tablet) */}
            <div className="relative hidden md:block">
              {isAuthenticated && user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)] transition cursor-pointer text-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)] flex items-center justify-center font-bold text-[11px] font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium text-[var(--text-primary)] truncate max-w-[90px]">
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
                  className="px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && isAuthenticated && user && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-2 z-50 text-[var(--text-primary)] backdrop-blur-xl animate-micro-pop"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[var(--divider)] mb-1">
                    <p className="font-semibold text-xs text-[var(--text-headings)] truncate">{user.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate font-mono">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                      <ShieldCheck size={11} />
                      <span>{user.emailVerified ? 'Verified Account' : 'Verification Pending'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setCurrentTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[var(--row-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                  >
                    <Settings2 size={14} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[var(--row-hover-bg)] text-[var(--accent-outflow)] transition mt-1"
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
