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
        return <RefreshCw size={14} className="animate-spin text-[#E53935]" />;
      case 'SUCCESS':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'DUPLICATE_DETECTED':
        return <ShieldAlert size={14} className="text-amber-400" />;
      case 'CONNECTION_REQUIRED':
        return <WifiOff size={14} className="text-[#E53935]" />;
      case 'FAILED':
        return <AlertCircle size={14} className="text-[#E53935]" />;
      case 'NO_NEW':
      case 'IDLE':
      default:
        return <RefreshCw size={14} className="text-[#8E929D]" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.state) {
      case 'SYNCING':
        return 'Syncing Feeds...';
      case 'SUCCESS':
        return 'Synced Verified';
      case 'DUPLICATE_DETECTED':
        return 'Duplicate Detected';
      case 'NO_NEW':
        return 'Zero New Entries';
      case 'CONNECTION_REQUIRED':
        return 'Connection Required';
      case 'FAILED':
        return 'Sync Failed';
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
          syncStatus.state === 'SYNCING'
            ? 'bg-[#4A121A]/50 border-[#E53935]/50 text-[#E53935]'
            : 'bg-[#13131A] border-white/[0.08] text-[#8E929D] hover:border-[#E53935]/40 hover:text-[#FBFBFB]'
        }`}
        title={`Last synced: ${lastSyncTimeFormatted}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#13131A] border border-[rgba(74,18,26,0.35)] shadow-sm fin-card">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
          {getStatusIcon()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[#FBFBFB]">
              {getStatusText()}
            </span>
            {syncStatus.importedCount !== undefined && syncStatus.importedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-[#4A121A] text-[#E53935] border border-[#E53935]/30 text-[10px] font-mono font-bold">
                +{syncStatus.importedCount} new
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8E929D] truncate flex items-center gap-1 mt-0.5 font-mono">
            <Clock size={11} />
            <span>Last synced: {syncStatus.lastSyncedAt ? `${new Date(syncStatus.lastSyncedAt).toLocaleDateString()}, ${lastSyncTimeFormatted}` : 'Not yet'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => triggerSync(true)}
          disabled={syncStatus.state === 'SYNCING'}
          className="text-[11px] font-mono text-[#8E929D] hover:text-[#FBFBFB] px-2 py-1 rounded-lg hover:bg-white/[0.04] transition cursor-pointer hidden sm:inline-block"
          title="Simulate incoming duplicate online transaction to test conflict resolution"
        >
          Test Duplicate Alert
        </button>

        <button
          onClick={() => triggerSync(false)}
          disabled={syncStatus.state === 'SYNCING'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#FBFBFB] transition-all cursor-pointer ${
            syncStatus.state === 'SYNCING'
              ? 'bg-[#4A121A] cursor-not-allowed opacity-60'
              : 'btn-crimson shadow-md'
          }`}
        >
          <RefreshCw size={13} className={syncStatus.state === 'SYNCING' ? 'animate-spin' : ''} />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
};
