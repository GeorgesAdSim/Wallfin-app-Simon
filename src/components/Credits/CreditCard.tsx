import { Car, Home, Wallet, Wrench, ShoppingBag, ChevronRight } from 'lucide-react';
import type { Credit } from '../../types';
import { formatCurrency, calculateProgress } from '../../utils/format';
import { creditTypeLabels } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface CreditCardProps {
  credit: Credit;
  compact?: boolean;
}

const iconMap = {
  personnel: Wallet,
  auto: Car,
  immobilier: Home,
  travaux: Wrench,
  consommation: ShoppingBag,
};

export function CreditCard({ credit, compact = false }: CreditCardProps) {
  const { navigateTo } = useApp();
  const Icon = iconMap[credit.type];
  const progress = calculateProgress(credit.total_amount, credit.remaining_amount);
  const paidAmount = credit.total_amount - credit.remaining_amount;
  const creditLabel = creditTypeLabels[credit.type];

  const handleClick = () => {
    navigateTo('credit-detail', credit.id);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        aria-label={`Voir le detail du ${creditLabel}, reference ${credit.reference}`}
        className="w-full bg-gray-900 rounded-2xl p-4 text-left hover:bg-gray-800 transition-colors group min-h-[120px]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
              <Icon className="w-7 h-7 text-orange-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{creditLabel}</p>
              <p className="text-gray-400 text-sm">{credit.reference}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Mensualite</span>
            <span className="text-white font-semibold">{formatCurrency(credit.monthly_payment)}</span>
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{credit.remaining_months} mois restants</span>
            <span className="text-orange-400 font-medium">{progress.toFixed(0)}% rembourse</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={`Voir le detail du ${creditLabel}, reference ${credit.reference}`}
      className="w-full bg-gray-900 rounded-2xl p-5 text-left hover:bg-gray-800 transition-colors group min-h-[200px]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-orange-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">{creditLabel}</p>
            <p className="text-gray-400 text-sm">{credit.reference}</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">Montant emprunte</p>
          <p className="text-white font-semibold">{formatCurrency(credit.total_amount)}</p>
        </div>
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">Reste a payer</p>
          <p className="text-white font-semibold">{formatCurrency(credit.remaining_amount)}</p>
        </div>
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">Mensualite</p>
          <p className="text-orange-400 font-semibold">{formatCurrency(credit.monthly_payment)}</p>
        </div>
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">Mois restants</p>
          <p className="text-white font-semibold">{credit.remaining_months} mois</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
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
        <p className="text-gray-400 text-sm text-right">{progress.toFixed(1)}% du capital rembourse</p>
      </div>
    </button>
  );
}
