import React, { useState, useEffect } from 'react';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { InstallAppModal } from './components/common/InstallAppModal';
import { CosmicBackground } from './components/galaxy/CosmicBackground';
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { CashTransactionModal } from './components/transactions/CashTransactionModal';
import { CashExpenseModal } from './components/cash/CashExpenseModal';
import { BankModal } from './components/banks/BankModal';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { DuplicatePromptModal } from './components/sync/DuplicatePromptModal';
import { ConfirmModal } from './components/layout/ConfirmModal';
import { MicroInteractionToast } from './components/common/MicroInteractionToast';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldCheck, PlusCircle } from 'lucide-react';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { BanksPage } from './pages/BanksPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { RecurringPage } from './pages/RecurringPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasTriggeredOnboarding, setHasTriggeredOnboarding] = useState(false);

  const { 
    bankAccounts,
    setIsAddModalOpen, 
    setIsAddCashModalOpen,
    isCashExpenseModalOpen,
    setIsCashExpenseModalOpen,
    isAddBankModalOpen,
    setIsAddBankModalOpen,
    editingBank,
    setEditingBank,
    microInteraction,
    clearMicroInteraction,
    deleteConfirmation,
    cancelDeleteTransaction,
    confirmDeleteTransaction,
  } = useTransactions();

  // First-time user onboarding: If user has 0 linked accounts, open wizard
  useEffect(() => {
    if (!hasTriggeredOnboarding && bankAccounts && bankAccounts.length === 0) {
      setHasTriggeredOnboarding(true);
      const timer = setTimeout(() => {
        setIsAddBankModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bankAccounts, hasTriggeredOnboarding, setIsAddBankModalOpen]);

  // Global keyboard shortcuts (e.g. '+' opens Add modal, 'c' opens Add Cash, 'a' opens AI)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === '+' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsAddCashModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAddModalOpen, setIsAddCashModalOpen]);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'calendar':
        return <CalendarPage />;
      case 'banks':
      case 'accounts':
        return <BanksPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'recurring':
        return <RecurringPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentTab} />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Cosmic Starfield & Nebula Background */}
      <CosmicBackground />

      {/* Desktop Sidebar */}
      <DesktopSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-8">
        {/* Top Header */}
        <Header 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          onOpenDrawer={() => setIsMobileDrawerOpen(true)} 
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
          {/* First-time Onboarding Callout Banner if user has 0 linked accounts */}
          {bankAccounts && bankAccounts.length === 0 && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-micro-pop">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--row-hover-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-headings)]">Initialize Your First Account Vault</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Link your primary bank account or setup your cash reserve to unlock automated financial telemetry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(true)}
                className="btn-primary shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Bank / Cash Account</span>
              </button>
            </div>
          )}

          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* PWA & APK Download Notification Popup */}
      <InstallAppModal />

      {/* Global Modals & Micro-Interactions */}
      <TransactionFormModal />
      <CashTransactionModal />
      <CashExpenseModal 
        isOpen={isCashExpenseModalOpen}
        onClose={() => setIsCashExpenseModalOpen(false)}
      />
      <BankModal
        isOpen={isAddBankModalOpen}
        onClose={() => {
          setIsAddBankModalOpen(false);
          setEditingBank(null);
        }}
        editingBank={editingBank}
      />
      <TransactionDetailModal />
      <DuplicatePromptModal />

      {/* Global Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
        confirmLabel="Delete"
        onConfirm={confirmDeleteTransaction}
        onCancel={cancelDeleteTransaction}
      />

      {/* Expressive Micro-Interaction Reaction Toaster */}
      <MicroInteractionToast
        event={microInteraction}
        onDismiss={clearMicroInteraction}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

const AppGate: React.FC = () => {
  const { authState, isAuthenticated } = useAuth();

  // 1. Initializing state: High-security executive splash screen
  if (authState === 'INITIALIZING') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center text-[var(--text-primary)] relative overflow-hidden select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--card-border)] border-t-[var(--accent-primary)] animate-spin" />
          <ShieldCheck className="w-6 h-6 text-[var(--accent-primary)] absolute" />
        </div>
        <div className="mt-5 font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] animate-pulse">
          Restoring Financial Telemetry...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: Mandatory interactive canvas login gate
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 3. Authenticated state: Protected Application Shell
  return <MainLayout />;
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TransactionProvider>
            <AppGate />
          </TransactionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
