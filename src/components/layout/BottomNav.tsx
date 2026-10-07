import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  FileText, 
  Calendar, 
  Banknote, 
  Building2, 
  Minus 
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    setIsAddModalOpen, 
    setIsAddCashModalOpen, 
    setIsCashExpenseModalOpen, 
    setIsAddBankModalOpen,
  } = useTransactions();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const items = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'add', label: 'Add', isSpecial: true },
    { id: 'banks', label: 'Banks', icon: Building2 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleOpenAdd = () => {
    setShowAddMenu(!showAddMenu);
  };

  return (
    <>
      {/* Floating Add Menu for Quick Selection */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 bg-[var(--card-bg)] rounded-3xl p-3.5 shadow-2xl border border-[var(--card-border)] space-y-2 animate-in slide-in-from-bottom-5 text-[var(--text-primary)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Add Cash Inflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddCashModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-page)] hover:bg-[var(--row-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 shadow-xs">
                <Banknote size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[var(--text-primary)]">+ Add Cash Inflow</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">Physical cash deposit</span>
              </div>
            </button>

            {/* 2. Cash Expense Outflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsCashExpenseModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-page)] hover:bg-[var(--row-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 shadow-xs">
                <Minus size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[var(--text-primary)]">− Cash Outflow</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">Wallet cash spending</span>
              </div>
            </button>

            {/* 3. Record Full Transaction */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] shadow-md transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-black/15 text-[var(--btn-primary-text)]">
                <Plus size={17} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="block font-bold text-xs">Record Full Transaction</span>
                <span className="text-[10px] opacity-80 font-medium">Bank, UPI, Card, Transfer</span>
              </div>
            </button>

            {/* 4. Link Bank Vault */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddBankModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--bg-page)] hover:bg-[var(--row-hover-bg)] text-[var(--text-primary)] border border-[var(--card-border)] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-[var(--row-hover-bg)] text-[var(--text-secondary)] shadow-xs">
                <Building2 size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[var(--text-primary)]">Link Bank Vault</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">Add financial account</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Ergonomic Floating Bottom Navigation Bar (<= 768px) */}
      <nav 
        className="fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto bg-[var(--sidebar-bg)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl md:hidden safe-area-bottom pb-safe transition-colors shadow-2xl"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {items.map((item) => {
            if (item.isSpecial) {
              return (
                <div key="add-btn" className="flex items-center justify-center">
                  <button
                    onClick={handleOpenAdd}
                    className="relative -top-4 flex flex-col items-center justify-center min-w-[48px] min-h-[48px] p-0 cursor-pointer group focus:outline-hidden"
                    aria-label="Add Transaction"
                  >
                    <div className="w-13 h-13 rounded-full bg-[var(--accent-primary)] text-[var(--btn-primary-text)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] group-active:scale-95 transition-all border-4 border-[var(--bg-page)]">
                      <Plus size={26} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--accent-primary)] mt-0.5">
                      Add
                    </span>
                  </button>
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] h-full py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-[var(--accent-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[var(--row-hover-bg)] shadow-xs scale-105' : ''
                }`}>
                  <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {/* Active Tiny Baseline Glow Pip */}
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] mt-0.5" />
                ) : (
                  <span className="w-1.5 h-1.5 mt-0.5 opacity-0" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
