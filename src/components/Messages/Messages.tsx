import { useApp } from '../../context/AppContext';
import { Mail, ChevronRight } from 'lucide-react';

export function Messages() {
  const { messages, navigateTo } = useApp();

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    const firstLine = text.split('\n')[0];
    if (firstLine.length <= maxLength) return firstLine;
    return firstLine.substring(0, maxLength) + '...';
  };

  const handleMessageClick = (messageId: string) => {
    navigateTo('message-detail', messageId);
  };

  if (messages.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Communications de Wallfin</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Aucun message pour le moment</p>
          <p className="text-slate-500 text-sm text-center">Vous recevrez ici les communications de Wallfin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Communications de Wallfin</p>
      </div>

      <div className="space-y-3">
        {sortedMessages.map((message) => (
          <button
            key={message.id}
            onClick={() => handleMessageClick(message.id)}
            className={`w-full bg-white rounded-xl p-4 text-left shadow-sm transition-all hover:shadow-md ${
              !message.is_read ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {!message.is_read && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Nouveau
                  </span>
                )}
                <h3 className={`font-semibold mb-1 ${message.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                  {message.titre}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                  {truncateText(message.contenu, 80)}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span>{formatDate(message.created_at)}</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
