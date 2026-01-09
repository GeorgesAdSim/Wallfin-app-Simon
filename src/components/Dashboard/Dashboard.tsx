import { TrendingUp, Wallet, Calendar, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/format';
import { CreditCard } from '../Credits/CreditCard';

export function Dashboard() {
  const { client, credits, isDemo, navigateTo } = useApp();

  const totalRemaining = credits.reduce((sum, c) => sum + c.remaining_amount, 0);
  const totalMonthlyPayment = credits.reduce((sum, c) => sum + c.monthly_payment, 0);
  const totalPaid = credits.reduce((sum, c) => sum + (c.total_amount - c.remaining_amount), 0);

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-orange-800 text-xs text-center">
            Mode demonstration - Donnees fictives a titre indicatif
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Bonjour,</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {client?.first_name} {client?.last_name}
          </h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-orange-400" />
          <span className="text-sm text-gray-400">Total restant a rembourser</span>
        </div>
        <p className="text-3xl font-bold mb-4">{formatCurrency(totalRemaining)}</p>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Mensualites totales</span>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(totalMonthlyPayment)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Deja rembourse</span>
            </div>
            <p className="text-lg font-semibold text-green-400">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigateTo('new-credit')}
          className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-orange-200 hover:bg-orange-50 transition-all group"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
            <Plus className="w-5 h-5 text-orange-600" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Nouveau credit</p>
          <p className="text-xs text-gray-500 mt-1">Faire une demande</p>
        </button>
        <button
          onClick={() => navigateTo('requests')}
          className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-orange-200 hover:bg-orange-50 transition-all group"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Mes demandes</p>
          <p className="text-xs text-gray-500 mt-1">Suivre mes requetes</p>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Mes credits en cours</h2>
          <button
            onClick={() => navigateTo('credits')}
            className="text-sm text-orange-600 font-medium hover:text-orange-700"
          >
            Voir tout
          </button>
        </div>

        <div className="space-y-3">
          {credits.slice(0, 2).map((credit) => (
            <CreditCard key={credit.id} credit={credit} compact />
          ))}
        </div>

        {credits.length > 2 && (
          <button
            onClick={() => navigateTo('credits')}
            className="w-full mt-3 py-3 text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            + {credits.length - 2} autre{credits.length - 2 > 1 ? 's' : ''} credit{credits.length - 2 > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
