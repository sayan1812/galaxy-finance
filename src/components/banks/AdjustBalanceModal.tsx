import React, { useState } from 'react';
import { X, Building2, Check, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import type { BankAccount } from '../../types';

interface AdjustBalanceModalProps {
  bank: BankAccount;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  bank,
  currentBalance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updateBankBalance, settings } = useTransactions();
  const [newBalanceInput, setNewBalanceInput] = useState<string>(currentBalance.toString());
  const [reasonInput, setReasonInput] = useState<string>('Reconciled with statement');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericNewBalance = parseFloat(newBalanceInput);
  const isValidNumber = !isNaN(numericNewBalance) && numericNewBalance >= 0;
  const difference = isValidNumber ? numericNewBalance - currentBalance : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNumber) {
      setError('Please provide a valid non-negative balance.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Update Context (optimistic & live calculation)
      updateBankBalance(bank.id, numericNewBalance, reasonInput.trim() || 'Manual Balance Adjustment');

      if (onSuccess) {
        onSuccess(numericNewBalance);
      }

      onClose();
    } catch (err: any) {
      console.error('Adjustment failed:', err);
      setError(err?.message || 'Failed to update account balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#10221E] border border-[#89D7B7]/25 shadow-[0_0_60px_rgba(16,185,129,0.25)] p-6 text-left text-[#FFF4E1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div 
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: bank.planetColor || bank.color || '#89D7B7' }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#89D7B7]/15">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
              style={{
                backgroundColor: `${bank.planetColor || bank.color || '#89D7B7'}22`,
                border: `1px solid ${bank.planetColor || bank.color || '#89D7B7'}44`,
                color: bank.planetColor || bank.color || '#89D7B7',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#FFF4E1] tracking-tight">
                Adjust Account Balance
              </h3>
              <p className="text-xs text-[#89D7B7]/75 font-mono">
                {bank.bankName} • {bank.accountNumberMasked || 'XXXX 0000'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A312C] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs New Delta Card */}
          <div className="p-3.5 rounded-2xl bg-[#1A312C]/60 border border-[#89D7B7]/15 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#89D7B7]/70 block">
                Current Ledger
              </span>
              <span className="font-mono font-bold text-sm text-[#FFF4E1]">
                {formatCurrency(currentBalance, settings?.currency)}
              </span>
            </div>

            <ArrowRight size={16} className="text-[#89D7B7]/50" />

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#89D7B7]/70 block">
                Net Delta
              </span>
              <span className={`font-mono font-bold text-sm ${
                difference > 0 ? 'text-emerald-400' : difference < 0 ? 'text-rose-400' : 'text-[#89D7B7]'
              }`}>
                {difference > 0 ? `+${formatCurrency(difference, settings?.currency)}` : difference < 0 ? `-${formatCurrency(Math.abs(difference), settings?.currency)}` : '₹0 (No change)'}
              </span>
            </div>
          </div>

          {/* Input: New Balance */}
          <div>
            <label className="block text-xs font-bold text-[#89D7B7] mb-1.5 uppercase tracking-wide">
              New Reconciled Balance ({settings?.currency?.symbol || '₹'})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                required
                autoFocus
                value={newBalanceInput}
                onChange={(e) => setNewBalanceInput(e.target.value)}
                placeholder="Enter new accurate balance..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#142924] border border-[#89D7B7]/30 text-base font-black font-mono text-[#FFF4E1] placeholder-emerald-600/40 focus:outline-none focus:border-[#89D7B7] focus:ring-1 focus:ring-[#89D7B7]"
              />
            </div>
            <span className="text-[10px] text-[#89D7B7]/60 mt-1 block">
              Directly sets available bank balance and balances ledger calculations.
            </span>
          </div>

          {/* Input: Adjustment Reason */}
          <div>
            <label className="block text-xs font-bold text-[#89D7B7] mb-1.5 uppercase tracking-wide">
              Adjustment Reason (Optional)
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Bank passbook reconciliation, Interest credit..."
              className="w-full px-4 py-2 rounded-xl bg-[#142924] border border-[#89D7B7]/25 text-xs text-[#FFF4E1] placeholder-emerald-600/40 focus:outline-none focus:border-[#89D7B7]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#89D7B7]/15">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#1A312C] hover:bg-[#223F38] text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValidNumber}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-extrabold text-[#FFF4E1] shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Adjustment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustBalanceModal;
