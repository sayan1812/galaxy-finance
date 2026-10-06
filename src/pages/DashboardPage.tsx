import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Banknote, 
  Building2, 
  ListFilter, 
  Info,
  ChevronRight,
  Orbit,
  ShieldCheck
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatters';
import { FinancialGalaxy3D } from '../components/galaxy/FinancialGalaxy3D';
import { CommandCenterSummary } from '../components/dashboard/CommandCenterSummary';
import { WhereIsMoneyGoingChart } from '../components/dashboard/WhereIsMoneyGoingChart';
import { DailyExpenseChart } from '../components/dashboard/DailyExpenseChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { PaymentMethodChart } from '../components/dashboard/PaymentMethodChart';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { BudgetAlertBanner } from '../components/dashboard/BudgetAlertBanner';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { SyncStatusBar } from '../components/sync/SyncStatusBar';
import { BankDetailModal } from '../components/banks/BankDetailModal';
import { BankModal } from '../components/banks/BankModal';
import { CashExpenseModal } from '../components/cash/CashExpenseModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import type { BankAccount } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { 
    transactions, 
    settings, 
    setIsAddModalOpen, 
    setIsAddCashModalOpen,
    addCashTransaction,
    addTransaction,
    monthIncome,
    monthExpense,
    cashBalance,
    bankStatsList,
    totalBankBalance,
    netAvailableMoney,
    totalIncomeAllTime,
    totalExpenseAllTime,
  } = useTransactions();

  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [isAddBankOpen, setIsAddBankOpen] = useState<boolean>(false);
  const [isCashExpenseOpen, setIsCashExpenseOpen] = useState<boolean>(false);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);

  // Last 5 recent transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleQuickAddCash = (merchant: string, category: string, amount: number) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    addCashTransaction({
      type: 'EXPENSE',
      amount,
      category,
      merchant,
      description: `Quick ${merchant}`,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    });
  };

  const handleQuickAddUpi = (merchant: string, category: string, amount: number) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    addTransaction({
      type: 'EXPENSE',
      amount,
      currency: 'INR',
      paymentMethod: 'UPI',
      source: 'AUTOMATIC',
      category,
      merchant,
      description: `Quick ${merchant}`,
      account: 'SBI UPI (user@okhdfcbank)',
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    });
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* SECTION 1: CRIMSON NOIR BALANCE & TELEMETRY HERO */}
      <div className="reveal-on-scroll stagger-1 relative rounded-3xl p-6 sm:p-8 bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-xl backdrop-blur-xl text-[#FBFBFB] overflow-hidden fin-card">
        {/* Subtle Deep Wine Ambient Radial Mesh */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #4A121A 0%, transparent 70%)' }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #8E929D 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A121A]/30 border border-[#E53935]/30 text-[11px] font-mono font-bold uppercase tracking-wider text-[#E53935]">
              <ShieldCheck size={13} className="text-[#E53935]" />
              <span>Capital Solvency Engine</span>
            </div>

            <h1 className="text-xs uppercase font-mono font-bold tracking-widest text-[#8E929D]">
              NET AVAILABLE CAPITAL
            </h1>

            {/* Central Metric */}
            <div className="flex items-baseline gap-3">
              <AnimatedCounter
                value={netAvailableMoney}
                prefix={settings.currency.symbol}
                className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-[#FBFBFB]"
              />
              <button
                onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                className="text-[#8E929D] hover:text-[#FBFBFB] transition cursor-pointer p-1"
                title="View Net Available Formula"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Formula Explanation Banner */}
            {showFormulaTooltip && (
              <div className="p-3.5 rounded-2xl bg-[#0D0D11] border border-[#4A121A] text-xs text-[#8E929D] space-y-1 animate-in fade-in duration-150">
                <span className="font-bold text-[#E53935] block">Strict Available Money Formula:</span>
                <p className="font-mono text-[11px] text-[#FBFBFB]">
                  Net Available = Total Available Bank Balance ({formatCurrency(totalBankBalance, settings.currency)}) + Cash Balance ({formatCurrency(cashBalance, settings.currency)})
                </p>
                <p className="text-[10px] text-[#8E929D]">
                  Bank Balances reflect each institution's opening balance + net reconciled inflows.
                </p>
              </div>
            )}

            {/* Inflow, Outflow & Breakdown Row */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs font-semibold text-[#8E929D]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <TrendingUp size={14} />
                <span>Inflows:</span>
                <AnimatedCounter value={totalIncomeAllTime} prefix={settings.currency.symbol} className="text-[#FBFBFB] font-bold" />
              </span>

              <span className="text-white/[0.1] hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-[#E53935] font-mono">
                <TrendingDown size={14} />
                <span>Outflows:</span>
                <AnimatedCounter value={totalExpenseAllTime} prefix={settings.currency.symbol} className="text-[#E53935] font-bold" />
              </span>

              <span className="text-white/[0.1] hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-[#8E929D] font-mono">
                <Building2 size={14} />
                <span>Banks:</span>
                <AnimatedCounter value={totalBankBalance} prefix={settings.currency.symbol} className="text-[#FBFBFB] font-bold" />
              </span>

              <span className="text-white/[0.1] hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-[#8E929D] font-mono">
                <Wallet size={14} />
                <span>Cash:</span>
                <AnimatedCounter value={cashBalance} prefix={settings.currency.symbol} className="text-[#FBFBFB] font-bold" />
              </span>
            </div>
          </div>

          {/* Quick Action Hub: Primary Crimson CTA & Secondary Slate Buttons */}
          <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-crimson flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition cursor-pointer"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>Record Transaction</span>
              </button>

              <button
                onClick={() => setIsAddCashModalOpen(true)}
                className="btn-slate-subtle flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Banknote size={16} />
                <span>+ Add Cash</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCashExpenseOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#4A121A]/30 hover:bg-[#4A121A]/50 text-[#E53935] border border-[#E53935]/30 font-bold text-xs transition cursor-pointer"
              >
                <Minus size={14} />
                <span>− Cash Outflow</span>
              </button>

              <button
                onClick={() => onNavigate('banks')}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#8E929D] hover:text-[#FBFBFB] border border-white/[0.08] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Building2 size={14} />
                <span>Vaults & Banks</span>
              </button>
            </div>
          </div>
        </div>

        {/* This Month's Income & Expense Strip */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">This Month's Inflow</span>
            <span className="text-base font-black font-mono text-emerald-400">
              +{formatCurrency(monthIncome, settings.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">This Month's Outflow</span>
            <span className="text-base font-black font-mono text-[#E53935]">
              -{formatCurrency(monthExpense, settings.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">Active Bank Vaults</span>
            <span className="text-base font-black font-mono text-[#FBFBFB]">
              {bankStatsList.length} Connected
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-[#8E929D] block">Physical Cash Reserves</span>
            <span className="text-base font-black font-mono text-[#FBFBFB]">
              {formatCurrency(cashBalance, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      <SyncStatusBar />

      {/* SECTION 2: 3D INTERACTIVE FINANCIAL GALAXY */}
      <div className="reveal-on-scroll stagger-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-[#FBFBFB] tracking-tight flex items-center gap-2">
              <Orbit className="text-[#E53935]" size={20} />
              <span>Financial Galaxy & Cosmic Orbits</span>
            </h2>
            <p className="text-xs text-[#8E929D]">
              Interactive 3D simulation — accounts and expenses orbit as celestial bodies proportional to volume
            </p>
          </div>
        </div>

        <FinancialGalaxy3D 
          onSelectBank={(bs) => setSelectedBank(bs.bank)}
          onSelectCategory={(_cat) => onNavigate('reports')}
        />
      </div>

      {/* SECTION 3: FINANCIAL COMMAND CENTER */}
      <div className="reveal-on-scroll stagger-3">
        <CommandCenterSummary />
      </div>

      {/* SECTION 4: MY BANKS & CASH WALLET PREVIEW */}
      <div className="reveal-on-scroll stagger-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Banks Quick Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#FBFBFB] flex items-center gap-2">
                <Building2 size={18} className="text-[#E53935]" />
                <span>BANK VAULTS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-[#8E929D] border border-white/[0.08] font-mono font-bold">
                  {bankStatsList.length}
                </span>
              </h3>
              <p className="text-xs text-[#8E929D]">
                Total Bank Balance: <strong className="text-[#FBFBFB] font-mono">{formatCurrency(totalBankBalance, settings.currency)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingBank(null);
                  setIsAddBankOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#4A121A]/30 hover:bg-[#4A121A]/50 text-[#E53935] border border-[#E53935]/30 text-xs font-bold transition cursor-pointer"
              >
                + Add Bank
              </button>
              <button
                onClick={() => onNavigate('banks')}
                className="text-xs text-[#8E929D] hover:text-[#FBFBFB] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bankStatsList.slice(0, 4).map((bs) => (
              <div
                key={bs.bank.id}
                onClick={() => setSelectedBank(bs.bank)}
                className="p-4 rounded-2xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] fin-card shadow-xs cursor-pointer text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" 
                        style={{ backgroundColor: bs.bank.planetColor || bs.bank.color || '#E53935' }} 
                      />
                      <div>
                        <h4 className="font-black text-sm text-[#FBFBFB]">{bs.bank.bankName}</h4>
                        <span className="text-[10px] text-[#8E929D]">{bs.bank.accountType} • {bs.bank.nickname}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8E929D]">{bs.bank.accountNumberMasked}</span>
                  </div>

                  <div className="mt-3 text-lg font-black font-mono text-[#FBFBFB]">
                    {formatCurrency(bs.currentBalance, settings.currency)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E929D] font-mono">
                  <span className="text-emerald-400 font-semibold">+{formatCurrency(bs.totalIncome, settings.currency)}</span>
                  <span className="text-[#E53935] font-semibold">-{formatCurrency(bs.totalExpense, settings.currency)}</span>
                  <span className="text-[#8E929D]">{bs.transactionCount} txs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Cash Wallet Box */}
        <div className="p-6 rounded-3xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-md flex flex-col justify-between text-left fin-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="text-[#E53935]" size={20} />
                <h3 className="text-base font-black text-[#FBFBFB]">CASH WALLET</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#4A121A]/40 text-[#E53935] border border-[#E53935]/30">
                Manual
              </span>
            </div>

            <p className="text-xs text-[#8E929D]">
              Physical cash reserves tracked separately from bank vaults
            </p>

            <div className="my-5 p-4 rounded-2xl bg-[#0D0D11] border border-white/[0.06] shadow-xs">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#8E929D] block mb-1">
                Cash Available
              </span>
              <div className="text-3xl font-black font-mono text-[#FBFBFB] tracking-tight">
                {formatCurrency(cashBalance, settings.currency)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="w-full py-2.5 rounded-xl btn-crimson font-bold text-xs shadow-xs transition cursor-pointer"
            >
              + Add Cash
            </button>
            <button
              onClick={() => setIsCashExpenseOpen(true)}
              className="w-full py-2.5 rounded-xl btn-slate-subtle font-bold text-xs transition cursor-pointer text-[#E53935]"
            >
              − Cash Outflow
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: WHERE IS MY MONEY GOING? */}
      <div className="reveal-on-scroll stagger-5">
        <WhereIsMoneyGoingChart />
      </div>

      {/* Budget Alerts Banner */}
      <BudgetAlertBanner onViewBudgets={() => onNavigate('budgets')} />

      {/* 4 CORE CHARTS GRID */}
      <div className="reveal-on-scroll stagger-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="fin-card">
          <CategoryPieChart />
        </div>
        <div className="fin-card">
          <PaymentMethodChart />
        </div>
        <div className="fin-card">
          <DailyExpenseChart />
        </div>
        <div className="fin-card">
          <IncomeExpenseChart />
        </div>
      </div>

      {/* QUICK LOG ACCELERATORS (One-Tap Entry) */}
      <div className="reveal-on-scroll stagger-6 p-5 rounded-3xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-sm fin-card">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8E929D] mb-3">
          <Sparkles size={14} className="text-[#E53935]" />
          <span>One-Tap Quick Logging Accelerators</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Tea & Snacks', cat: 'Food & Restaurant', amt: 40, mode: 'cash' },
            { name: 'Lunch', cat: 'Food & Restaurant', amt: 250, mode: 'cash' },
            { name: 'Metro / Auto', cat: 'Transportation', amt: 50, mode: 'cash' },
            { name: 'Coffee', cat: 'Food & Restaurant', amt: 120, mode: 'upi' },
            { name: 'Swiggy / Dinner', cat: 'Food & Restaurant', amt: 350, mode: 'upi' },
            { name: 'Groceries', cat: 'Grocery', amt: 450, mode: 'upi' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.mode === 'cash') {
                  handleQuickAddCash(item.name, item.cat, item.amt);
                } else {
                  handleQuickAddUpi(item.name, item.cat, item.amt);
                }
              }}
              className="px-3.5 py-2 rounded-2xl bg-[#0D0D11] hover:bg-[#181822] border border-white/[0.08] hover:border-[#E53935]/40 text-xs font-semibold text-[#FBFBFB] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{item.name}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                item.mode === 'cash' ? 'bg-[#4A121A]/50 text-[#E53935] border border-[#E53935]/30' : 'bg-white/[0.06] text-emerald-400 border border-emerald-500/30'
              }`}>
                ₹{item.amt} ({item.mode.toUpperCase()})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* RECENT TRANSACTIONS STREAM */}
      <div className="reveal-on-scroll stagger-6 p-6 rounded-3xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-sm space-y-4 fin-card">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-black text-[#FBFBFB] flex items-center gap-2">
              <ListFilter size={18} className="text-[#E53935]" />
              <span>Recent Financial Log Stream</span>
            </h3>
            <p className="text-xs text-[#8E929D]">
              Latest automatic online webhooks & manual entries
            </p>
          </div>

          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-[#8E929D] hover:text-[#FBFBFB] font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8E929D]">
              No transactions recorded yet. Click "+ Record Transaction" to begin.
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <BankModal
        isOpen={isAddBankOpen}
        onClose={() => setIsAddBankOpen(false)}
        editingBank={editingBank}
      />

      <BankDetailModal
        bank={selectedBank}
        onClose={() => setSelectedBank(null)}
        onEditBank={(b) => {
          setSelectedBank(null);
          setEditingBank(b);
          setIsAddBankOpen(true);
        }}
      />

      <CashExpenseModal
        isOpen={isCashExpenseOpen}
        onClose={() => setIsCashExpenseOpen(false)}
      />
    </div>
  );
};
