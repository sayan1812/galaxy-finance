import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all p-6 text-left"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isDestructive ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-500/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
