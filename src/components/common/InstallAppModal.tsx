import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowDownToLine,
  AlertCircle,
  HelpCircle,
  Share2,
  MoreVertical
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
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [apkError, setApkError] = useState<string | null>(null);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (standaloneCheck) {
      setIsStandalone(true);
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
      setIsStandalone(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If on mobile browser and not dismissed, show prompt after 3.5s even if beforeinstallprompt hasn't fired yet
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile && !hasDismissed) {
      mobileTimer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, []);

  // Primary 1-Tap PWA Installation Handler
  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('[PWA]: User accepted the install prompt');
          setDeferredPrompt(null);
          setIsInstalled(true);
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('[PWA Install Prompt Error]:', err);
        setShowManualGuide(true);
      }
    } else {
      // Fallback instructions if browser already cached or blocked automatic prompt
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('galaxy_install_dismissed', 'true');
    setIsOpen(false);
  };

  // Safe APK download with pre-flight check to prevent saving 404 HTML stubs
  const handleApkDownload = async () => {
    setApkError(null);
    setIsDownloadingApk(true);
    const apkUrl = api.getApkDownloadUrl();

    try {
      // Pre-flight check
      const response = await fetch(apkUrl, { method: 'HEAD' }).catch(() => null);

      if (response && !response.ok) {
        throw new Error('Native APK package currently unavailable. Please tap "PWA Instant App" to install directly via browser.');
      }

      if (response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          throw new Error('Native APK package currently unavailable. Please tap "PWA Instant App" to install directly via browser.');
        }
      }

      const link = document.createElement('a');
      link.href = apkUrl;
      link.setAttribute('download', 'galaxy-finance-v1.0.0.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.warn('[APK Download Error]:', err);
      setApkError(err.message || 'Direct APK currently unavailable. Please use PWA Instant App.');
    } finally {
      setIsDownloadingApk(false);
    }
  };

  // Do not render if standalone or already installed or closed
  if (isStandalone || !isOpen || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#10221E]/95 text-[#FFF4E1] border border-[#89D7B7]/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl relative">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#FFF4E1]/60 hover:text-[#FFF4E1] hover:bg-white/10 transition cursor-pointer"
          aria-label="Dismiss install banner"
        >
          <X size={16} />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#89D7B7] text-[#10221E] flex items-center justify-center shadow-lg shadow-[#89D7B7]/25 shrink-0 overflow-hidden border border-[#89D7B7]/40">
            <img 
              src="/icons/icon-192.png" 
              alt="Galaxy Finance App" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
            <Smartphone size={24} className="stroke-[2.2] hidden" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#FFF4E1] tracking-tight">
                Galaxy Finance
              </h4>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#89D7B7]/20 text-[#89D7B7] border border-[#89D7B7]/30 font-mono">
                PWA
              </span>
            </div>
            <p className="text-xs text-[#FFF4E1]/80 mt-0.5 line-clamp-2">
              📱 Install Galaxy Finance App for an optimal full-screen mobile experience.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-3.5 pt-3 border-t border-[#89D7B7]/20 grid grid-cols-2 gap-2 text-[11px] text-[#FFF4E1]/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#89D7B7] shrink-0" />
            <span>Zero App Store Fees</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#89D7B7] shrink-0" />
            <span>Fast Offline Access</span>
          </div>
        </div>

        {/* Tab Selection: PWA vs Direct APK */}
        <div className="mt-3 flex rounded-xl bg-black/25 p-1 border border-[#89D7B7]/20">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pwa');
              setApkError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-[#89D7B7] text-[#10221E] shadow-sm'
                : 'text-[#FFF4E1]/70 hover:text-[#FFF4E1]'
            }`}
          >
            <span>PWA Instant App</span>
            <span className="text-[9px] uppercase bg-[#10221E]/30 px-1 py-0.2 rounded font-mono">Fast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'apk'
                ? 'bg-[#89D7B7] text-[#10221E] shadow-sm'
                : 'text-[#FFF4E1]/70 hover:text-[#FFF4E1]'
            }`}
          >
            <ArrowDownToLine size={13} />
            <span>Direct APK</span>
          </button>
        </div>

        {/* Tab-specific explanation */}
        <div className="mt-2.5 text-[11px] text-[#FFF4E1]/80 leading-relaxed">
          {activeTab === 'pwa' ? (
            <p className="flex items-center gap-1.5 text-[#89D7B7] font-medium">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Recommended: Zero-error 1-tap install via native browser engine.</span>
            </p>
          ) : (
            <div className="space-y-1 text-[#FFF4E1]/70">
              <p className="flex items-start gap-1.5 text-amber-300">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>Notice: Direct APK requires "Install Unknown Apps" permission and may trigger package parser security checks.</span>
              </p>
            </div>
          )}
        </div>

        {/* Inline Manual Fallback Guide for PWA */}
        {showManualGuide && activeTab === 'pwa' && (
          <div className="mt-3 p-3 rounded-2xl bg-[#1A312C] border border-[#89D7B7]/30 text-xs text-[#FFF4E1] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[#89D7B7] font-bold">
              <span className="flex items-center gap-1.5">
                <HelpCircle size={14} />
                <span>Manual Installation Steps</span>
              </span>
              <button 
                onClick={() => setShowManualGuide(false)}
                className="text-[10px] text-[#FFF4E1]/60 hover:text-[#FFF4E1]"
              >
                Close
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#FFF4E1]/90">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#89D7B7]/20 text-[#89D7B7] flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Tap browser menu (<MoreVertical size={12} className="inline" /> on Chrome or <Share2 size={12} className="inline" /> on Safari).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#89D7B7]/20 text-[#89D7B7] flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Select <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.</span>
              </div>
            </div>
          </div>
        )}

        {/* APK Error Message */}
        {apkError && activeTab === 'apk' && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold">{apkError}</p>
              <button
                onClick={() => setActiveTab('pwa')}
                className="mt-1.5 text-xs text-[#89D7B7] underline font-bold"
              >
                Switch to PWA Instant App
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5">
          {activeTab === 'pwa' ? (
            <button
              onClick={handlePWAInstall}
              className="w-full py-2.5 px-4 rounded-xl bg-[#89D7B7] text-[#0A261F] font-bold text-sm shadow-lg hover:bg-[#A3E6CD] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} className="stroke-[2.5]" />
              <span>Install Galaxy Finance App</span>
            </button>
          ) : (
            <button
              onClick={handleApkDownload}
              disabled={isDownloadingApk}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownToLine size={15} className="stroke-[2.5]" />
              <span>{isDownloadingApk ? 'Checking Package...' : 'Download APK (18.6 MB)'}</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[#FFF4E1]/80 hover:text-[#FFF4E1] text-xs font-bold transition cursor-pointer shrink-0"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
