import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const MobileInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState<boolean>(
    Boolean((window as any).deferredInstallPrompt || (window as any).__galaxyDeferredPrompt)
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in installed standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    const onReady = () => setCanInstall(true);
    window.addEventListener('pwa-prompt-ready', onReady);
    window.addEventListener('galaxy-beforeinstallprompt', onReady);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      (window as any).__galaxyDeferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    if ((window as any).deferredInstallPrompt || (window as any).__galaxyDeferredPrompt) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('pwa-prompt-ready', onReady);
      window.removeEventListener('galaxy-beforeinstallprompt', onReady);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredInstallPrompt || (window as any).__galaxyDeferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredInstallPrompt = null;
          (window as any).__galaxyDeferredPrompt = null;
          setCanInstall(false);
        }
      } catch {
        alert("To install Galaxy Finance: Tap the 3 dots (⋮) in Chrome and select 'Add to Home screen' or 'Install App'.");
      }
    } else {
      // Fallback for browsers that block dynamic prompt execution
      alert("To install Galaxy Finance: Tap the 3 dots (⋮) in Chrome and select 'Add to Home screen' or 'Install App'.");
    }
  };

  if (isDismissed || !canInstall) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 p-4 rounded-2xl bg-[#10221E]/95 border border-[#89D7B7]/30 backdrop-blur-xl shadow-2xl max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A312C] border border-[#89D7B7]/40 flex items-center justify-center text-[#89D7B7] font-bold text-sm">
            GF
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#FFF4E1]">Galaxy Finance App</h4>
            <p className="text-xs text-[#89D7B7]/80">Install for optimal full-screen mobile experience</p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-[#FFF4E1]/40 hover:text-[#FFF4E1] p-1 cursor-pointer transition-colors"
          aria-label="Close install banner"
        >
          <X size={18} />
        </button>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full py-2.5 px-4 rounded-xl bg-[#89D7B7] hover:bg-[#A3E6CD] text-[#0D221E] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
      >
        <Download size={16} />
        Install App
      </button>
    </div>
  );
};

export const InstallAppModal = MobileInstallBanner;
export default MobileInstallBanner;
