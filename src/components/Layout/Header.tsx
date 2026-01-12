import { useApp } from '../../context/AppContext';
import { Bell, User } from 'lucide-react';

export function Header() {
  const { client, navigateTo, unreadMessagesCount } = useApp();

  const handleNotificationClick = () => {
    navigateTo('messages');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images_(3).png"
            alt="Wallfin"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Wallfin</h1>
            <p className="text-xs text-gray-500">Espace Client</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            aria-label={`Messages${unreadMessagesCount > 0 ? `, ${unreadMessagesCount} non lus` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            {client && (
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {client.first_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
