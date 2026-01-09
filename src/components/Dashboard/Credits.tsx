import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function Credits() {
  const { client, credits, navigateTo } = useApp();

  if (!client) return null;

  const totalRestantDu = credits.reduce((sum, c) => sum + c.restant_du, 0);
  const totalMensualites = credits.reduce((sum, c) => sum + c.mensualite, 0);
  const totalDejaRembourse = credits.reduce((sum, c) => sum + c.deja_rembourse, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleNewCredit = () => {
    window.open('https://www.wallfin.be/', '_blank');
  };

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Bonjour, {client.first_name} {client.last_name}
      </h1>

      <div className="bg-slate-800 rounded-xl p-6 mb-6 text-white">
        <div className="text-sm text-slate-400 mb-2">Total restant à rembourser</div>
        <div className="text-4xl font-bold mb-4">{formatAmount(totalRestantDu)}</div>

        <div className="h-px bg-slate-700 my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Mensualités totales</div>
            <div className="text-xl font-semibold">{formatAmount(totalMensualites)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Déjà remboursé</div>
            <div className="text-xl font-semibold text-green-400">{formatAmount(totalDejaRembourse)}</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleNewCredit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 mb-8 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <div className="text-left">
          <div className="font-semibold">Nouveau crédit</div>
          <div className="text-sm opacity-90">Faire une demande</div>
        </div>
      </button>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Mes crédits en cours</h2>
          {credits.length > 3 && (
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Voir tout
            </button>
          )}
        </div>

        <div className="space-y-3">
          {credits.map((credit) => (
            <button
              key={credit.id}
              onClick={() => navigateTo('credit-detail', credit.id)}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-4 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{creditTypeIcons[credit.type] || '💰'}</div>
                <div>
                  <div className="text-white font-semibold mb-1">{credit.type}</div>
                  <div className="text-sm text-slate-400">{credit.reference_number}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
