import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowDownToLine
} from 'lucide-react';
import api from '../../services/api';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in this session
    const hasDismissed = sessionStorage.getItem('galaxy_install_dismissed');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!hasDismissed) {
        // Show after a gentle 1.5s delay
        setTimeout(() => setIsOpen(true), 1500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If on mobile browser and not dismissed, show prompt after 3s even if beforeinstallprompt hasn't fired yet
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile && !hasDismissed) {
      mobileTimer = setTimeout(() => {
        setIsOpen((prev) => prev || true);
      }, 3500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA]: User accepted the install prompt');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsOpen(false);
    } else {
      // If browser doesn't support automatic prompt, switch to APK download tab or guide user
      setActiveTab('apk');
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('galaxy_install_dismissed', 'true');
    setIsOpen(false);
  };

  const handleApkDownload = () => {
    const apkUrl = api.getApkDownloadUrl();
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'galaxy-finance-v1.0.0.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover-bg)] transition cursor-pointer"
          aria-label="Dismiss install banner"
        >
          <X size={16} />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] shrink-0 overflow-hidden border border-[var(--card-border)]">
            <img 
              src="/icons/icon-192.png" 
              alt="Galaxy Finance App" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to Smartphone icon
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
            <Smartphone size={24} className="stroke-[2.2] hidden" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[var(--text-headings)] tracking-tight">
                Galaxy Finance
              </h4>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--row-hover-bg)] text-[var(--accent-primary)] border border-[var(--card-border)] font-mono">
                App
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
              📱 Install Galaxy Finance App for an optimal full-screen mobile experience.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-3.5 pt-3 border-t border-[var(--divider)] grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>Fast Offline Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-cyan-400 shrink-0" />
            <span>Zero App Store Fees</span>
          </div>
        </div>

        {/* Tab Selection: PWA vs Direct APK */}
        <div className="mt-3 flex rounded-xl bg-[var(--row-hover-bg)] p-1 border border-[var(--card-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            PWA Web App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'apk'
                ? 'bg-[var(--accent-primary)] text-[var(--btn-primary-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ArrowDownToLine size={13} />
            <span>Android APK</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          {activeTab === 'pwa' ? (
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] text-[var(--btn-primary-text)] font-extrabold text-xs shadow-md shadow-[var(--accent-glow)] hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={15} className="stroke-[2.5]" />
              <span>Install Now</span>
            </button>
          ) : (
            <button
              onClick={handleApkDownload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownToLine size={15} className="stroke-[2.5]" />
              <span>Download APK (42.8 MB)</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="py-2.5 px-4 rounded-xl bg-[var(--row-hover-bg)] hover:bg-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
