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
      ariaLabel: 'Acceder a mon compte',
    },
    {
      id: 'credits' as ViewType,
      label: 'Credits',
      icon: CreditCard,
      ariaLabel: 'Voir mes credits',
    },
    {
      id: 'demandes' as ViewType,
      label: 'Demandes',
      icon: MessageCircle,
      ariaLabel: 'Voir mes demandes de credit',
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50"
      style={{ minHeight: '70px' }}
    >
      <div className="max-w-md mx-auto h-full">
        <div className="flex items-center justify-around px-2 py-3 h-full">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1.5 min-w-[80px] min-h-[60px] px-4 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'border-2 border-transparent hover:bg-slate-50'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`w-7 h-7 ${
                    isActive ? 'text-orange-500' : 'text-slate-600'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-orange-500' : 'text-slate-600'
                  }`}
                  style={{ fontSize: '14px' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
