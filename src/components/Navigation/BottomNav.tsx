import { useApp } from '../../context/AppContext';
import { User, CreditCard, Mail, MessageCircle } from 'lucide-react';
import type { ViewType } from '../../types';

export function BottomNav() {
  const { currentView, navigateTo, unreadMessagesCount } = useApp();

  const navItems = [
    {
      id: 'accueil' as ViewType,
      label: 'Profile',
      icon: User,
      ariaLabel: 'Voir mon profil',
    },
    {
      id: 'credits' as ViewType,
      label: 'Credits',
      icon: CreditCard,
      ariaLabel: 'Voir mes credits',
    },
    {
      id: 'messages' as ViewType,
      label: 'Messages',
      icon: Mail,
      ariaLabel: 'Voir mes messages',
      badge: unreadMessagesCount,
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
                className={`relative flex flex-col items-center justify-center gap-1 min-w-[70px] min-h-[56px] px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'border-2 border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <Icon
                    aria-hidden="true"
                    className={`w-6 h-6 ${
                      isActive ? 'text-orange-500' : 'text-slate-600'
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-orange-500' : 'text-slate-600'
                  }`}
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
