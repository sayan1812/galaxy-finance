import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { POPULAR_BANKS, BANK_ACCOUNT_TYPES, PLANET_PALETTE } from '../../constants/categories';
import type { BankAccount, BankAccountType } from '../../types';
import { ConfirmModal } from '../layout/ConfirmModal';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBank?: BankAccount | null;
}

export const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  editingBank,
}) => {
  const { addBankAccount, updateBankAccount, updateBankBalance, deleteBankAccount } = useTransactions();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountType, setAccountType] = useState<BankAccountType>('Savings');
  const [nickname, setNickname] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [selectedPlanetColor, setSelectedPlanetColor] = useState<string>(PLANET_PALETTE[0].color);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingBank) {
      if (POPULAR_BANKS.includes(editingBank.bankName)) {
        setBankName(editingBank.bankName);
        setCustomBankName('');
      } else {
        setBankName('Other');
        setCustomBankName(editingBank.bankName);
      }
      setAccountType(editingBank.accountType);
      setNickname(editingBank.nickname);
      setBalance(editingBank.openingBalance.toString());
      setAccountNumber(editingBank.accountNumberMasked.replace(/X/g, '').trim());
      setSelectedPlanetColor(editingBank.planetColor || PLANET_PALETTE[0].color);
    } else {
      setBankName('HDFC Bank');
      setCustomBankName('');
      setAccountType('Savings');
      setNickname('');
      setBalance('');
      setAccountNumber('');
      setSelectedPlanetColor(PLANET_PALETTE[0].color);
    }
    setError('');
  }, [editingBank, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalBankName = bankName === 'Other' ? customBankName.trim() : bankName;
    if (!finalBankName) {
      setError('Please provide a valid bank name.');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance < 0) {
      setError('Please enter a valid non-negative opening balance.');
      return;
    }

    // Generate safe masked account format (e.g., "XXXX XXXX 4521")
    let masked = 'XXXX XXXX 4521';
    if (accountNumber.trim()) {
      const cleanDigits = accountNumber.replace(/\D/g, '');
      const lastFour = cleanDigits.slice(-4) || '4521';
      masked = `XXXX XXXX ${lastFour}`;
    }

    if (editingBank) {
      updateBankAccount(editingBank.id, {
        bankName: finalBankName,
        accountType,
        nickname: nickname.trim() || `${finalBankName} ${accountType}`,
        accountNumberMasked: masked,
        planetColor: selectedPlanetColor,
        color: selectedPlanetColor,
      });

      // Update balance if changed
      if (numBalance !== editingBank.openingBalance) {
        updateBankBalance(editingBank.id, numBalance);
      }
    } else {
      addBankAccount({
        bankName: finalBankName,
        accountType,
        nickname: nickname.trim() || `${finalBankName} ${accountType}`,
        openingBalance: numBalance,
        accountNumberMasked: masked,
        planetColor: selectedPlanetColor,
        color: selectedPlanetColor,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-[0_0_50px_rgba(79,70,229,0.25)] p-6 sm:p-7 text-left text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure your financial planet for the 3D galaxy & balance tracker
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Assurance Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-950/30 border border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-300">
          <ShieldCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Bank Privacy & Security:</strong> We never store or ask for sensitive banking credentials, ATM PINs, UPI PINs, CVVs, or internet banking passwords. Account numbers are masked automatically.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Bank Institution
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-hidden"
            >
              {POPULAR_BANKS.map((bank) => (
                <option key={bank} value={bank} className="bg-slate-900">
                  {bank}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Bank Name Input if "Other" */}
          {bankName === 'Other' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Custom Bank / Institution Name
              </label>
              <input
                type="text"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                placeholder="e.g. Federal Bank, DBS, Canara Bank"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-hidden"
                required
              />
            </div>
          )}

          {/* Account Type & Nickname Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-hidden"
              >
                {BANK_ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900">
                    {type} Account
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Account Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. My Salary Account"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Opening / Current Balance */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Opening / Current Balance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="e.g. 35000"
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:border-cyan-500 focus:outline-hidden"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Transactions linked to this bank will automatically update this balance.
            </p>
          </div>

          {/* Masked Account Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Last 4 Digits of Account Number (Optional)
            </label>
            <input
              type="text"
              maxLength={4}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 4521"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:border-cyan-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Will be displayed as <span className="font-mono text-slate-300">XXXX XXXX {accountNumber || '4521'}</span>
            </p>
          </div>

          {/* 3D Planet Color Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" />
              <span>3D Galaxy Planet Color Theme</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PLANET_PALETTE.map((p) => {
                const isSelected = selectedPlanetColor === p.color;
                return (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setSelectedPlanetColor(p.color)}
                    className={`flex items-center gap-2 p-2 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-800 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs" 
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-[11px] font-bold text-slate-300 truncate">
                      {p.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
            {editingBank ? (
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Account</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 text-[var(--bg-primary)] text-xs font-black shadow-md transition cursor-pointer"
              >
                {editingBank ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {editingBank && (
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title="Delete Bank Account?"
          message={`Are you sure you want to delete ${editingBank.bankName} (${editingBank.nickname})? All associated transaction records will be removed and Net Available Capital will be recalculated.`}
          confirmLabel="Delete Account"
          isDestructive={true}
          onConfirm={() => {
            deleteBankAccount(editingBank.id);
            setIsDeleteConfirmOpen(false);
            onClose();
          }}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};
