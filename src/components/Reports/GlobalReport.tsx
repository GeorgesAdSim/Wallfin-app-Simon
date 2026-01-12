import { useApp } from '../../context/AppContext';
import { ArrowLeft, ChevronRight, Calendar, CreditCard, PieChart, TrendingUp } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function GlobalReport() {
  const { credits, navigateTo } = useApp();

  const totalEmprunte = credits.reduce((sum, c) => sum + c.montant_initial, 0);
  const totalRestant = credits.reduce((sum, c) => sum + c.restant_du, 0);
  const totalRembourse = credits.reduce((sum, c) => sum + c.deja_rembourse, 0);
  const mensualitesTotales = credits.reduce((sum, c) => sum + c.mensualite, 0);
  const pourcentageGlobal = totalEmprunte > 0 ? Math.round((totalRembourse / totalEmprunte) * 100) : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getUpcomingPayments = () => {
    const payments: { date: string; credit: typeof credits[0] }[] = [];

    credits.forEach((credit) => {
      const nextDate = new Date(credit.prochaine_echeance);
      payments.push({ date: credit.prochaine_echeance, credit });

      const secondDate = new Date(nextDate);
      secondDate.setMonth(secondDate.getMonth() + 1);
      payments.push({ date: secondDate.toISOString().split('T')[0], credit });
    });

    return payments
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const upcomingPayments = getUpcomingPayments();

  const sortedByEndDate = [...credits].sort(
    (a, b) => new Date(a.date_fin).getTime() - new Date(b.date_fin).getTime()
  );

  return (
    <div className="pb-8">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('credits')}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Rapport global</h1>
              <p className="text-sm text-slate-500">Vue d'ensemble de vos credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold">Resume financier</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total emprunte</span>
              <span className="text-xl font-bold">{formatAmount(totalEmprunte)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total restant a rembourser</span>
              <span className="text-xl font-bold">{formatAmount(totalRestant)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total deja rembourse</span>
              <span className="text-xl font-bold text-green-400">{formatAmount(totalRembourse)}</span>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progression globale</span>
                <span className="text-sm font-semibold text-green-400">{pourcentageGlobal}% rembourse</span>
              </div>
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pourcentageGlobal}%`,
                    background: 'linear-gradient(90deg, #F97316, #FB923C)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Charges mensuelles</h2>
          </div>

          <div className="mb-4 pb-4 border-b border-slate-100">
            <div className="text-sm text-slate-500 mb-1">Mensualites totales</div>
            <div className="text-2xl font-bold text-slate-900">{formatAmount(mensualitesTotales)}/mois</div>
          </div>

          <div className="space-y-3">
            {credits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{creditTypeIcons[credit.type] || ''}</span>
                  <span className="text-slate-700">{credit.type}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatAmount(credit.mensualite)}/mois</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Echeances de vos credits</h2>
          </div>

          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />

            <div className="space-y-6">
              {sortedByEndDate.map((credit, index) => (
                <div key={credit.id} className="relative">
                  <div
                    className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-orange-500"
                    style={{ backgroundColor: index === 0 ? '#F97316' : 'white' }}
                  />
                  <div className="ml-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{creditTypeIcons[credit.type] || ''}</span>
                      <span className="font-semibold text-slate-900">{credit.type}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Fin prevue : {formatDate(credit.date_fin)}
                    </div>
                    <div className="text-sm text-slate-500">
                      Reste {credit.echeances_restantes} mois
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-slate-900">Prochains prelevements</h2>
          </div>

          <div className="space-y-4">
            {upcomingPayments.map((payment, index) => (
              <div key={`${payment.credit.id}-${index}`} className="flex items-start gap-3">
                <div className="text-orange-500 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{formatShortDate(payment.date)}</div>
                  <div className="text-sm text-slate-600">
                    {payment.credit.type} : {formatAmount(payment.credit.mensualite)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Repartition de vos credits</h2>
          </div>

          <div className="space-y-4">
            {credits.map((credit) => {
              const percentage = totalEmprunte > 0
                ? Math.round((credit.montant_initial / totalEmprunte) * 100)
                : 0;
              return (
                <div key={credit.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{creditTypeIcons[credit.type] || ''}</span>
                      <span className="text-slate-700">{credit.type}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {percentage}% ({formatAmount(credit.montant_initial)})
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: credit.type === 'Credit Auto' || credit.type === 'Crédit Auto'
                          ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                          : 'linear-gradient(90deg, #F97316, #FB923C)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Voir le detail</h2>

          <div className="space-y-3">
            {credits.map((credit) => (
              <button
                key={credit.id}
                onClick={() => navigateTo('credit-detail', credit.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{creditTypeIcons[credit.type] || ''}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{credit.type}</div>
                    <div className="text-sm text-slate-500">{credit.reference_number}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-xs leading-relaxed text-center">
            Les montants et dates affiches sont donnes a titre indicatif et peuvent differer des informations contractuelles. Seuls les documents officiels fournis par Wallfin font foi.
          </p>
        </div>
      </div>
    </div>
  );
}
