import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, ShieldAlert, WifiOff, Clock } from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { formatTime } from '../../utils/dateUtils';

interface SyncStatusBarProps {
  compact?: boolean;
}

export const SyncStatusBar: React.FC<SyncStatusBarProps> = ({ compact = false }) => {
  const { syncStatus, triggerSync } = useTransactions();

  const getStatusIcon = () => {
    switch (syncStatus.state) {
      case 'SYNCING':
        return <RefreshCw size={14} className="animate-spin text-emerald-600 dark:text-emerald-400" />;
      case 'SUCCESS':
        return <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />;
      case 'DUPLICATE_DETECTED':
        return <ShieldAlert size={14} className="text-amber-500" />;
      case 'CONNECTION_REQUIRED':
        return <WifiOff size={14} className="text-rose-500" />;
      case 'FAILED':
        return <AlertCircle size={14} className="text-rose-500" />;
      case 'NO_NEW':
      case 'IDLE':
      default:
        return <RefreshCw size={14} className="text-slate-400 dark:text-slate-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.state) {
      case 'SYNCING':
        return 'Syncing...';
      case 'SUCCESS':
        return 'Synced successfully';
      case 'DUPLICATE_DETECTED':
        return 'Duplicate detected';
      case 'NO_NEW':
        return 'No new transactions';
      case 'CONNECTION_REQUIRED':
        return 'Connection required';
      case 'FAILED':
        return 'Sync failed';
      case 'IDLE':
      default:
        return 'Sync Feeds';
    }
  };

  const lastSyncTimeFormatted = syncStatus.lastSyncedAt
    ? formatTime(syncStatus.lastSyncedAt)
    : 'Never';

  if (compact) {
    return (
      <button
        onClick={() => triggerSync(false)}
        disabled={syncStatus.state === 'SYNCING'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
          syncStatus.state === 'SYNCING'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
        }`}
        title={`Last synced: ${lastSyncTimeFormatted}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              {getStatusText()}
            </span>
            {syncStatus.importedCount !== undefined && syncStatus.importedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                +{syncStatus.importedCount} new
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <Clock size={11} />
            <span>Last synced: {syncStatus.lastSyncedAt ? `${new Date(syncStatus.lastSyncedAt).toLocaleDateString()}, ${lastSyncTimeFormatted}` : 'Not yet'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => triggerSync(true)}
          disabled={syncStatus.state === 'SYNCING'}
          className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition cursor-pointer hidden sm:inline-block"
          title="Simulate incoming duplicate online transaction to test conflict resolution"
        >
          Test Duplicate Alert
        </button>

        <button
          onClick={() => triggerSync(false)}
          disabled={syncStatus.state === 'SYNCING'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer ${
            syncStatus.state === 'SYNCING'
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
          }`}
        >
          <RefreshCw size={13} className={syncStatus.state === 'SYNCING' ? 'animate-spin' : ''} />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
};
