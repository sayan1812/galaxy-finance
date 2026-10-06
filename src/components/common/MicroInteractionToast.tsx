import React, { useEffect } from 'react';
import type { MicroInteractionEvent } from '../../types';
import { CheckCircle2, PartyPopper, Sparkles, Landmark, Trash2, ShieldCheck, Settings } from 'lucide-react';

interface MicroInteractionToastProps {
  event: MicroInteractionEvent | null;
  onDismiss: () => void;
}

export const MicroInteractionToast: React.FC<MicroInteractionToastProps> = ({ event, onDismiss }) => {
  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  const renderIcon = () => {
    switch (event.type) {
      case 'TRANSACTION_ADDED':
        return (
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 animate-micro-pop" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-ping" />
          </div>
        );
      case 'BUDGET_MET':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <PartyPopper className="w-5 h-5 animate-micro-pop" />
          </div>
        );
      case 'SAVINGS_GOAL':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
        );
      case 'BANK_UPDATED':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Landmark className="w-5 h-5 animate-micro-pulse" />
          </div>
        );
      case 'TRANSACTION_DELETED':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-5 h-5 animate-micro-pop" />
          </div>
        );
      case 'LOGIN_SUCCESS':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5 animate-micro-pop" />
          </div>
        );
      case 'SETTINGS_SAVED':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed bottom-24 right-4 sm:right-6 lg:bottom-8 z-50 animate-micro-pop cursor-pointer pointer-events-auto"
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-100 max-w-sm">
        {renderIcon()}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-sm font-semibold tracking-wide flex items-center gap-1.5 text-slate-100">
            {event.title}
            {event.emoji && <span>{event.emoji}</span>}
          </p>
          {event.message && (
            <p className="text-xs text-slate-400 truncate">
              {event.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicroInteractionToast;
