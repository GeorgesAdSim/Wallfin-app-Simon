import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, Square, User, Bell, Info } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

export function SimpleDashboard() {
  const { client, credits, navigateTo, isDemo } = useApp();

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
    window.open('https://www.wallfin.be/contact/', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isDemo && (
        <div className="bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium">
          <Info className="inline w-4 h-4 mr-2" />
          Mode démonstration - Données fictives à titre indicatif
        </div>
      )}

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 rounded-lg p-2">
              <Square className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">Wallfin</div>
              <div className="text-xs text-slate-600">Espace Client</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-slate-900 relative">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateTo('profile')}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{client.first_name}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          Bonjour, {client.first_name} {client.last_name}
        </h1>

        <div className="bg-slate-800 rounded-xl p-6 mb-6 text-white">
          <div className="mb-2" style={{ fontSize: '14px', color: '#94A3B8' }}>Total restant a rembourser</div>
          <div className="text-4xl font-bold mb-4">{formatAmount(totalRestantDu)}</div>

          <div className="h-px bg-slate-700 my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1" style={{ fontSize: '14px', color: '#94A3B8' }}>Mensualites totales</div>
              <div className="text-xl font-semibold">{formatAmount(totalMensualites)}</div>
            </div>
            <div>
              <div className="mb-1" style={{ fontSize: '14px', color: '#94A3B8' }}>Deja rembourse</div>
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

          <div className="space-y-4">
            {credits.map((credit) => (
              <button
                key={credit.id}
                onClick={() => navigateTo('credit-detail', credit.id)}
                className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-between transition-colors text-left"
                style={{ padding: '20px' }}
              >
                <div className="flex items-center gap-4">
                  <div style={{ fontSize: '32px' }}>{creditTypeIcons[credit.type] || '💰'}</div>
                  <div>
                    <div className="text-white font-semibold mb-1" style={{ fontSize: '16px' }}>{credit.type}</div>
                    <div style={{ fontSize: '14px', color: '#94A3B8' }}>{credit.reference_number}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 py-6 border-t border-slate-200 text-center text-sm text-slate-600">
        © 2025 Wallfin - Courtier en crédit | +32 4 228 19 42 | wallfin.be
      </div>
    </div>
  );
}
