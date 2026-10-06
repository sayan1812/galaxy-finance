import React from 'react';

export const MetricCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 w-24 bg-slate-800 rounded"></div>
      <div className="w-9 h-9 rounded-xl bg-slate-800"></div>
    </div>
    <div className="h-7 w-32 bg-slate-800 rounded mb-2"></div>
    <div className="h-3 w-40 bg-slate-800/60 rounded"></div>
  </div>
);

export const TransactionItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse mb-2">
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-slate-800"></div>
      <div>
        <div className="h-4 w-28 bg-slate-800 rounded mb-1.5"></div>
        <div className="h-3 w-20 bg-slate-800/70 rounded"></div>
      </div>
    </div>
    <div className="text-right">
      <div className="h-4 w-16 bg-slate-800 rounded mb-1.5 ml-auto"></div>
      <div className="h-3 w-12 bg-slate-800/70 rounded ml-auto"></div>
    </div>
  </div>
);

export const BankCardSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 w-28 bg-slate-800 rounded"></div>
      <div className="w-3 h-3 rounded-full bg-slate-800"></div>
    </div>
    <div className="h-8 w-36 bg-slate-800 rounded mb-4"></div>
    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
      <div className="h-4 w-20 bg-slate-800 rounded"></div>
      <div className="h-4 w-20 bg-slate-800 rounded ml-auto"></div>
    </div>
  </div>
);
