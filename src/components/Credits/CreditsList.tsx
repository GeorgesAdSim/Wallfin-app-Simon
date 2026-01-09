import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreditCard } from './CreditCard';

export function CreditsList() {
  const { credits, navigateTo } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes Crédits</h2>
          <p className="text-sm text-gray-500">{credits.length} crédit{credits.length > 1 ? 's' : ''} en cours</p>
        </div>
        <button
          onClick={() => navigateTo('new-request')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau
        </button>
      </div>

      <div className="space-y-4">
        {credits.map((credit) => (
          <CreditCard key={credit.id} credit={credit} />
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <p className="text-orange-800 text-xs leading-relaxed">
          <strong>Information :</strong> Les montants affichés sont donnés à titre indicatif et ne tiennent
          pas compte des éventuels retards de paiement ou modifications de votre dossier.
        </p>
      </div>
    </div>
  );
}
