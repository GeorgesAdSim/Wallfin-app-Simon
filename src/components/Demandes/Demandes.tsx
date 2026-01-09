import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, CheckCircle } from 'lucide-react';

export function Demandes() {
  const { client, credits } = useApp();
  const [subject, setSubject] = useState('');
  const [creditId, setCreditId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-request`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: {
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email,
            phone: client.phone,
          },
          subject,
          creditReference: creditId ? credits.find(c => c.id === creditId)?.reference_number : null,
          message,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setSubject('');
        setCreditId('');
        setMessage('');

        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact</h1>
      <p className="text-slate-600 mb-6">Envoyez une demande à l'équipe Wallfin</p>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-green-900 mb-1">Demande envoyée</div>
            <div className="text-sm text-green-700">
              Votre demande a bien été envoyée. L'équipe Wallfin vous répondra dans les plus brefs délais.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
              Sujet *
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez un sujet</option>
              <option value="Question sur mon crédit">Question sur mon crédit</option>
              <option value="Problème technique">Problème technique</option>
              <option value="Modifier mes informations">Modifier mes informations</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {subject === 'Question sur mon crédit' && (
            <div>
              <label htmlFor="credit" className="block text-sm font-medium text-slate-700 mb-2">
                Crédit concerné *
              </label>
              <select
                id="credit"
                value={creditId}
                onChange={(e) => setCreditId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un crédit</option>
                {credits.map((credit) => (
                  <option key={credit.id} value={credit.id}>
                    {credit.type} - {credit.reference_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Décrivez votre demande..."
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <Send className="w-5 h-5" />
          {isLoading ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </button>
      </form>

      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <p className="text-sm text-slate-600 text-center">
          Vous pouvez aussi nous contacter par téléphone au{' '}
          <a href="tel:+3242281942" className="text-orange-500 font-medium">
            +32 4 228 19 42
          </a>
        </p>
      </div>
    </div>
  );
}
