import { useApp } from '../../context/AppContext';
import { ArrowLeft, Circle, ExternalLink } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function SimpleCreditDetail() {
  const { selectedCreditId, getCreditById, navigateTo } = useApp();

  if (!selectedCreditId) {
    navigateTo('credits');
    return null;
  }

  const credit = getCreditById(selectedCreditId);

  if (!credit) {
    navigateTo('credits');
    return null;
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'en_cours':
        return { label: 'En cours', color: 'text-green-500' };
      case 'en_attente':
        return { label: 'En attente', color: 'text-yellow-500' };
      case 'solde':
        return { label: 'Soldé', color: 'text-blue-500' };
      default:
        return { label: status, color: 'text-slate-500' };
    }
  };

  const status = getStatusDisplay(credit.statut);

  const handleContact = () => {
    window.open('https://www.wallfin.be/contact/', '_blank');
  };

  return (
    <div className="px-4 py-6">
      <button
        onClick={() => navigateTo('credits')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Retour</span>
      </button>

      <div>
        <div className="bg-slate-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{creditTypeIcons[credit.type] || '💰'}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{credit.type}</h1>
              <div className="text-slate-400">{credit.reference_number}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Circle className={`w-3 h-3 ${status.color}`} fill="currentColor" />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Montants</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Montant initial emprunté</span>
              <span className="font-semibold text-slate-900">{formatAmount(credit.montant_initial)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total restant à rembourser</span>
              <span className="font-semibold text-orange-500">{formatAmount(credit.restant_du)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Déjà remboursé</span>
              <span className="font-semibold text-green-500">{formatAmount(credit.deja_rembourse)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Échéances</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Mensualité</span>
              <span className="font-semibold text-slate-900">{formatAmount(credit.mensualite)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Durée totale</span>
              <span className="font-semibold text-slate-900">{credit.duree_total} mois</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Échéances restantes</span>
              <span className="font-semibold text-slate-900">{credit.echeances_restantes} mois</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Prochaine échéance</span>
              <span className="font-semibold text-slate-900">{formatDate(credit.prochaine_echeance)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Conditions</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">TAEG</span>
              <span className="font-semibold text-slate-900">{credit.taeg.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Date de souscription</span>
              <span className="font-semibold text-slate-900">{formatDate(credit.date_debut)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Date de fin prévue</span>
              <span className="font-semibold text-slate-900">{formatDate(credit.date_fin)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleContact}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Une question sur ce crédit ?</div>
            <div className="text-sm opacity-90">Contactez-nous</div>
          </div>
        </button>
      </div>
    </div>
  );
}
