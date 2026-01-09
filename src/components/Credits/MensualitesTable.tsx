import { Check, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate } from '../../utils/format';
import type { MensualiteStatus } from '../../types';

interface MensualitesTableProps {
  creditId: string;
}

const statusConfig: Record<MensualiteStatus, { icon: typeof Check; label: string; className: string }> = {
  paid: { icon: Check, label: 'Payée', className: 'text-green-600 bg-green-50' },
  pending: { icon: Clock, label: 'En attente', className: 'text-orange-600 bg-orange-50' },
  overdue: { icon: AlertCircle, label: 'En retard', className: 'text-red-600 bg-red-50' },
};

export function MensualitesTable({ creditId }: MensualitesTableProps) {
  const { getMensualitesForCredit } = useApp();
  const mensualites = getMensualitesForCredit(creditId);

  const recentMensualites = mensualites.slice(0, 12);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Échéancier des mensualités</h3>
        <p className="text-xs text-gray-500 mt-1">12 premières échéances affichées</p>
      </div>

      <div className="divide-y divide-gray-50">
        {recentMensualites.map((mensualite) => {
          const config = statusConfig[mensualite.status];
          const Icon = config.icon;

          return (
            <div key={mensualite.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.className}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Échéance n°{mensualite.month_number}</p>
                  <p className="text-xs text-gray-500">{formatShortDate(mensualite.due_date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(mensualite.amount)}</p>
                <p className="text-xs text-gray-500">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {mensualites.length > 12 && (
        <div className="px-4 py-3 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">
            + {mensualites.length - 12} autres échéances
          </p>
        </div>
      )}
    </div>
  );
}
