import { ArrowLeft, Calendar, Percent, FileText, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatShortDate, calculateProgress } from '../../utils/format';
import { creditTypeLabels } from '../../data/mockData';
import { MensualitesTable } from './MensualitesTable';

export function CreditDetail() {
  const { selectedCreditId, getCreditById, navigateTo } = useApp();

  if (!selectedCreditId) {
    return null;
  }

  const credit = getCreditById(selectedCreditId);

  if (!credit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Crédit introuvable</p>
      </div>
    );
  }

  const progress = calculateProgress(credit.total_amount, credit.remaining_amount);
  const paidAmount = credit.total_amount - credit.remaining_amount;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigateTo('credits')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Retour aux crédits</span>
      </button>

      <div className="bg-gray-900 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">{creditTypeLabels[credit.type]}</h2>
            <p className="text-gray-500 text-sm">{credit.reference}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            credit.status === 'active' ? 'bg-green-900/50 text-green-400' :
            credit.status === 'completed' ? 'bg-blue-900/50 text-blue-400' :
            'bg-yellow-900/50 text-yellow-400'
          }`}>
            {credit.status === 'active' ? 'Actif' : credit.status === 'completed' ? 'Terminé' : 'Suspendu'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-500 text-xs mb-1">Montant restant</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(credit.remaining_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs mb-1">sur</p>
              <p className="text-gray-400 font-medium">{formatCurrency(credit.total_amount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-orange-400 font-medium">{formatCurrency(paidAmount)} remboursés</span>
              <span className="text-gray-500">{progress.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Mensualité</span>
          </div>
          <p className="text-gray-900 font-bold text-lg">{formatCurrency(credit.monthly_payment)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Taux</span>
          </div>
          <p className="text-gray-900 font-bold text-lg">{credit.interest_rate}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Mois restants</span>
          </div>
          <p className="text-gray-900 font-bold text-lg">{credit.remaining_months}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Date de début</span>
          </div>
          <p className="text-gray-900 font-bold text-sm">{formatShortDate(credit.start_date)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigateTo('new-request')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Demande de renseignement
        </button>
        <button
          onClick={() => navigateTo('new-request')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Demande de décompte
        </button>
      </div>

      <MensualitesTable creditId={credit.id} />

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <p className="text-orange-800 text-xs leading-relaxed">
          <strong>Information :</strong> Les montants et échéances affichés sont donnés à titre indicatif
          et ne tiennent pas compte des éventuels retards de paiement ou d'une mauvaise gestion de la part
          des utilisateurs. Pour toute information précise, veuillez contacter notre service client.
        </p>
      </div>
    </div>
  );
}
