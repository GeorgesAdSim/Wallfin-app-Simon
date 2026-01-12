import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Circle, Wallet, Calendar, Clock, CreditCard, TrendingUp, Flag, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';
import { formatCurrency, formatShortDate, formatDate } from '../../utils/format';

export function SimpleCreditDetail() {
  const { selectedCreditId, getCreditById, navigateTo } = useApp();
  const [showAllPayments, setShowAllPayments] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50">
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
