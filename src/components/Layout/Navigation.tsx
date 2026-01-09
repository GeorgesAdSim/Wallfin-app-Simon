import { LayoutDashboard, CreditCard, MessageSquare, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ViewType } from '../../types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { id: 'credits', label: 'Crédits', icon: CreditCard },
  { id: 'requests', label: 'Demandes', icon: MessageSquare },
  { id: 'profile', label: 'Profil', icon: User },
];

export function Navigation() {
  const { currentView, navigateTo } = useApp();

  const isActive = (id: ViewType) => {
    if (id === 'dashboard' && currentView === 'dashboard') return true;
    if (id === 'credits' && (currentView === 'credits' || currentView === 'credit-detail')) return true;
    if (id === 'requests' && (currentView === 'requests' || currentView === 'new-request')) return true;
    if (id === 'profile' && currentView === 'profile') return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  active
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
