import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Circle, Wallet, Calendar, Clock, CreditCard, TrendingUp, Flag, Phone, MessageSquare, ChevronDown, ChevronUp, Plus, Check, Loader2 } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';
import { formatCurrency, formatShortDate, formatDate } from '../../utils/format';

export function SimpleCreditDetail() {
  const { selectedCreditId, getCreditById, navigateTo, client } = useApp();
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!selectedCreditId) {
    navigateTo('credits');
    return null;
  }

  const credit = getCreditById(selectedCreditId);

  if (!credit) {
    navigateTo('credits');
    return null;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'en_cours':
        return { label: 'En cours', color: 'text-green-500', bgColor: 'bg-green-500' };
      case 'en_attente':
        return { label: 'En attente', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
      case 'solde':
        return { label: 'Solde', color: 'text-blue-500', bgColor: 'bg-blue-500' };
      default:
        return { label: status, color: 'text-slate-500', bgColor: 'bg-slate-500' };
    }
  };

  const status = getStatusDisplay(credit.statut);

  const progressPercentage = Math.round((credit.deja_rembourse / credit.montant_initial) * 100);

  const getDaysUntilNextPayment = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextPayment = new Date(credit.prochaine_echeance);
    nextPayment.setHours(0, 0, 0, 0);
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilPayment = getDaysUntilNextPayment();

  const getUpcomingPayments = () => {
    const payments = [];
    const baseDate = new Date(credit.prochaine_echeance);
    const count = showAllPayments ? credit.echeances_restantes : 6;

    for (let i = 0; i < Math.min(count, credit.echeances_restantes); i++) {
      const paymentDate = new Date(baseDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      payments.push({
        date: paymentDate.toISOString().split('T')[0],
        amount: credit.mensualite,
        status: 'a_venir',
      });
    }
    return payments;
  };

  const upcomingPayments = getUpcomingPayments();

  const handleContactClick = () => {
    navigateTo('demandes');
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

  const handleAdditionalMoneySubmit = async () => {
    if (!validateAmount(additionalAmount)) return;
    if (!client || !credit) return;

    setIsSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-additional-money-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditType: credit.type,
          creditReference: credit.reference_number,
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
          amount: parseFloat(additionalAmount),
          comment: additionalComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      setShowSuccess(true);
      setAdditionalAmount('');
      setAdditionalComment('');
      setAmountError('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting additional money request:', error);
      setAmountError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showSuccess && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Votre demande a bien ete envoyee. L'equipe Wallfin vous recontactera rapidement.</p>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigateTo('credits')}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Detail du credit</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center text-3xl">
              {creditTypeIcons[credit.type] || '💰'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{credit.type}</h2>
              <p className="text-slate-400 text-sm mb-3">{credit.reference_number}</p>
              <div className="flex items-center gap-2">
                <Circle className={`w-2.5 h-2.5 ${status.color}`} fill="currentColor" />
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Progression du remboursement</h3>
          <div className="mb-3">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-center text-sm font-medium text-slate-600 mb-4">{progressPercentage}% rembourse</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Deja rembourse</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(credit.deja_rembourse)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Reste a payer</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(credit.restant_du)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Informations du credit</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Montant emprunte</p>
                <p className="font-semibold text-slate-900">{formatCurrency(credit.montant_initial)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Date de debut</p>
                <p className="font-semibold text-slate-900">{formatShortDate(credit.date_debut)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Date de fin prevue</p>
                <p className="font-semibold text-slate-900">{formatShortDate(credit.date_fin)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Duree totale</p>
                <p className="font-semibold text-slate-900">{credit.duree_total} mois</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Echeances restantes</p>
                <p className="font-semibold text-slate-900">{credit.echeances_restantes} mois</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Mensualite</p>
                <p className="font-semibold text-slate-900">{formatCurrency(credit.mensualite)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">TAEG</p>
                <p className="font-semibold text-slate-900">{credit.taeg.toFixed(2)} %</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">Demande d'argent supplementaire</h3>
          </div>
          <p className="text-sm text-slate-500 mb-5">Besoin d'un montant supplementaire sur ce credit ?</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Montant supplementaire souhaite *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={additionalAmount}
                  onChange={(e) => {
                    setAdditionalAmount(e.target.value);
                    if (amountError) setAmountError('');
                  }}
                  placeholder="Ex: 2000"
                  min="500"
                  max="50000"
                  className={`w-full border rounded-lg px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow ${
                    amountError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-200'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">EUR</span>
              </div>
              {amountError && (
                <p className="mt-2 text-sm text-red-600">{amountError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Commentaire (facultatif)
              </label>
              <textarea
                value={additionalComment}
                onChange={(e) => setAdditionalComment(e.target.value.slice(0, 500))}
                placeholder="Decrivez votre besoin ou ajoutez des precisions..."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow resize-none"
              />
              <p className="mt-1 text-xs text-slate-400 text-right">{additionalComment.length}/500</p>
            </div>

            <button
              onClick={handleAdditionalMoneySubmit}
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma demande'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Votre demande sera etudiee par l'equipe Wallfin qui vous recontactera dans les plus brefs delais.
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Prochaine echeance</h3>
          <p className="text-2xl font-bold text-slate-900 mb-1">{formatDate(credit.prochaine_echeance)}</p>
          <p className="text-xl font-semibold text-orange-600 mb-2">{formatCurrency(credit.mensualite)}</p>
          <p className="text-sm text-slate-600">
            {daysUntilPayment > 0 ? (
              <>Dans <span className="font-semibold text-orange-600">{daysUntilPayment} jour{daysUntilPayment > 1 ? 's' : ''}</span></>
            ) : daysUntilPayment === 0 ? (
              <span className="font-semibold text-orange-600">Aujourd'hui</span>
            ) : (
              <span className="font-semibold text-red-600">En retard de {Math.abs(daysUntilPayment)} jour{Math.abs(daysUntilPayment) > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Mes prochaines echeances</h3>
          <div className="space-y-3">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-slate-700">{formatShortDate(payment.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</span>
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">A venir</span>
                </div>
              </div>
            ))}
          </div>
          {credit.echeances_restantes > 6 && (
            <button
              onClick={() => setShowAllPayments(!showAllPayments)}
              className="w-full mt-4 py-3 text-center text-orange-600 font-medium flex items-center justify-center gap-2 hover:bg-orange-50 rounded-lg transition-colors"
            >
              {showAllPayments ? (
                <>
                  <span>Voir moins</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Voir tout le calendrier ({credit.echeances_restantes} echeances)</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-xs leading-relaxed text-center">
            Informations indicatives. Les montants, dates et echeances affiches peuvent varier. Referez-vous a votre contrat de credit pour les donnees officielles.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-2">Besoin d'aide ?</h3>
          <p className="text-sm text-slate-500 mb-4">Une question sur ce credit ?</p>
          <div className="space-y-3">
            <button
              onClick={handleContactClick}
              className="w-full py-3 px-4 border-2 border-orange-500 text-orange-600 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Contacter Wallfin
            </button>
            <a
              href="tel:+3242281942"
              className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
              +32 4 228 19 42
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
