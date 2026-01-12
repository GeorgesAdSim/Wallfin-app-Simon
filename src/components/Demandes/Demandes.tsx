import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    emailjs: {
      init: (publicKey: string) => void;
      send: (serviceId: string, templateId: string, params: Record<string, string>) => Promise<{ status: number; text: string }>;
    };
  }
}

interface ContactRequest {
  id: string;
  date: string;
  subject: string;
  message: string;
  status: 'sent' | 'error';
}

export function Demandes() {
  const { client, credits } = useApp();
  const [subject, setSubject] = useState('');
  const [creditId, setCreditId] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [emailjsReady, setEmailjsReady] = useState(false);

  useEffect(() => {
    const initEmailJS = () => {
      if (window.emailjs) {
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY') {
          window.emailjs.init(publicKey);
          setEmailjsReady(true);
        }
      }
    };

    if (window.emailjs) {
      initEmailJS();
    } else {
      const checkInterval = setInterval(() => {
        if (window.emailjs) {
          initEmailJS();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, []);

  if (!client) return null;

  const saveToHistory = (request: ContactRequest) => {
    const historyKey = `contact_history_${client.id}`;
    const existingHistory = localStorage.getItem(historyKey);
    const history: ContactRequest[] = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(request);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    const clientName = `${client.first_name} ${client.last_name}`;
    const creditReference = creditId ? credits.find(c => c.id === creditId)?.reference_number : null;
    const currentDate = new Date().toLocaleDateString('fr-BE');

    const templateParams = {
      to_email: 'info@wallfin.be',
      from_name: clientName,
      from_email: client.email,
      from_phone: client.phone,
      subject: subject,
      credit_reference: creditReference || 'Non applicable',
      message: message,
      date: currentDate,
    };

    try {
      if (!emailjsReady || !window.emailjs) {
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
            creditReference,
            message,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send via edge function');
        }
      } else {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

        await window.emailjs.send(serviceId, templateId, templateParams);
      }

      saveToHistory({
        id: crypto.randomUUID(),
        date: currentDate,
        subject,
        message,
        status: 'sent',
      });

      setShowSuccess(true);
      setSubject('');
      setCreditId('');
      setMessage('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending request:', error);

      saveToHistory({
        id: crypto.randomUUID(),
        date: currentDate,
        subject,
        message,
        status: 'error',
      });

      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 8000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact</h1>
      <p className="text-gray-600 mb-6" style={{ fontSize: '14px' }}>Envoyez une demande a l'equipe Wallfin</p>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-green-900 mb-1">Demande envoyee</div>
            <div className="text-green-700" style={{ fontSize: '14px' }}>
              Votre demande a bien ete envoyee. L'equipe Wallfin vous repondra dans les plus brefs delais.
            </div>
          </div>
        </div>
      )}

      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-red-900 mb-1">Erreur lors de l'envoi</div>
            <div className="text-red-700" style={{ fontSize: '14px' }}>
              Veuillez reessayer ou nous appeler au{' '}
              <a href="tel:+3242281942" className="font-semibold underline">
                +32 4 228 19 42
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-2" style={{ fontSize: '14px' }}>
              Sujet *
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              style={{ height: '48px', fontSize: '16px', color: subject ? '#1e293b' : '#6B7280' }}
              required
            >
              <option value="" style={{ color: '#6B7280' }}>Selectionnez un sujet</option>
              <option value="Question sur mon crédit" style={{ color: '#1e293b' }}>Question sur mon credit</option>
              <option value="Problème technique" style={{ color: '#1e293b' }}>Probleme technique</option>
              <option value="Modifier mes informations" style={{ color: '#1e293b' }}>Modifier mes informations</option>
              <option value="Autre" style={{ color: '#1e293b' }}>Autre</option>
            </select>
          </div>

          {subject === 'Question sur mon crédit' && (
            <div>
              <label htmlFor="credit" className="block text-sm font-medium text-gray-600 mb-2" style={{ fontSize: '14px' }}>
                Credit concerne *
              </label>
              <select
                id="credit"
                value={creditId}
                onChange={(e) => setCreditId(e.target.value)}
                className="w-full px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                style={{ height: '48px', fontSize: '16px', color: creditId ? '#1e293b' : '#6B7280' }}
                required
              >
                <option value="" style={{ color: '#6B7280' }}>Selectionnez un credit</option>
                {credits.map((credit) => (
                  <option key={credit.id} value={credit.id} style={{ color: '#1e293b' }}>
                    {credit.type} - {credit.reference_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-2" style={{ fontSize: '14px' }}>
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder-gray-500"
              placeholder="Decrivez votre demande..."
              style={{ minHeight: '150px', fontSize: '16px' }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          style={{ height: '56px', fontSize: '18px' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Envoyer ma demande
            </>
          )}
        </button>
      </form>

      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <p className="text-gray-600 text-center" style={{ fontSize: '14px' }}>
          Vous pouvez aussi nous contacter par telephone au{' '}
          <a href="tel:+3242281942" className="text-orange-500 font-medium">
            +32 4 228 19 42
          </a>
        </p>
      </div>
    </div>
  );
}
