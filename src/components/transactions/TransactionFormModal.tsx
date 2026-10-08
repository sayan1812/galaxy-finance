import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  FileText, 
  Hash,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import type { 
  TransactionType, 
  PaymentMethod,
  TransactionSource
} from '../../types';
import { PAYMENT_METHODS } from '../../constants/categories';
import { getLocalDateTimeInputValue } from '../../utils/dateUtils';
import { categorizationService } from '../../services/categorizationService';
import { CategoryIcon } from '../common/CategoryIcon';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';

import { useAccounts } from '../../hooks/useAccounts';

export const TransactionFormModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    editingTransaction, 
    setEditingTransaction,
    addTransaction, 
    updateTransaction,
    categories,
    settings,
    cashBalance,
  } = useTransactions();

  const { accounts, refetch: refetchAccounts } = useAccounts();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [category, setCategory] = useState<string>('Food & Restaurant');
  const [dateTime, setDateTime] = useState<string>(getLocalDateTimeInputValue());
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [source, setSource] = useState<TransactionSource>('MANUAL');
  const [error, setError] = useState<string>('');
  const [autoCategorySuggested, setAutoCategorySuggested] = useState<boolean>(false);

  // Pre-fill when editing or reset when adding
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setPaymentMethod(editingTransaction.paymentMethod);
      setCategory(editingTransaction.category);
      try {
        const d = new Date(editingTransaction.date);
        setDateTime(getLocalDateTimeInputValue(d));
      } catch {
        setDateTime(getLocalDateTimeInputValue());
      }
      setMerchant(editingTransaction.merchant || '');
      setDescription(editingTransaction.description || '');
      setTransactionReference(editingTransaction.transactionReference || '');
      
      if (editingTransaction.bankAccountId) {
        setSelectedAccountId(editingTransaction.bankAccountId);
      } else if (editingTransaction.paymentMethod === 'CASH' || editingTransaction.account === 'Physical Cash Wallet') {
        setSelectedAccountId('cash-wallet');
      } else if (accounts.length > 0) {
        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
      } else {
        setSelectedAccountId('cash-wallet');
      }

      setSource(editingTransaction.source || 'MANUAL');
      setAutoCategorySuggested(false);
    } else {
      setType('EXPENSE');
      setAmount('');
      setPaymentMethod('UPI');
      setCategory('Food & Restaurant');
      setDateTime(getLocalDateTimeInputValue());
      setMerchant('');
      setDescription('');
      setTransactionReference('');
      
      // Default to first user bank account if available, or cash wallet
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
      } else {
        setSelectedAccountId('cash-wallet');
      }
      
      setSource('MANUAL');
      setAutoCategorySuggested(false);
    }
    setError('');
  }, [editingTransaction, isAddModalOpen, accounts]);

  // Adjust default category when type toggles
  useEffect(() => {
    if (!editingTransaction) {
      if (type === 'INCOME') {
        const firstIncome = categories.find((c) => c.type === 'INCOME' || c.type === 'BOTH');
        if (firstIncome) setCategory(firstIncome.name);
      } else {
        const firstExpense = categories.find((c) => c.type === 'EXPENSE' || c.type === 'BOTH');
        if (firstExpense) setCategory(firstExpense.name);
      }
    }
  }, [type, categories, editingTransaction]);

  // Smart merchant categorization suggestion
  const handleMerchantChange = (val: string) => {
    setMerchant(val);
    if (!editingTransaction && val.trim().length >= 3) {
      const suggested = categorizationService.categorize(val, description, type);
      if (suggested && suggested !== 'Other' && suggested !== category) {
        setCategory(suggested);
        setAutoCategorySuggested(true);
      }
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount greater than 0');
      return;
    }

    if (!category.trim()) {
      setError('Please select a category');
      return;
    }

    const dateObj = new Date(dateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

    // Resolve dynamic account binding
    let resolvedAccountId: string | undefined = undefined;
    let resolvedAccountName = 'Physical Cash Wallet';

    if (selectedAccountId === 'cash-wallet' || paymentMethod === 'CASH') {
      resolvedAccountId = undefined;
      resolvedAccountName = 'Physical Cash Wallet';
    } else {
      const matchedAccount = accounts.find((a) => (a._id || a.id) === selectedAccountId);
      if (matchedAccount) {
        resolvedAccountId = matchedAccount._id || matchedAccount.id;
        const mask = (matchedAccount.accountNumberMask?.replace(/[^0-9]/g, '').slice(-4)) ||
                     (matchedAccount.accountNumber?.slice(-4)) ||
                     '••••';
        resolvedAccountName = `${matchedAccount.accountName} (•••• ${mask})`;
      } else if (accounts.length > 0) {
        const first = accounts[0];
        resolvedAccountId = first._id || first.id;
        const mask = (first.accountNumberMask?.replace(/[^0-9]/g, '').slice(-4)) ||
                     (first.accountNumber?.slice(-4)) ||
                     '••••';
        resolvedAccountName = `${first.accountName} (•••• ${mask})`;
      } else {
        resolvedAccountName = 'Default Account';
      }
    }

    const payload = {
      type,
      amount: numAmount,
      currency: settings.currency.code || 'INR',
      paymentMethod,
      source,
      category,
      date: dateStr,
      time: timeStr,
      account: resolvedAccountName,
      bankAccountId: resolvedAccountId,
      merchant: merchant.trim() || undefined,
      description: description.trim() || undefined,
      transactionReference: transactionReference.trim() || undefined,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    refetchAccounts();
    handleClose();
  };

  if (!isAddModalOpen) return null;

  const availableCategories = categories.filter(
    (c) => c.type === 'BOTH' || c.type === type
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transform transition-all text-left flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${type === 'INCOME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'}`}>
              {type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingTransaction ? 'Update financial entry' : 'Cash, UPI, Card, or Bank transfer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Transaction Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight size={16} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft size={16} />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount ({settings?.currency?.code || 'INR'}) *
            </label>
            <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors bg-white dark:bg-slate-950">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-2xl font-bold text-slate-400 dark:text-slate-500 select-none">
                {settings?.currency?.symbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-12 pr-4 py-3 text-2xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 bg-transparent focus:outline-none"
              />
            </div>

            {/* Quick Denomination Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[50, 100, 200, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                >
                  {settings?.currency?.symbol || '₹'}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Payment Method *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(pm.id);
                      if (pm.id === 'CASH') {
                        setSelectedAccountId('cash-wallet');
                      } else if (selectedAccountId === 'cash-wallet' && accounts.length > 0) {
                        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <PaymentMethodBadge method={pm.id} size="sm" showIcon={false} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Merchant / Payee with Smart Categorization */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Merchant / Person / Source
              </label>
              {autoCategorySuggested && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  <Sparkles size={12} /> Auto-suggested category: {category}
                </span>
              )}
            </div>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Swiggy, Uber, Amazon, Sharma Chai, Client name"
                value={merchant}
                onChange={(e) => handleMerchantChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setAutoCategorySuggested(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <CategoryIcon categoryName={cat.name} size={15} />
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date & Time *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDateTime(getLocalDateTimeInputValue())}
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Now
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setDateTime(getLocalDateTimeInputValue(y));
                  }}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Account / Card / Bank Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Account / Wallet
            </label>
            <div className="relative">
              <Wallet size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAccountId(val);
                  if (val === 'cash-wallet') {
                    setPaymentMethod('CASH');
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="cash-wallet">
                  Default Cash Wallet - ₹{cashBalance.toLocaleString('en-IN')}
                </option>
                {accounts.map((acc) => {
                  const mask = (acc.accountNumberMask?.replace(/[^0-9]/g, '').slice(-4)) || 
                               (acc.accountNumber?.slice(-4)) || 
                               '••••';
                  return (
                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                      {acc.accountName} (•••• {mask}) - ₹{Number(acc.balance || 0).toLocaleString('en-IN')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Optional Fields: Description & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Note / Description (Optional)
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Dinner with friends"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Ref / Transaction ID (Optional)
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. UPI/428901849102"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Check size={18} />
              <span>{editingTransaction ? 'Save Changes' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
