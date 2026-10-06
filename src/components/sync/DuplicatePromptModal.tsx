import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { PaymentMethodBadge } from '../common/PaymentMethodBadge';
import { CategoryIcon } from '../common/CategoryIcon';

export const DuplicatePromptModal: React.FC = () => {
  const { duplicateCandidate, resolveDuplicateCandidate, settings } = useTransactions();

  if (!duplicateCandidate) return null;

  const { candidate, reason } = duplicateCandidate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/50 dark:border-amber-500/50 overflow-hidden transform transition-all text-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-500/20 px-6 py-4 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
              Possible duplicate transaction detected
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              Smart conflict detection identified an existing matching entry.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Detection Signal
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {reason}
            </p>
          </div>

          {/* Candidate Card Details */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CategoryIcon categoryName={candidate.category} size={20} />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {candidate.merchant || candidate.category}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(candidate.date)} • {candidate.time}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                  {formatCurrency(candidate.amount, settings.currency)}
                </span>
                <div className="mt-0.5">
                  <PaymentMethodBadge method={candidate.paymentMethod} size="sm" />
                </div>
              </div>
            </div>

            {candidate.account && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>Account Source:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{candidate.account}</span>
              </div>
            )}

            {candidate.transactionReference && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Reference ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{candidate.transactionReference}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Would you like to keep this transaction and record it as a separate entry, or ignore it as an accidental duplicate?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => resolveDuplicateCandidate(false)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={15} />
            <span>Ignore Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => resolveDuplicateCandidate(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition cursor-pointer"
          >
            <Check size={15} />
            <span>Keep Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
