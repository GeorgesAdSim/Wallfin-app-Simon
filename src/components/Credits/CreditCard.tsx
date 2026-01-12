import { Car, Home, Wallet, Wrench, Plane, ChevronRight } from 'lucide-react';
import type { Credit } from '../../types';
import { formatCurrency, calculateProgress } from '../../utils/format';
import { useApp } from '../../context/AppContext';

interface CreditCardProps {
  credit: Credit;
  compact?: boolean;
}

const iconMap: Record<string, typeof Car> = {
  'Crédit Auto': Car,
  'Prêt Travaux': Wrench,
  'Crédit Énergie': Home,
  'Prêt Personnel': Wallet,
  'Prêt Vacances': Plane,
};

export function CreditCard({ credit, compact = false }: CreditCardProps) {
  const { navigateTo } = useApp();
  const Icon = iconMap[credit.type] || Wallet;
  const progress = calculateProgress(credit.montant_initial, credit.restant_du);
  const paidAmount = credit.montant_initial - credit.restant_du;

  const handleClick = () => {
    navigateTo('credit-detail', credit.id);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        aria-label={`Voir le detail du ${credit.type}, reference ${credit.reference_number}`}
        className="w-full bg-gray-900 rounded-2xl text-left hover:bg-gray-800 transition-colors group min-h-[120px]"
        style={{ padding: '20px' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-medium" style={{ fontSize: '14px' }}>{credit.type}</p>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>{credit.reference_number}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-gray-300">Mensualite</span>
            <span className="text-white font-semibold">{formatCurrency(credit.mensualite)}</span>
          </div>
          <div
            className="h-2 bg-gray-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress.toFixed(0)} pourcent rembourse`}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span style={{ color: '#94A3B8' }}>{credit.echeances_restantes} mois restants</span>
            <span className="text-orange-400 font-medium">{progress.toFixed(0)}% rembourse</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`Voir le detail du ${credit.type}, reference ${credit.reference_number}`}
      className="w-full bg-gray-900 rounded-2xl text-left hover:bg-gray-800 transition-colors group min-h-[200px]"
      style={{ padding: '20px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-orange-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-white font-semibold" style={{ fontSize: '16px' }}>{credit.type}</p>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>{credit.reference_number}</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-300 font-medium mb-1" style={{ fontSize: '14px' }}>Montant emprunte</p>
          <p className="text-white font-semibold">{formatCurrency(credit.montant_initial)}</p>
        </div>
        <div>
          <p className="text-gray-300 font-medium mb-1" style={{ fontSize: '14px' }}>Reste a payer</p>
          <p className="text-white font-semibold">{formatCurrency(credit.restant_du)}</p>
        </div>
        <div>
          <p className="text-gray-300 font-medium mb-1" style={{ fontSize: '14px' }}>Mensualite</p>
          <p className="text-orange-400 font-semibold">{formatCurrency(credit.mensualite)}</p>
        </div>
        <div>
          <p className="text-gray-300 font-medium mb-1" style={{ fontSize: '14px' }}>Mois restants</p>
          <p className="text-white font-semibold">{credit.echeances_restantes} mois</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between" style={{ fontSize: '14px' }}>
          <span className="text-gray-300">Progression</span>
          <span className="text-orange-400 font-medium">{formatCurrency(paidAmount)} rembourses</span>
        </div>
        <div
          className="h-3 bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress.toFixed(1)} pourcent du capital rembourse`}
        >
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right" style={{ fontSize: '14px', color: '#94A3B8' }}>{progress.toFixed(1)}% du capital rembourse</p>
      </div>
    </button>
  );
}
