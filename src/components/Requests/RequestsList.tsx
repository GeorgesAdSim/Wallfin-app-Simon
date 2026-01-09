import { Plus, Clock, CheckCircle, Loader, XCircle, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatCurrency } from '../../utils/format';
import { creditTypeLabels } from '../../data/mockData';

const creditRequestStatusConfig = {
  pending: { icon: Clock, label: 'En attente', className: 'text-yellow-600 bg-yellow-50' },
  in_review: { icon: Loader, label: 'En cours d\'etude', className: 'text-blue-600 bg-blue-50' },
  approved: { icon: CheckCircle, label: 'Acceptee', className: 'text-green-600 bg-green-50' },
  rejected: { icon: XCircle, label: 'Refusee', className: 'text-red-600 bg-red-50' },
};

export function RequestsList() {
  const { creditRequests, navigateTo } = useApp();

  const totalRequests = creditRequests.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes Demandes</h2>
          <p className="text-sm text-gray-500">{totalRequests} demande{totalRequests > 1 ? 's' : ''} de credit</p>
        </div>
        <button
          onClick={() => navigateTo('new-credit')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvelle
        </button>
      </div>

      {totalRequests === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">Aucune demande de credit en cours</p>
          <button
            onClick={() => navigateTo('new-credit')}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            Faire une demande
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {creditRequests.map((request) => {
            const config = creditRequestStatusConfig[request.status];
            const Icon = config.icon;

            return (
              <div key={request.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {request.requestNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {creditTypeLabels[request.creditType] || request.creditType}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${config.className}`}>
                    <Icon className="w-3 h-3" />
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Montant</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(request.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duree</p>
                    <p className="font-semibold text-gray-900">{request.durationMonths} mois</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mensualite</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(request.calculatedMonthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TAEG</p>
                    <p className="font-semibold text-gray-900">{request.calculatedTaeg}%</p>
                  </div>
                </div>

                <div className={`rounded-lg p-2 mb-3 ${
                  request.feasibilityStatus === 'OK' ? 'bg-green-50' :
                  request.feasibilityStatus === 'LIMIT' ? 'bg-yellow-50' :
                  'bg-red-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    request.feasibilityStatus === 'OK' ? 'text-green-700' :
                    request.feasibilityStatus === 'LIMIT' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    Taux d'endettement: {request.calculatedDebtRatio.toFixed(1)}% |
                    Reste a vivre: {formatCurrency(request.calculatedRemainingIncome)}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  Demande du {formatDate(request.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
