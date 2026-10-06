import React, { useState, useMemo } from 'react';
import { 
  X, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit3, 
  Check, 
  Receipt,
  Search,
  Plus
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';
import type { BankAccount, Transaction } from '../../types';

interface BankDetailModalProps {
  bank: BankAccount | null;
  onClose: () => void;
  onEditBank: (bank: BankAccount) => void;
}

export const BankDetailModal: React.FC<BankDetailModalProps> = ({
  bank,
  onClose,
  onEditBank,
}) => {
  const { 
    transactions, 
    bankStatsList, 
    updateBankBalance, 
    settings, 
    setIsAddModalOpen 
  } = useTransactions();

  const [isEditingBalance, setIsEditingBalance] = useState<boolean>(false);
  const [newBalanceInput, setNewBalanceInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const stats = useMemo(() => {
    if (!bank) return null;
    return bankStatsList.find((b) => b.bank.id === bank.id) || null;
  }, [bank, bankStatsList]);

  // Bank's linked transactions
  const bankTransactions = useMemo(() => {
    if (!bank) return [];
    return transactions.filter((t) => {
      if (t.bankAccountId === bank.id) return true;
      if (t.account) {
        const accLower = t.account.toLowerCase();
        if (accLower.includes(bank.bankName.toLowerCase())) return true;
        if (bank.nickname && accLower.includes(bank.nickname.toLowerCase())) return true;
      }
      return false;
    });
  }, [bank, transactions]);

  // Filtered by search
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return bankTransactions;
    const term = searchTerm.toLowerCase();
    return bankTransactions.filter(
      (t) =>
        t.merchant?.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.amount.toString().includes(term)
    );
  }, [bankTransactions, searchTerm]);

  if (!bank || !stats) return null;

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBalanceInput);
    if (!isNaN(val) && val >= 0) {
      updateBankBalance(bank.id, val);
      setIsEditingBalance(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_0_60px_rgba(79,70,229,0.3)] p-6 sm:p-7 text-left text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${bank.planetColor || bank.color || '#38bdf8'}22`,
                border: `1px solid ${bank.planetColor || bank.color || '#38bdf8'}50`,
                color: bank.planetColor || bank.color || '#38bdf8',
              }}
            >
              <Building2 size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">{bank.bankName}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {bank.accountType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {bank.accountNumberMasked} • {bank.nickname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditBank(bank)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Edit Bank Details"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Bank Performance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 flex-shrink-0">
          {/* Current Balance & Quick Adjustment */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              <span>Available Balance</span>
              {!isEditingBalance && (
                <button
                  onClick={() => {
                    setNewBalanceInput(stats.currentBalance.toString());
                    setIsEditingBalance(true);
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer lowercase"
                >
                  adjust
                </button>
              )}
            </div>

            {isEditingBalance ? (
              <form onSubmit={handleSaveBalance} className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-xl bg-slate-900 border border-cyan-500 text-sm font-bold text-white focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingBalance(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <div className="text-xl font-black text-white">
                {formatCurrency(stats.currentBalance, settings.currency)}
              </div>
            )}
          </div>

          {/* Total Income for this Bank */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">
              <ArrowDownLeft size={12} />
              <span>Total Bank Inflow</span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {formatCurrency(stats.totalIncome, settings.currency)}
            </div>
          </div>

          {/* Total Expense for this Bank */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-rose-400 mb-1">
              <ArrowUpRight size={12} />
              <span>Total Bank Outflow</span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {formatCurrency(stats.totalExpense, settings.currency)}
            </div>
          </div>
        </div>

        {/* Transactions Section Header */}
        <div className="flex items-center justify-between gap-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Bank Statements & Log ({bankTransactions.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => {
                onClose();
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Scrollable Transaction List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1 mt-2">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No transactions recorded for this bank account yet.
            </div>
          ) : (
            filteredTransactions.map((t: Transaction) => {
              const isIncome = t.type === 'INCOME';
              return (
                <div 
                  key={t.id} 
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/40 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryName={t.category} size={15} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {t.merchant || t.category}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          t.source === 'AUTOMATIC' 
                            ? 'bg-blue-950/60 text-blue-300' 
                            : 'bg-amber-950/60 text-amber-300'
                        }`}>
                          {t.source === 'AUTOMATIC' ? 'AUTO' : 'MANUAL'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{formatDate(t.date)}</span>
                        <span>•</span>
                        <span>{t.time || formatTime(t.date)}</span>
                        {t.transactionReference && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              Ref: {t.transactionReference}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-black ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                    </div>
                    <div className="mt-0.5">
                      <PaymentMethodBadge method={t.paymentMethod} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
