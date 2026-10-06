import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  FileText, 
  Calendar,
  Banknote,
  Building2,
  Minus,
  Bot
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
    setIsAiModalOpen
  } = useTransactions();
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Section 23: On mobile use: Home | Calendar | Add | Banks | Reports
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setShowAddMenu(false)}
        >
          <div 
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-white rounded-3xl p-3.5 shadow-2xl border border-slate-200/90 space-y-2 animate-in slide-in-from-bottom-5 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Add Cash Inflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddCashModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-amber-400 text-amber-950 shadow-xs">
                <Banknote size={17} />
              </div>
              <div>
                <span className="block font-black text-xs text-slate-900">+ Add Cash Income</span>
                <span className="text-[10px] text-amber-800 font-medium">Wallet physical cash deposit</span>
              </div>
            </button>

            {/* 2. Cash Expense Outflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsCashExpenseModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                <Minus size={17} />
              </div>
              <div>
                <span className="block font-black text-xs text-slate-900">− Cash Expense</span>
                <span className="text-[10px] text-rose-700 font-medium">Quick cash spend deduction</span>
              </div>
            </button>

            {/* 3. Add Bank Account */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddBankModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-cyan-50 text-cyan-900 hover:bg-cyan-100 border border-cyan-200/80 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-cyan-500 text-white shadow-xs">
                <Building2 size={17} />
              </div>
              <div>
                <span className="block font-black text-xs text-slate-900">+ Add Bank Account</span>
                <span className="text-[10px] text-cyan-800 font-medium">Create new financial planet</span>
              </div>
            </button>

            {/* 4. Full Online / Standard Transaction */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <Plus size={17} />
              </div>
              <div>
                <span className="block font-black text-xs text-slate-900">Record Transaction</span>
                <span className="text-[10px] text-emerald-800 font-medium">UPI, Card, Bank, or Income</span>
              </div>
            </button>

            {/* 5. Ask AI Assistant */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAiModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/80 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                <Bot size={17} />
              </div>
              <div>
                <span className="block font-black text-xs text-slate-900">Ask Cosmic AI Agent</span>
                <span className="text-[10px] text-purple-800 font-medium">Smart search, summaries, advice</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 md:hidden safe-area-bottom pb-safe transition-colors shadow-lg">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {items.map((item) => {
            if (item.isSpecial) {
              return (
                <button
                  key="add-btn"
                  onClick={handleOpenAdd}
                  className="relative -top-3.5 flex flex-col items-center justify-center p-0 cursor-pointer group focus:outline-hidden"
                  aria-label="Add Transaction"
                >
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-active:scale-95 transition-transform border-4 border-white">
                    <Plus size={26} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 mt-0.5">
                    Add
                  </span>
                </button>
              );
            }

            const Icon = item.icon!;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 shadow-xs' : ''
                }`}>
                  <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                </div>
                <span className="text-[10px] font-bold tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
