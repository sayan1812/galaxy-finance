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
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-[#13131A] rounded-3xl p-3.5 shadow-2xl border border-[rgba(74,18,26,0.45)] space-y-2 animate-in slide-in-from-bottom-5 text-[#FBFBFB]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Add Cash Inflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddCashModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#0D0D11] hover:bg-[#181822] text-[#FBFBFB] border border-white/[0.06] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-[#4A121A] text-[#E53935] shadow-xs">
                <Banknote size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#FBFBFB]">+ Add Cash Inflow</span>
                <span className="text-[10px] text-[#8E929D] font-medium">Physical cash deposit</span>
              </div>
            </button>

            {/* 2. Cash Expense Outflow */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsCashExpenseModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#0D0D11] hover:bg-[#181822] text-[#FBFBFB] border border-white/[0.06] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-[#4A121A]/50 text-[#E53935] shadow-xs">
                <Minus size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#FBFBFB]">− Cash Outflow</span>
                <span className="text-[10px] text-[#8E929D] font-medium">Wallet cash spending</span>
              </div>
            </button>

            {/* 3. Record Full Transaction */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#D32F2F] text-[#FBFBFB] hover:brightness-110 shadow-md shadow-[#D32F2F]/30 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-black/20 text-[#FBFBFB]">
                <Plus size={17} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#FBFBFB]">Record Full Transaction</span>
                <span className="text-[10px] text-white/80 font-medium">Bank, UPI, Card, Transfer</span>
              </div>
            </button>

            {/* 4. Link Bank Vault */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAddBankModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#0D0D11] hover:bg-[#181822] text-[#FBFBFB] border border-white/[0.06] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-white/[0.05] text-[#8E929D] shadow-xs">
                <Building2 size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#FBFBFB]">Link Bank Vault</span>
                <span className="text-[10px] text-[#8E929D] font-medium">Add financial account</span>
              </div>
            </button>

            {/* 5. Ask AI Assistant */}
            <button
              onClick={() => {
                setShowAddMenu(false);
                setIsAiModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#0D0D11] hover:bg-[#181822] text-[#FBFBFB] border border-white/[0.06] transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-xl bg-[#4A121A]/40 text-[#E53935] shadow-xs">
                <Bot size={17} />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#FBFBFB]">Ask Fintech AI Agent</span>
                <span className="text-[10px] text-[#8E929D] font-medium">Smart telemetry, summaries</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D11]/95 backdrop-blur-xl border-t border-white/[0.07] md:hidden safe-area-bottom pb-safe transition-colors shadow-lg">
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
                  <div className="w-13 h-13 rounded-full bg-[#D32F2F] text-[#FBFBFB] flex items-center justify-center shadow-lg shadow-[#D32F2F]/30 group-active:scale-95 transition-transform border-4 border-[#0D0D11]">
                    <Plus size={26} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#E53935] mt-0.5">
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
                    ? 'text-[#E53935] scale-105'
                    : 'text-[#8E929D] hover:text-[#FBFBFB]'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#4A121A]/40 shadow-xs' : ''
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
