import { useApp } from '../../context/AppContext';
import { Grid2X2, CreditCard, MessageCircle } from 'lucide-react';
import type { ViewType } from '../../types';

export function BottomNav() {
  const { currentView, navigateTo } = useApp();

  const navItems = [
    {
      id: 'accueil' as ViewType,
      label: 'Accueil',
      icon: Grid2X2,
    },
    {
      id: 'credits' as ViewType,
      label: 'Crédits',
      icon: CreditCard,
    },
    {
      id: 'demandes' as ViewType,
      label: 'Demandes',
      icon: MessageCircle,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'border-2 border-transparent'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-orange-500' : 'text-slate-500'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-orange-500' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
