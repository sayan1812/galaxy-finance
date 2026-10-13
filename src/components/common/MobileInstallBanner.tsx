import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const MobileInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed/running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // 1. Immediately pick up if already captured globally on window
    const globalPrompt = (window as any).__galaxyDeferredPrompt;
    if (globalPrompt) {
      setInstallPrompt(globalPrompt);
      setIsVisible(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__galaxyDeferredPrompt = e;
      setInstallPrompt(e);
      setIsVisible(true);
    };

    const handleCustomPrompt = (e: any) => {
      if (e.detail) {
        setInstallPrompt(e.detail);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('galaxy-beforeinstallprompt', handleCustomPrompt);

    // Also display for mobile browsers so users can see how to install even if prompt is delayed
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile) {
      timer = setTimeout(() => setIsVisible(true), 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('galaxy-beforeinstallprompt', handleCustomPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = installPrompt || (window as any).__galaxyDeferredPrompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          (window as any).__galaxyDeferredPrompt = null;
        }
        setInstallPrompt(null);
      } catch {
        alert("To install: Tap the 3 dots (⋮) in Chrome and select 'Install app' or 'Add to Home screen'.");
      }
    } else {
      // Fallback guide if browser prompt is suppressed or delayed
      alert("To install: Tap the 3 dots (⋮) in Chrome and select 'Install app' or 'Add to Home screen'.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 p-4 rounded-2xl bg-[#10221E]/95 border border-[#89D7B7]/30 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A312C] border border-[#89D7B7]/40 flex items-center justify-center text-[#89D7B7] font-bold">
            GF
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#FFF4E1]">Galaxy Finance App</h4>
            <p className="text-xs text-[#89D7B7]/80">Install for optimal full-screen mobile experience</p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-[#FFF4E1]/40 hover:text-[#FFF4E1] p-1 cursor-pointer transition-colors"
          aria-label="Close install banner"
        >
          <X size={18} />
        </button>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full py-2.5 px-4 rounded-xl bg-[#89D7B7] hover:bg-[#A3E6CD] text-[#0D221E] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
      >
        <Download size={16} />
        Install App
      </button>
    </div>
  );
};

export const InstallAppModal = MobileInstallBanner;
export default MobileInstallBanner;
