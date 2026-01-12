import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function Credits() {
  const { client, credits, navigateTo } = useApp();
  const [selectedCreditId, setSelectedCreditId] = useState('');
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [comment, setComment] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  if (!client) return null;

  const calculatePercentage = (dejaRembourse: number, restantDu: number) => {
    const total = dejaRembourse + restantDu;
    if (total === 0) return 0;
    return Math.round((dejaRembourse / total) * 100);
  };

  const handleNewCredit = () => {
    window.open('https://www.wallfin.be/', '_blank');
  };

  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) {
      setAmountError('Veuillez entrer un montant');
      return false;
    }
    if (num < 500) {
      setAmountError('Le montant minimum est de 500 EUR');
      return false;
    }
    if (num > 50000) {
      setAmountError('Le montant maximum est de 50 000 EUR');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAdditionalMoneyRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount(additionalAmount)) return;
    if (!selectedCreditId) return;

    const selectedCredit = credits.find(c => c.id === selectedCreditId);
    if (!selectedCredit) return;

    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-additional-money-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditType: selectedCredit.type,
          creditReference: selectedCredit.reference_number,
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
          amount: parseFloat(additionalAmount),
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      setShowSuccess(true);
      setSelectedCreditId('');
      setAdditionalAmount('');
      setComment('');
      setAmountError('');

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending request:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Bonjour, {client.first_name} {client.last_name}
      </h1>

      <button
        onClick={handleNewCredit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 mb-8 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <div className="text-left">
          <div className="font-semibold">Nouveau credit</div>
          <div className="text-sm opacity-90">Faire une demande</div>
        </div>
      </button>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Mes credits en cours</h2>
          {credits.length > 3 && (
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Voir tout
            </button>
          )}
        </div>

        <div className="space-y-3">
          {credits.map((credit) => {
            const percentage = calculatePercentage(credit.deja_rembourse, credit.restant_du);
            return (
              <button
                key={credit.id}
                onClick={() => navigateTo('credit-detail', credit.id)}
                className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">{creditTypeIcons[credit.type] || ''}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold mb-1">{credit.type}</div>
                    <div className="text-sm text-slate-400 mb-2">{credit.reference_number}</div>
                    <div
                      className="font-semibold mb-2"
                      style={{ fontSize: '12px', color: '#22C55E' }}
                    >
                      {percentage}% rembourse
                    </div>
                    <div
                      className="w-full h-2 rounded overflow-hidden"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <div
                        className="h-full rounded transition-all duration-500 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #F97316, #FB923C)',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-3" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-6">
        <p className="text-amber-800 text-xs leading-relaxed text-center">
          Les montants affiches sont donnes a titre indicatif et peuvent differer des montants reels. Pour toute information officielle, contactez Wallfin au +32 4 228 19 42.
        </p>
      </div>

      {credits.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-900">Demande d'argent supplementaire</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Besoin d'un montant supplementaire sur un de vos credits ?</p>

          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900 text-sm">Demande envoyee</div>
                <div className="text-green-700 text-xs">L'equipe Wallfin vous recontactera rapidement.</div>
              </div>
            </div>
          )}

          {showError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-red-900 text-sm">Erreur</div>
                <div className="text-red-700 text-xs">Veuillez reessayer ou appelez le +32 4 228 19 42</div>
              </div>
            </div>
          )}

          <form onSubmit={handleAdditionalMoneyRequest} className="space-y-4">
            <div>
              <label htmlFor="creditSelect" className="block text-sm font-medium text-slate-600 mb-1.5">
                Credit concerne *
              </label>
              <select
                id="creditSelect"
                value={selectedCreditId}
                onChange={(e) => setSelectedCreditId(e.target.value)}
                className="w-full px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                style={{ height: '48px', fontSize: '16px', color: selectedCreditId ? '#1e293b' : '#6B7280' }}
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

            <div>
              <label htmlFor="amountInput" className="block text-sm font-medium text-slate-600 mb-1.5">
                Montant supplementaire souhaite *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amountInput"
                  value={additionalAmount}
                  onChange={(e) => {
                    setAdditionalAmount(e.target.value);
                    if (amountError) setAmountError('');
                  }}
                  placeholder="Ex: 2000"
                  min="500"
                  max="50000"
                  className={`w-full px-4 pr-14 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    amountError ? 'border-red-400' : 'border-slate-300'
                  }`}
                  style={{ height: '48px', fontSize: '16px' }}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">EUR</span>
              </div>
              {amountError && <p className="mt-1.5 text-sm text-red-600">{amountError}</p>}
              <p className="mt-1 text-xs text-slate-400">Minimum 500 EUR - Maximum 50 000 EUR</p>
            </div>

            <div>
              <label htmlFor="commentInput" className="block text-sm font-medium text-slate-600 mb-1.5">
                Commentaire (facultatif)
              </label>
              <textarea
                id="commentInput"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none placeholder-slate-400"
                placeholder="Decrivez votre besoin ou ajoutez des precisions..."
                style={{ fontSize: '16px' }}
              />
              <p className="mt-1 text-xs text-slate-400 text-right">{comment.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              style={{ height: '52px', fontSize: '16px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer ma demande
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Votre demande sera etudiee par l'equipe Wallfin qui vous recontactera dans les plus brefs delais.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
