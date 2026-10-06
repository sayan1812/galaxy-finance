import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Search
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatters';
import { BankCard } from '../components/banks/BankCard';
import { BankModal } from '../components/banks/BankModal';
import { BankDetailModal } from '../components/banks/BankDetailModal';
import { CashExpenseModal } from '../components/cash/CashExpenseModal';
import { SyncStatusBar } from '../components/sync/SyncStatusBar';
import type { BankAccount } from '../types';

export const BanksPage: React.FC = () => {
  const {
    bankAccounts,
    bankStatsList,
    totalBankBalance,
    cashBalance,
    netAvailableMoney,
    deleteBankAccount,
    settings,
    triggerSync,
    syncStatus,
    setIsAddCashModalOpen,
  } = useTransactions();

  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isCashExpenseOpen, setIsCashExpenseOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredBanks = bankStatsList.filter(
    (b) =>
      b.bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bank.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bank.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBank = (bank: BankAccount) => {
    if (window.confirm(`Are you sure you want to remove ${bank.bankName} (${bank.nickname})?`)) {
      deleteBankAccount(bank.id);
    }
  };

  const handleEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setIsAddBankModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-left">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="text-cyan-400" size={28} />
            <span>Banks & Financial Vaults</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your individual bank accounts, cash reserves, and multi-bank statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingBank(null);
              setIsAddBankModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Bank Account</span>
          </button>

          <button
            onClick={() => triggerSync(false)}
            disabled={syncStatus.state === 'SYNCING'}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Sync Online Bank Feeds"
          >
            <RefreshCw size={16} className={syncStatus.state === 'SYNCING' ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>

      {/* Sync Status Bar Banner */}
      <SyncStatusBar />

      {/* Top Financial Overview Matrix (Section 4 & Section 5 Requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Bank Balance Card */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Total Bank Balance
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-bold">
              {bankAccounts.length} Banks Active
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalBankBalance, settings.currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Combined sum of all savings, salary, and current bank accounts
          </p>
        </div>

        {/* Cash Wallet Card */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
                Cash Wallet
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 font-bold">
                Physical Cash
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {formatCurrency(cashBalance, settings.currency)}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setIsAddCashModalOpen(true)}
              className="flex-1 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer text-center"
            >
              + Add Cash
            </button>
            <button
              onClick={() => setIsCashExpenseOpen(true)}
              className="flex-1 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer text-center"
            >
              − Cash Expense
            </button>
          </div>
        </div>

        {/* Net Available Money Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-300">
              Net Available Money
            </span>
            <Sparkles size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCurrency(netAvailableMoney, settings.currency)}
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Bank: {formatCurrency(totalBankBalance, settings.currency)}</span>
            <span>+</span>
            <span>Cash: {formatCurrency(cashBalance, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Security Architecture Box */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/60 flex items-start gap-3 text-xs text-blue-300">
        <ShieldCheck size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Safe & Regulated Account Architecture</span>
          <p className="leading-relaxed">
            All banking accounts are tracked with strict client-side encryption. We never request or store sensitive banking passwords, ATM PINs, UPI PINs, or CVVs. All account numbers are masked (<code className="bg-slate-900 px-1 py-0.5 rounded font-mono">XXXX XXXX 4521</code>).
          </p>
        </div>
      </div>

      {/* My Banks Grid Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>MY BANKS</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                {bankAccounts.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Each bank acts as an orbital financial planet in your 3D Galaxy
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bank or nickname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

        {filteredBanks.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
            <Building2 size={36} className="mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No bank accounts match your search</h3>
            <p className="text-xs text-slate-500 mt-1">Add a new bank account to expand your galaxy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map((bs) => (
              <BankCard
                key={bs.bank.id}
                bankStats={bs}
                onEdit={() => handleEditBank(bs.bank)}
                onDelete={() => handleDeleteBank(bs.bank)}
                onViewTransactions={() => setSelectedBank(bs.bank)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section 15: Bank-Wise Expense Analysis Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white">Bank-Wise Cashflow Matrix</h3>
            <p className="text-xs text-slate-400">Comparative breakdown of balance, inflows, and outflows per institution</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">{bankAccounts.length} Banks Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 pl-2">Bank</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 text-right">Balance</th>
                <th className="pb-3 text-right">Income</th>
                <th className="pb-3 text-right">Expense</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {bankStatsList.map((row) => (
                <tr key={row.bank.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: row.bank.planetColor || row.bank.color || '#38bdf8' }} 
                      />
                      <span className="font-bold text-white">{row.bank.bankName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{row.bank.accountType}</td>
                  <td className="py-3 text-right font-black text-white">
                    {formatCurrency(row.currentBalance, settings.currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    +{formatCurrency(row.totalIncome, settings.currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-rose-400">
                    -{formatCurrency(row.totalExpense, settings.currency)}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => setSelectedBank(row.bank)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BankModal
        isOpen={isAddBankModalOpen}
        onClose={() => {
          setIsAddBankModalOpen(false);
          setEditingBank(null);
        }}
        editingBank={editingBank}
      />

      <BankDetailModal
        bank={selectedBank}
        onClose={() => setSelectedBank(null)}
        onEditBank={(b) => {
          setSelectedBank(null);
          handleEditBank(b);
        }}
      />

      <CashExpenseModal
        isOpen={isCashExpenseOpen}
        onClose={() => setIsCashExpenseOpen(false)}
      />
    </div>
  );
};
