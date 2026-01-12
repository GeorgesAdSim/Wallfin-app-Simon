import { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { BottomNav } from '../Navigation/BottomNav';
import { Square, Bell, Info } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
}

export function AppLayout({ children, showBottomNav = true, showHeader = true }: AppLayoutProps) {
  const { isDemo } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {isDemo && (
        <div className="bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium" role="status">
          <Info className="inline w-4 h-4 mr-2" aria-hidden="true" />
          Mode demonstration - Donnees fictives a titre indicatif
        </div>
      )}

      {showHeader && (
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-lg p-2" aria-hidden="true">
                <Square className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Wallfin</div>
                <div className="text-sm text-slate-700">Espace Client</div>
              </div>
            </div>

            <button
              aria-label="Voir les notifications"
              className="text-slate-600 hover:text-slate-900 relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      <main id="main-content" className="max-w-4xl mx-auto">
        {children}
      </main>

      {showBottomNav && <BottomNav />}

      <footer className="pb-16 pt-6 border-t border-slate-200 text-center text-sm text-slate-700">
        <p>2025 Wallfin - Courtier en credit</p>
        <p className="mt-1">
          <a href="tel:+3242281942" className="hover:text-orange-600">+32 4 228 19 42</a>
          {' | '}
          <a href="https://wallfin.be" className="hover:text-orange-600">wallfin.be</a>
        </p>
      </footer>
    </div>
  );
}
