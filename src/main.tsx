import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'

// Global install prompt fallback and synchronization
if (!(window as any).deferredInstallPrompt) {
  (window as any).deferredInstallPrompt = (window as any).__galaxyDeferredPrompt || null;
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredInstallPrompt = e;
  (window as any).__galaxyDeferredPrompt = e;
  window.dispatchEvent(new Event('pwa-prompt-ready'));
  window.dispatchEvent(new CustomEvent('galaxy-beforeinstallprompt', { detail: e }));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register PWA Service Worker for standalone installability
if ('serviceWorker' in navigator && import.meta.env.MODE !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {});
        console.log('[PWA]: ServiceWorker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA]: ServiceWorker registration skipped/failed:', err);
      });
  });
}

