import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Share2,
  MoreVertical,
  Check
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

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

    // 1. Immediately pick up globally captured prompt if already fired
    const globalPrompt = (window as any).__galaxyDeferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      if (!hasDismissed) {
        setTimeout(() => setIsOpen(true), 800);
      }
    }

    // 2. Listen for native browser prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__galaxyDeferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!hasDismissed) {
        setTimeout(() => setIsOpen(true), 1000);
      }
    };

    // 3. Listen for early-capture custom event
    const handleCustomPrompt = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail as BeforeInstallPromptEvent);
        if (!hasDismissed) {
          setTimeout(() => setIsOpen(true), 800);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('galaxy-beforeinstallprompt', handleCustomPrompt);

    // Listen for successful install event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setIsOpen(false);
      setDeferredPrompt(null);
      (window as any).__galaxyDeferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt on mobile browser if not dismissed
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile && !hasDismissed) {
      mobileTimer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('galaxy-beforeinstallprompt', handleCustomPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, []);

  // Primary 1-Tap PWA Installation Handler
  const handlePWAInstall = async () => {
    const prompt = deferredPrompt || (window as any).__galaxyDeferredPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          console.log('[PWA]: User accepted the install prompt');
          setDeferredPrompt(null);
          (window as any).__galaxyDeferredPrompt = null;
          setIsInstalled(true);
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('[PWA Install Prompt Error]:', err);
        setShowManualGuide(true);
      }
    } else {
      // If browser doesn't expose automatic prompt or delayed it, show visual manual guide
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('galaxy_install_dismissed', 'true');
    setIsOpen(false);
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
                Instant App
              </span>
            </div>
            <p className="text-xs text-[#FFF4E1]/80 mt-0.5 line-clamp-2">
              📱 Install Galaxy Finance to your phone home screen with 1 tap.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-3.5 pt-3 border-t border-[#89D7B7]/20 grid grid-cols-2 gap-2 text-[11px] text-[#FFF4E1]/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#89D7B7] shrink-0" />
            <span>Zero App Parsing Errors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#89D7B7] shrink-0" />
            <span>Instant 1-Tap Setup</span>
          </div>
        </div>

        {/* Zero-Error PWA Status Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-black/25 border border-[#89D7B7]/20 text-[11px] text-[#89D7B7] flex items-center gap-2">
          <Check size={14} className="shrink-0 text-[#89D7B7]" />
          <span>No raw APK download required. Installs safely via verified Android WebAPK.</span>
        </div>

        {/* Step-by-Step Guide (shown if browser prompt is delayed or user taps install) */}
        {showManualGuide && (
          <div className="mt-3 p-3.5 rounded-2xl bg-[#1A312C] border border-[#89D7B7]/30 text-xs text-[#FFF4E1] space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[#89D7B7] font-bold">
              <span>Follow these 2 quick steps:</span>
              <button 
                onClick={() => setShowManualGuide(false)}
                className="text-[10px] text-[#FFF4E1]/60 hover:text-[#FFF4E1]"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2 text-[11px] text-[#FFF4E1]/90">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#89D7B7]/20 text-[#89D7B7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  Tap your browser menu (<MoreVertical size={13} className="inline text-[#89D7B7]" /> top-right in Chrome, or <Share2 size={13} className="inline text-[#89D7B7]" /> Share in Safari/Samsung).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#89D7B7]/20 text-[#89D7B7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={handlePWAInstall}
            className="flex-1 py-3 px-4 rounded-xl bg-[#89D7B7] text-[#0A261F] font-black text-sm shadow-lg shadow-[#89D7B7]/20 hover:bg-[#A3E6CD] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} className="stroke-[2.5]" />
            <span>Install Galaxy Finance App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[#FFF4E1]/80 hover:text-[#FFF4E1] text-xs font-bold transition cursor-pointer shrink-0"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
