import React, { useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  Calendar, 
  Building2, 
  Banknote, 
  ListFilter, 
  PiggyBank, 
  RotateCcw, 
  FileText, 
  Settings2, 
  Plus, 
  Sun, 
  Moon, 
  Orbit, 
  LogOut, 
  User, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  WalletCards
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { AVAILABLE_CURRENCIES } from '../../constants/categories';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
}) => {
  const { 
    settings, 
    updateSettings,
    bankAccounts,
    totalBankBalance,
    cashBalance,
    dueRecurringCount,
    setIsAddModalOpen,
    setIsAddCashModalOpen 
  } = useTransactions();

  const { user, isAuthenticated, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const { theme, setTheme } = useTheme();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navLinks = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: BarChart3, badge: null },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: null },
    { id: 'banks', label: 'Bank Vaults', icon: Building2, badge: `${bankAccounts.length}` },
    { id: 'transactions', label: 'Transactions', icon: ListFilter, badge: null },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank, badge: null },
    { id: 'recurring', label: 'Recurring Schedules', icon: RotateCcw, badge: dueRecurringCount > 0 ? `${dueRecurringCount}` : null },
    { id: 'reports', label: 'Analytics & Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings2, badge: null },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  const handleAddTransactionClick = () => {
    onClose();
    setIsAddModalOpen(true);
  };

  const handleAddCashClick = () => {
    onClose();
    setIsAddCashModalOpen(true);
  };

  return (
    <>
      {/* Semi-transparent dark backdrop with blur */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-250 ease-out lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-label="Mobile Navigation Menu"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] bg-[var(--header-bg)] text-[var(--text-primary)] border-r border-[var(--divider)] shadow-2xl flex flex-col justify-between transition-transform duration-250 ease-out lg:hidden select-none overflow-x-hidden box-border min-w-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxSizing: 'border-box',
          paddingTop: 'max(1rem, env(safe-area-inset-top, 16px))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 16px))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 16px))',
          paddingRight: '1rem',
        }}
      >
        {/* Top Header & Close button */}
        <div className="w-full min-w-0 flex items-center justify-between pb-4 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-[var(--btn-primary-text)] shadow-md shadow-[var(--accent-glow)] shrink-0">
              <WalletCards size={18} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-base font-black tracking-tight text-[var(--text-headings)] block leading-tight truncate">
                Galaxy Finance
              </span>
              <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold truncate block">
                {settings?.currency?.symbol || '₹'} Cosmic Vaults
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover-bg)] transition cursor-pointer shrink-0"
            aria-label="Close navigation drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable middle content: Profile card, quick action, navigation links */}
        <div className="w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 pr-1 text-left">
          {/* User Profile Card */}
          {isAuthenticated && user ? (
            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] font-mono font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text-headings)] truncate">{user.name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate font-mono">{user.email}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-500 font-semibold">
                    <ShieldCheck size={11} />
                    <span>{user.emailVerified ? 'Verified Account' : 'Guest Account'}</span>
                  </div>
                </div>
              </div>

              {/* Balance Summary in Drawer */}
              <div className="mt-3 pt-2.5 border-t border-[var(--divider)] grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="p-1.5 rounded-lg bg-[var(--row-hover-bg)]">
                  <span className="text-[var(--text-secondary)] block">Vaults</span>
                  <span className="font-bold text-[var(--text-primary)]">{formatCurrency(totalBankBalance, settings.currency)}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[var(--row-hover-bg)]">
                  <span className="text-[var(--text-secondary)] block">Cash</span>
                  <span className="font-bold text-[var(--accent-inflow)]">{formatCurrency(cashBalance, settings.currency)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--row-hover-bg)] text-[var(--text-secondary)] flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-headings)]">Guest Session</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Sign in to sync your data</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] font-bold text-[11px] shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Dedicated Quick Action: Highlighted Record Transaction & Cash buttons */}
          <div className="space-y-1.5">
            <button
              onClick={handleAddTransactionClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] font-extrabold text-xs shadow-md shadow-[var(--accent-glow)] transition transform active:scale-98 cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Record Transaction</span>
            </button>

            <button
              onClick={handleAddCashClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--row-hover-bg)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-primary)] transition cursor-pointer"
            >
              <Banknote size={14} className="text-emerald-500" />
              <span>Quick Cash Entry</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 mb-1">
              Navigation
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'stroke-[2.5]' : ''} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                        isActive
                          ? 'bg-black/20 text-[var(--btn-primary-text)]'
                          : 'bg-[var(--row-hover-bg)] text-[var(--text-headings)] border border-[var(--card-border)]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className={isActive ? 'opacity-80' : 'opacity-40'} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Options anchored at the bottom: Currency, Theme/Orbit Toggle & Logout */}
        <div className="w-full min-w-0 pt-3 border-t border-[var(--divider)] space-y-2">
          {/* Currency Switcher */}
          <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] box-border min-w-0">
            <span className="text-xs font-medium text-[var(--text-secondary)] shrink-0">
              Currency
            </span>
            <div className="relative min-w-0 flex-1">
              <select
                value={settings.currency.code}
                onChange={(e) => {
                  const found = AVAILABLE_CURRENCIES.find((c) => c.code === e.target.value);
                  if (found) updateSettings({ currency: found });
                }}
                className="w-full min-w-0 appearance-none bg-transparent text-xs font-semibold text-[var(--accent-primary)] pr-6 pl-2 py-1 text-right focus:outline-none truncate cursor-pointer font-mono"
                aria-label="Select Currency"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[var(--card-bg)] text-[var(--text-primary)]">
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
              {/* Chevron Down Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-[var(--accent-primary)]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Theme & Orbit Mode Switcher */}
          <div className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Theme & Orbit</span>
              <span className="text-[10px] uppercase font-bold text-[var(--accent-primary)] font-mono">
                {theme}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] border-[var(--accent-primary)] shadow-xs'
                    : 'bg-[var(--row-hover-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun size={12} className={theme === 'light' ? 'text-[var(--btn-primary-text)]' : 'text-amber-500'} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] border-[var(--accent-primary)] shadow-xs'
                    : 'bg-[var(--row-hover-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon size={12} className={theme === 'dark' ? 'text-[var(--btn-primary-text)]' : 'text-[#89D7B7]'} />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('galaxy')}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  theme === 'galaxy'
                    ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] border-[var(--accent-primary)] shadow-xs'
                    : 'bg-[var(--row-hover-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Orbit size={12} className={theme === 'galaxy' ? 'text-[var(--btn-primary-text)]' : 'text-[#89D7B7]'} />
                <span>Orbit</span>
              </button>
            </div>
          </div>

          {/* Logout / Sign Out Button */}
          {isAuthenticated && user && (
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out of Account</span>
            </button>
          )}

          {/* Version / PWA Info */}
          <div className="text-center pt-0.5 text-[10px] text-[var(--text-secondary)] opacity-70 font-mono">
            Galaxy Finance v1.0 • PWA Ready
          </div>
        </div>
      </aside>
    </>
  );
};
