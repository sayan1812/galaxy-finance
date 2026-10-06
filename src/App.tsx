import React, { useState, useEffect } from 'react';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { BottomNav } from './components/layout/BottomNav';
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
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { Bot, Sparkles } from 'lucide-react';

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
  const { 
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
    isAiModalOpen,
    setIsAiModalOpen,
    deleteConfirmation,
    cancelDeleteTransaction,
    confirmDeleteTransaction,
    triggerMicroInteraction
  } = useTransactions();

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
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Top Header */}
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Floating AI Agent Trigger Button (Desktop / Tablet) */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/25 border border-cyan-300/40 active:scale-95 transition-all cursor-pointer group"
        title="Open Cosmic AI Financial Agent"
      >
        <Bot size={18} className="text-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="text-slate-950 font-black tracking-wide">Cosmic AI Agent</span>
        <Sparkles size={14} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
      </button>

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

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onTriggerMicroReaction={triggerMicroInteraction}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <MainLayout />
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
