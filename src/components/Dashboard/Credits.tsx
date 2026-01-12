import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function Credits() {
  const { client, credits, navigateTo } = useApp();

  if (!client) return null;

  const totalRestantDu = credits.reduce((sum, c) => sum + c.restant_du, 0);
  const totalMensualites = credits.reduce((sum, c) => sum + c.mensualite, 0);
  const totalDejaRembourse = credits.reduce((sum, c) => sum + c.deja_rembourse, 0);
  const totalAmount = totalDejaRembourse + totalRestantDu;
  const globalPercentage = totalAmount > 0 ? Math.round((totalDejaRembourse / totalAmount) * 100) : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculatePercentage = (dejaRembourse: number, restantDu: number) => {
    const total = dejaRembourse + restantDu;
    if (total === 0) return 0;
    return Math.round((dejaRembourse / total) * 100);
  };

  const handleNewCredit = () => {
    window.open('https://www.wallfin.be/', '_blank');
  };

  return (
    <div className="pb-20 px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Bonjour, {client.first_name} {client.last_name}
      </h1>

      <button
        onClick={() => navigateTo('global-report')}
        className="w-full bg-slate-800 rounded-xl p-6 mb-6 text-white text-left relative cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
      >
        <div className="pr-8">
          <div className="text-sm text-slate-400 mb-2">Total restant a rembourser</div>
          <div className="text-4xl font-bold mb-4">{formatAmount(totalRestantDu)}</div>

          <div className="h-px bg-slate-700 my-4" />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Mensualites totales</div>
              <div className="text-xl font-semibold">{formatAmount(totalMensualites)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Deja rembourse</div>
              <div className="text-xl font-semibold text-green-400">{formatAmount(totalDejaRembourse)}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progression globale</span>
              <span className="text-sm font-semibold text-green-400">{globalPercentage}% rembourse</span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${globalPercentage}%`,
                  background: 'linear-gradient(90deg, #F97316, #FB923C)',
                }}
              />
            </div>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-white/60 absolute right-5 top-1/2 -translate-y-1/2" />
      </button>

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
    </div>
  );
}
