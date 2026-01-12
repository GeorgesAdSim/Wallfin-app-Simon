import { useState, useEffect } from 'react';
import { X, Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function InstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (dismissedTime > oneDayAgo) {
        setIsDismissed(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-700">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-orange-400" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-white font-semibold text-base mb-1">
              Installer l'application
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Accedez a vos credits meme hors ligne
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Installer
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
