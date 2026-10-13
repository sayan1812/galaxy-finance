import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  FileText, 
  Hash, 
  Sparkles, 
  Wallet,
  ArrowRight,
  Plus,
  AlertCircle
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
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_COLORS = [
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#ec4899', '#ef4444', '#f97316', '#eab308', '#14b8a6'
];

const CATEGORY_ICONS = [
  'UtensilsCrossed', 'ShoppingBag', 'Bus', 'Fuel', 'ShoppingCart',
  'Zap', 'Home', 'GraduationCap', 'HeartPulse', 'Film',
  'Plane', 'Wifi', 'Tv', 'Briefcase', 'Laptop', 'Coffee', 'Gift', 'Tag'
];

export const TransactionFormModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    editingTransaction, 
    setEditingTransaction,
    addTransaction, 
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    addCategory,
    categories,
    settings,
    accounts,
    cashBalance,
    refreshData,
  } = useTransactions();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => (accounts.length === 0 ? 'CASH' : 'UPI'));
  const [category, setCategory] = useState<string>('Food & Restaurant');
  const [dateTime, setDateTime] = useState<string>(getLocalDateTimeInputValue());
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState<string>('');
  
  // Account selectors
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  
  const [source, setSource] = useState<TransactionSource>('MANUAL');
  const [error, setError] = useState<string>('');
  const [autoCategorySuggested, setAutoCategorySuggested] = useState<boolean>(false);

  // Synchronize account selector with payment method
  const handleAccountChange = (accId: string) => {
    setSelectedAccountId(accId);
    if (accId === 'cash') {
      setPaymentMethod('CASH');
    } else if (accId && paymentMethod === 'CASH') {
      setPaymentMethod('UPI');
    }
  };

  const handlePaymentMethodChange = (pm: PaymentMethod) => {
    setPaymentMethod(pm);
    if (pm === 'CASH') {
      setSelectedAccountId('cash');
    } else if (selectedAccountId === 'cash') {
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
      }
    }
  };

  // Inline Category Creation Modal state
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatColor, setNewCatColor] = useState<string>(CATEGORY_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState<string>(CATEGORY_ICONS[0]);

  // Pre-fill when editing or reset when adding
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount ? editingTransaction.amount.toString() : '');
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setCategory(editingTransaction.category || 'General');
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
      } else if (editingTransaction.paymentMethod === 'CASH' || editingTransaction.account?.toLowerCase().includes('cash')) {
        setSelectedAccountId('cash');
      } else if (accounts.length > 0) {
        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
      } else {
        setSelectedAccountId('cash');
      }

      if (editingTransaction.toBankAccountId) {
        setToAccountId(editingTransaction.toBankAccountId);
      } else if (editingTransaction.toAccount?.toLowerCase().includes('cash')) {
        setToAccountId('cash');
      } else if (accounts.length > 1) {
        const other = accounts.find(a => (a._id || a.id) !== editingTransaction.bankAccountId);
        if (other) setToAccountId(other._id || other.id || '');
      } else {
        setToAccountId('cash');
      }

      setSource(editingTransaction.source || 'MANUAL');
      setAutoCategorySuggested(false);
    } else {
      setType('EXPENSE');
      setAmount('');
      setCategory('Food & Restaurant');
      setDateTime(getLocalDateTimeInputValue());
      setMerchant('');
      setDescription('');
      setTransactionReference('');
      
      // Default to primary bank account if present, otherwise Cash in Hand
      if (accounts.length > 0) {
        setSelectedAccountId(accounts[0]._id || accounts[0].id || '');
        setPaymentMethod('UPI');
        if (accounts.length > 1) {
          setToAccountId(accounts[1]._id || accounts[1].id || '');
        } else {
          setToAccountId('cash');
        }
      } else {
        setSelectedAccountId('cash');
        setPaymentMethod('CASH');
        setToAccountId('');
      }
      
      setSource('MANUAL');
      setAutoCategorySuggested(false);
    }
    setError('');
  }, [editingTransaction, isAddModalOpen, accounts, cashBalance]);

  // Adjust default category when type toggles
  useEffect(() => {
    if (!editingTransaction) {
      if (type === 'INCOME') {
        const firstIncome = categories.find((c) => c.type === 'INCOME' || c.type === 'BOTH');
        if (firstIncome) setCategory(firstIncome.name);
      } else if (type === 'EXPENSE') {
        const firstExpense = categories.find((c) => c.type === 'EXPENSE' || c.type === 'BOTH');
        if (firstExpense) setCategory(firstExpense.name);
      } else if (type === 'TRANSFER') {
        setCategory('Transfer');
        setPaymentMethod('BANK_TRANSFER');
      }
    }
  }, [type, categories, editingTransaction]);

  // Smart merchant categorization suggestion
  const handleMerchantChange = (val: string) => {
    setMerchant(val);
    if (!editingTransaction && type !== 'TRANSFER' && val.trim().length >= 3) {
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
    setIsAddCategoryOpen(false);
  };

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handlePresetDate = (mode: 'now' | 'yesterday') => {
    if (mode === 'now') {
      setDateTime(getLocalDateTimeInputValue());
    } else {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setDateTime(getLocalDateTimeInputValue(y));
    }
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: newCatIcon,
      type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    });

    setCategory(newCatName.trim());
    setNewCatName('');
    setIsAddCategoryOpen(false);
  };

  const handleDelete = async () => {
    if (editingTransaction) {
      await deleteTransaction(editingTransaction.id);
      await refreshData();
      handleClose();
    }
  };

  const handleDuplicate = async () => {
    if (editingTransaction) {
      await duplicateTransaction(editingTransaction.id);
      await refreshData();
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount greater than 0');
      return;
    }

    if (type !== 'TRANSFER' && accounts.length === 0 && paymentMethod !== 'CASH') {
      setError("No bank connected. Connect a bank vault or select 'Cash' payment method.");
      return;
    }

    if (type !== 'TRANSFER' && !category.trim()) {
      setError('Please select a category');
      return;
    }

    if (type === 'TRANSFER') {
      const totalAccounts = accounts.length + 1; // Bank accounts + Cash in Hand
      if (totalAccounts < 2) {
        setError('At least two accounts (Bank or Cash) are required for an internal transfer');
        return;
      }
      if (!selectedAccountId) {
        setError('Please select a Source (From) Account');
        return;
      }
      if (!toAccountId) {
        setError('Please select a Destination (To) Account');
        return;
      }
      if (selectedAccountId === toAccountId) {
        setError('Source and Destination accounts must be different for a transfer');
        return;
      }
    }

    const dateObj = new Date(dateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

    // Resolve From Account
    let fromAccountName = 'Cash in Hand';
    let resolvedBankId: string | undefined = undefined;

    if (selectedAccountId === 'cash' || paymentMethod === 'CASH') {
      fromAccountName = 'Cash in Hand';
      resolvedBankId = undefined;
    } else {
      const matchedFrom = accounts.find((a) => (a._id || a.id) === selectedAccountId);
      if (matchedFrom) {
        fromAccountName = matchedFrom.name || matchedFrom.accountName;
        resolvedBankId = matchedFrom._id || matchedFrom.id || selectedAccountId;
      } else {
        fromAccountName = 'Bank Vault';
        resolvedBankId = selectedAccountId || undefined;
      }
    }

    // Resolve To Account if transfer
    let toAccountName: string | undefined = undefined;
    let resolvedToBankId: string | undefined = undefined;
    if (type === 'TRANSFER') {
      if (toAccountId === 'cash') {
        toAccountName = 'Cash in Hand';
        resolvedToBankId = 'cash';
      } else {
        const matchedTo = accounts.find((a) => (a._id || a.id) === toAccountId);
        if (matchedTo) {
          toAccountName = matchedTo.name || matchedTo.accountName;
          resolvedToBankId = matchedTo._id || matchedTo.id || toAccountId;
        }
      }
    }

    const payload = {
      type,
      amount: numAmount,
      currency: settings.currency.code || 'INR',
      paymentMethod: type === 'TRANSFER' 
        ? ((selectedAccountId === 'cash' || toAccountId === 'cash') ? 'CASH' : 'BANK_TRANSFER') 
        : paymentMethod,
      source,
      category: type === 'TRANSFER' ? (category || 'Transfer') : category,
      date: dateStr,
      time: timeStr,
      account: fromAccountName,
      bankAccountId: resolvedBankId,
      toBankAccountId: type === 'TRANSFER' ? resolvedToBankId : undefined,
      toAccount: toAccountName,
      merchant: merchant.trim() || undefined,
      description: description.trim() || undefined,
      transactionReference: transactionReference.trim() || undefined,
    };

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, payload);
    } else {
      await addTransaction(payload);
    }

    await refreshData();
    handleClose();
  };

  if (!isAddModalOpen) return null;

  const availableCategories = categories.filter(
    (c) => c.type === 'BOTH' || c.type === type || (type === 'TRANSFER' && c.name === 'Transfer')
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
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingTransaction ? 'Update financial entry' : 'Select mode: Income, Expense, or Transfer'}
            </p>
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

          {/* Top Mode Switcher: Tri-state pill tab [ Income ] | [ Expense ] | [ Transfer ] */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Transaction Mode
            </label>
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${
                  type === 'INCOME'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${
                  type === 'EXPENSE'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('TRANSFER')}
                className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${
                  type === 'TRANSFER'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Amount: Bold Numeric Keypad Input with Active Currency Prefix (₹) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount ({settings?.currency?.code || 'INR'}) *
            </label>
            <div className={`relative rounded-2xl border-2 transition-colors bg-white dark:bg-slate-950 ${
              type === 'INCOME' 
                ? 'border-slate-200 dark:border-slate-700 focus-within:border-emerald-500' 
                : type === 'TRANSFER'
                ? 'border-slate-200 dark:border-slate-700 focus-within:border-sky-500'
                : 'border-slate-200 dark:border-slate-700 focus-within:border-rose-500'
            }`}>
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
                  +{settings?.currency?.symbol || '₹'}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time with [Now] and [Yesterday] Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date & Time *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetDate('now')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDate('yesterday')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
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

          {/* Account Selector: Bound strictly to reactive context accounts and live cashBalance */}
          {type === 'TRANSFER' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Wallet size={14} className="text-sky-500" />
                  <span>From Account</span>
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">Select Account</option>
                  <option value="cash">
                    Cash in Hand ({formatCurrency(cashBalance, settings?.currency)})
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                      {acc.name || acc.accountName} ({formatCurrency(acc.balance, settings?.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ArrowRight size={14} className="text-emerald-500" />
                  <span>To Account</span>
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Account</option>
                  <option value="cash">
                    Cash in Hand ({formatCurrency(cashBalance, settings?.currency)})
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                      {acc.name || acc.accountName} ({formatCurrency(acc.balance, settings?.currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Account Selector
              </label>
              <div className="relative">
                <Wallet size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedAccountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select Account</option>
                  <option value="cash">
                    Cash in Hand ({formatCurrency(cashBalance, settings?.currency)})
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                      {acc.name || acc.accountName} ({formatCurrency(acc.balance, settings?.currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Payment Method Selector (For Income & Expense) */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => handlePaymentMethodChange(pm.id)}
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

              {accounts.length === 0 && paymentMethod !== 'CASH' && (
                <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  <span>No bank connected. Connect a bank vault or select 'Cash' payment method.</span>
                </div>
              )}
            </div>
          )}

          {/* Merchant / Payee / Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Merchant / Title
              </label>
              {autoCategorySuggested && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  <Sparkles size={12} /> Auto-suggested: {category}
                </span>
              )}
            </div>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Swiggy, Amazon, Metro Recharge, Client Payout"
                value={merchant}
                onChange={(e) => handleMerchantChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Custom Categories Engine: Category Selection Grid & Inline Add Button */}
          {type !== 'TRANSFER' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Category</span>
                </button>
              </div>

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
          )}

          {/* Notes / Description Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Dinner with team, monthly broadband bill"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Reference / Ref ID (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Ref / Transaction ID (Optional)
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. UPI/48210389102"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Bottom Actions: Clean, symbol-free bottom actions [ Save Transaction ], [ Delete ], [ Duplicate ] */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-2">
              {editingTransaction && (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 transition cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Duplicate
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition cursor-pointer ${
                  type === 'INCOME'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : type === 'TRANSFER'
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                }`}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </form>

        {/* Inline Category Creation Modal */}
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Add Custom Category
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subscriptions, Gaming, Fitness"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CATEGORY_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCatColor(col)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition ${
                          newCatColor === col ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category Icon
                  </label>
                  <div className="grid grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1 border rounded-xl border-slate-200 dark:border-slate-800">
                    {CATEGORY_ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewCatIcon(ic)}
                        className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${
                          newCatIcon === ic 
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 ring-1 ring-indigo-500' 
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CategoryIcon iconName={ic} size={15} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs"
                  >
                    Save Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
