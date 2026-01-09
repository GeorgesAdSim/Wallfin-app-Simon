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

  const handleClick = () => {
    navigateTo('credit-detail', credit.id);
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="w-full bg-gray-900 rounded-2xl p-4 text-left hover:bg-gray-800 transition-colors group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{creditTypeLabels[credit.type]}</p>
              <p className="text-gray-500 text-xs">{credit.reference}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Mensualité</span>
            <span className="text-white font-semibold">{formatCurrency(credit.monthly_payment)}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{credit.remaining_months} mois restants</span>
            <span className="text-orange-400">{progress.toFixed(0)}% remboursé</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-gray-900 rounded-2xl p-5 text-left hover:bg-gray-800 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{creditTypeLabels[credit.type]}</p>
            <p className="text-gray-500 text-sm">{credit.reference}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-500 text-xs mb-1">Montant emprunté</p>
          <p className="text-white font-semibold">{formatCurrency(credit.total_amount)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Reste à payer</p>
          <p className="text-white font-semibold">{formatCurrency(credit.remaining_amount)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Mensualité</p>
          <p className="text-orange-400 font-semibold">{formatCurrency(credit.monthly_payment)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">Mois restants</p>
          <p className="text-white font-semibold">{credit.remaining_months} mois</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progression</span>
          <span className="text-orange-400 font-medium">{formatCurrency(paidAmount)} remboursés</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs text-right">{progress.toFixed(1)}% du capital remboursé</p>
      </div>
    </button>
  );
}
