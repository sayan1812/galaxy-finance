import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Bell, 
  Volume2, 
  Sun, 
  Coins,
  Sparkles,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { AVAILABLE_CURRENCIES } from '../../constants/categories';
import { ConfirmModal } from '../layout/ConfirmModal';

export const DataManagement: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportBackupJSON, 
    importBackupJSON, 
    resetToSampleData, 
    clearAllData 
  } = useTransactions();

  const { user, isAuthenticated, setIsAuthModalOpen, setAuthModalMode, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RupeeWise_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to restore backup. Invalid JSON file format.');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* 1. General Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            General Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize currency, appearance, and audio feedback
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Currency Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Coins size={16} className="text-emerald-500" />
              <span>Default Currency</span>
            </div>
            <select
              value={settings.currency.code}
              onChange={(e) => {
                const found = AVAILABLE_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) updateSettings({ currency: found });
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {AVAILABLE_CURRENCIES.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.symbol} - {cur.name} ({cur.code})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Mode: Light Mode Standard */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-1 sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sun size={16} className="text-amber-500" />
                <span>Appearance Mode</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                Light Mode Active
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={15} className="text-amber-500" />
                <span className="font-semibold text-slate-800">Standard Light Mode</span>
                <span className="text-[10px] text-slate-400">• Dark and Night modes withdrawn for optimal clarity</span>
              </div>
              <CheckCircle2 size={15} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* User Account & Security Status */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Account & Authentication Security
              </h4>
            </div>
            {isAuthenticated && user && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Authenticated</span>
              </span>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <p className="text-[11px] text-slate-400">Full Name</p>
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-[11px] text-slate-400 mt-2">Email Address</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white truncate mr-2">{user.email}</p>
                  {user.emailVerified ? (
                    <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthModalMode('verify-email');
                        setIsAuthModalOpen(true);
                      }}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <p className="text-[11px] text-slate-400">Phone Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{user.phone || 'Not added'}</p>
                  {user.phoneVerified ? (
                    <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthModalMode('verify-phone');
                        setIsAuthModalOpen(true);
                      }}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      Verify OTP
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={logout}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('forgot-password');
                      setIsAuthModalOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <KeyRound size={13} />
                    <span>Reset Key</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-white">Guest Session Mode</p>
                <p className="text-[11px] text-slate-400">Sign in to save your financial data securely to the isolated database.</p>
              </div>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>

        {/* 3D Galaxy & Space UI Settings */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                3D Galaxy & Cosmic Graphics
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              GPU Accelerated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Galaxy Intensity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Galaxy Starfield Intensity
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateSettings({ galaxyIntensity: lvl })}
                    className={`py-1.5 rounded-xl text-[11px] font-bold uppercase transition cursor-pointer ${
                      settings.galaxyIntensity === lvl
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduce Motion / Performance Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-700">
              <div>
                <span className="block text-xs font-bold text-white">Performance Mode</span>
                <span className="text-[10px] text-slate-400">Reduce 3D motion & save battery</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Audio Feedback & Notification settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Sound Feedback Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                <Volume2 size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Audio Feedback
                </h4>
                <p className="text-[11px] text-slate-500">
                  Subtle chimes on transactions & actions
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundFeedback}
              onChange={(e) => updateSettings({ soundFeedback: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Budget Alerts Threshold */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Bell size={16} className="text-amber-500" />
                <span>Budget Warning Threshold</span>
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                {settings.budgetAlertThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={settings.budgetAlertThreshold}
              onChange={(e) => updateSettings({ budgetAlertThreshold: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Warn when category spending exceeds {settings.budgetAlertThreshold}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Backup & Data Storage */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Data Storage & Backup
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export, import, or reset all transactions and budgets
          </p>
        </div>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download size={14} className="text-emerald-500" />
                <span>Export Full Backup (JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Save a complete copy of all your financial transactions, budgets, recurring items, and custom categories.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs"
            >
              Download Backup File
            </button>
          </div>

          {/* Import JSON Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload size={14} className="text-indigo-500" />
                <span>Restore from Backup</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Upload a previously exported RupeeWise JSON file to restore your data.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs"
              >
                Select Backup File
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Load Demo / Sample Data</span>
          </button>

          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Load Sample Demo Data?"
        message="This will overwrite your existing transactions and populate the app with realistic sample transactions, budgets, and recurring payments. Continue?"
        confirmLabel="Load Sample Data"
        isDestructive={false}
        onConfirm={() => {
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Erase All Financial Data?"
        message="Are you sure you want to permanently clear all transactions, budgets, and recurring schedules? This cannot be undone."
        confirmLabel="Erase Everything"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
