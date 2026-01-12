import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export function MessageDetail() {
  const { selectedMessageId, getMessageById, markMessageAsRead, navigateTo } = useApp();

  const message = selectedMessageId ? getMessageById(selectedMessageId) : null;

  useEffect(() => {
    if (message && !message.lu) {
      markMessageAsRead(message.id);
    }
  }, [message, markMessageAsRead]);

  if (!message) {
    navigateTo('messages');
    return null;
  }

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const time = date.toLocaleTimeString('fr-BE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} a ${time}`;
  };

  const handleContactClick = () => {
    navigateTo('demandes');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigateTo('messages')}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Message</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-sm text-slate-500 mb-3">{formatFullDate(message.date)}</p>
          <h2 className="text-xl font-bold text-slate-900 mb-4">{message.titre}</h2>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {message.contenu}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-4">
            Ce message est envoye automatiquement. Pour toute question, contactez-nous.
          </p>
          <button
            onClick={handleContactClick}
            className="w-full py-3 px-4 border-2 border-orange-500 text-orange-600 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Contacter Wallfin
          </button>
        </div>
      </div>
    </div>
  );
}
