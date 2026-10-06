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
  Orbit
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-left">
      {/* SECTION 1: GALAXY DASHBOARD TOP HERO & NET AVAILABLE MONEY */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] backdrop-blur-xl text-white overflow-hidden">
        {/* Ambient Nebula Gradients */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-[11px] font-black uppercase tracking-wider text-cyan-300">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Cosmic Personal Finance Ecosystem</span>
            </div>

            <h1 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              NET AVAILABLE MONEY
            </h1>

            {/* Central Giant Number */}
            <div className="flex items-baseline gap-3">
              <AnimatedCounter
                value={netAvailableMoney}
                prefix={settings.currency.symbol}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              />
              <button
                onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-1"
                title="View Net Available Formula"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Formula Explanation Banner */}
            {showFormulaTooltip && (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-xs text-slate-300 space-y-1 animate-in fade-in duration-150">
                <span className="font-bold text-cyan-300 block">Strict Available Money Formula:</span>
                <p className="font-mono text-[11px]">
                  Net Available = Total Available Bank Balance ({formatCurrency(totalBankBalance, settings.currency)}) + Cash Balance ({formatCurrency(cashBalance, settings.currency)})
                </p>
                <p className="text-[10px] text-slate-400">
                  Bank Balances reflect each institution's opening balance + net bank inflows.
                </p>
              </div>
            )}

            {/* Inflow, Outflow & Breakdown Row (Section 1 & 5 Requirements) */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp size={14} />
                <span>Total Income:</span>
                <AnimatedCounter value={totalIncomeAllTime} prefix={settings.currency.symbol} className="text-white font-bold" />
              </span>

              <span className="text-slate-600 hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-rose-400">
                <TrendingDown size={14} />
                <span>Total Expense:</span>
                <AnimatedCounter value={totalExpenseAllTime} prefix={settings.currency.symbol} className="text-white font-bold" />
              </span>

              <span className="text-slate-600 hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-cyan-300">
                <Building2 size={14} />
                <span>Banks:</span>
                <AnimatedCounter value={totalBankBalance} prefix={settings.currency.symbol} className="text-white font-bold" />
              </span>

              <span className="text-slate-600 hidden sm:inline">•</span>

              <span className="flex items-center gap-1.5 text-amber-400">
                <Wallet size={14} />
                <span>Cash:</span>
                <AnimatedCounter value={cashBalance} prefix={settings.currency.symbol} className="text-white font-bold" />
              </span>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Transaction</span>
              </button>

              <button
                onClick={() => setIsAddCashModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-black text-xs transition cursor-pointer"
              >
                <Banknote size={16} />
                <span>+ Add Cash</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCashExpenseOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition cursor-pointer"
              >
                <Minus size={14} />
                <span>− Cash Expense</span>
              </button>

              <button
                onClick={() => onNavigate('banks')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                <Building2 size={14} />
                <span>Manage Banks</span>
              </button>
            </div>
          </div>
        </div>

        {/* This Month's Income & Expense Strip (Section 5 Requirement) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">This Month's Income</span>
            <span className="text-base font-black text-emerald-400">
              +{formatCurrency(monthIncome, settings.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">This Month's Expense</span>
            <span className="text-base font-black text-rose-400">
              -{formatCurrency(monthExpense, settings.currency)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Bank Vaults</span>
            <span className="text-base font-black text-cyan-300">
              {bankStatsList.length} Connected
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash Reserves</span>
            <span className="text-base font-black text-amber-400">
              {formatCurrency(cashBalance, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      <SyncStatusBar />

      {/* SECTION 10, 11, 12: 3D INTERACTIVE FINANCIAL GALAXY */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Orbit className="text-indigo-600" size={20} />
              <span>3D Financial Galaxy & Cosmic Orbits</span>
            </h2>
            <p className="text-xs text-slate-500">
              Interactive 3D simulation — accounts and expenses orbit as celestial bodies proportional to volume
            </p>
          </div>
        </div>

        <FinancialGalaxy3D 
          onSelectBank={(bs) => setSelectedBank(bs.bank)}
          onSelectCategory={(_cat) => onNavigate('reports')}
        />
      </div>

      {/* SECTION 14: FINANCIAL COMMAND CENTER */}
      <CommandCenterSummary />

      {/* SECTION 4 & 6: MY BANKS & CASH WALLET PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Banks Quick Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                <span>MY BANKS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {bankStatsList.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Total Bank Balance: <strong className="text-slate-900">{formatCurrency(totalBankBalance, settings.currency)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingBank(null);
                  setIsAddBankOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition cursor-pointer"
              >
                + Add Bank
              </button>
              <button
                onClick={() => onNavigate('banks')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
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
                className="p-4 rounded-2xl bg-white/95 border border-slate-200/90 hover:border-indigo-400/60 shadow-xs hover:shadow-md transition-all cursor-pointer text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" 
                        style={{ backgroundColor: bs.bank.planetColor || bs.bank.color || '#38bdf8' }} 
                      />
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{bs.bank.bankName}</h4>
                        <span className="text-[10px] text-slate-500">{bs.bank.accountType} • {bs.bank.nickname}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{bs.bank.accountNumberMasked}</span>
                  </div>

                  <div className="mt-3 text-lg font-black text-slate-900">
                    {formatCurrency(bs.currentBalance, settings.currency)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-emerald-600 font-semibold">+{formatCurrency(bs.totalIncome, settings.currency)}</span>
                  <span className="text-rose-600 font-semibold">-{formatCurrency(bs.totalExpense, settings.currency)}</span>
                  <span>{bs.transactionCount} txs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Cash Wallet Box */}
        <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="text-amber-500" size={20} />
                <h3 className="text-base font-black text-slate-900">CASH WALLET</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Manual
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Manual physical cash reserves tracked separately from bank accounts
            </p>

            <div className="my-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block mb-1">
                Cash Available
              </span>
              <div className="text-3xl font-black text-amber-700 tracking-tight">
                {formatCurrency(cashBalance, settings.currency)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-xs transition cursor-pointer"
            >
              + Add Cash
            </button>
            <button
              onClick={() => setIsCashExpenseOpen(true)}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
            >
              − Cash Expense
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 16: WHERE IS MY MONEY GOING? */}
      <WhereIsMoneyGoingChart />

      {/* Budget Alerts Banner */}
      <BudgetAlertBanner onViewBudgets={() => onNavigate('budgets')} />

      {/* 4 CORE CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <PaymentMethodChart />
        <DailyExpenseChart />
        <IncomeExpenseChart />
      </div>

      {/* QUICK LOG ACCELERATORS (One-Tap Entry) */}
      <div className="p-5 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
          <Sparkles size={14} className="text-indigo-600" />
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
              className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{item.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                item.mode === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                ₹{item.amt} ({item.mode.toUpperCase()})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* RECENT TRANSACTIONS STREAM */}
      <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ListFilter size={18} className="text-indigo-600" />
              <span>Recent Financial Log Stream</span>
            </h3>
            <p className="text-xs text-slate-500">
              Latest automatic online webhooks & manual entries
            </p>
          </div>

          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions recorded yet. Click "+ Add Transaction" to begin.
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
