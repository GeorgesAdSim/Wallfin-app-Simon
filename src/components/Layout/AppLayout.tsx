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
      {isDemo && (
        <div className="bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium">
          <Info className="inline w-4 h-4 mr-2" />
          Mode démonstration - Données fictives à titre indicatif
        </div>
      )}

      {showHeader && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 rounded-lg p-2">
                <Square className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Wallfin</div>
                <div className="text-xs text-slate-600">Espace Client</div>
              </div>
            </div>

            <button className="text-slate-600 hover:text-slate-900 relative">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {children}
      </div>

      {showBottomNav && <BottomNav />}

      <div className="pb-16 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
        © 2025 Wallfin - Courtier en crédit | +32 4 228 19 42 | wallfin.be
      </div>
    </div>
  );
}
