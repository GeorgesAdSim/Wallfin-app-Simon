import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, ChevronDown, Send, Loader2, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { creditTypeIcons } from '../../data/mockData';

interface EarlyRepaymentState {
  creditId: string;
  type: 'total' | 'partial';
  amount: string;
  comment: string;
  amountError: string;
  isLoading: boolean;
  showSuccess: boolean;
  showError: boolean;
}

export function Credits() {
  const { client, credits, navigateTo } = useApp();
  const [selectedCreditId, setSelectedCreditId] = useState('');
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [comment, setComment] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [expandedCreditId, setExpandedCreditId] = useState<string | null>(null);
  const [earlyRepayment, setEarlyRepayment] = useState<EarlyRepaymentState>({
    creditId: '',
    type: 'total',
    amount: '',
    comment: '',
    amountError: '',
    isLoading: false,
    showSuccess: false,
    showError: false,
  });

  if (!client) return null;

  const calculatePercentage = (dejaRembourse: number, restantDu: number) => {
    const total = dejaRembourse + restantDu;
    if (total === 0) return 0;
    return Math.round((dejaRembourse / total) * 100);
  };

  const handleNewCredit = () => {
    window.open('https://www.wallfin.be/', '_blank');
  };

  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) {
      setAmountError('Veuillez entrer un montant');
      return false;
    }
    if (num < 500) {
      setAmountError('Le montant minimum est de 500 EUR');
      return false;
    }
    if (num > 50000) {
      setAmountError('Le montant maximum est de 50 000 EUR');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAdditionalMoneyRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount(additionalAmount)) return;
    if (!selectedCreditId) return;

    const selectedCredit = credits.find(c => c.id === selectedCreditId);
    if (!selectedCredit) return;

    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-additional-money-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditType: selectedCredit.type,
          creditReference: selectedCredit.reference_number,
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
          amount: parseFloat(additionalAmount),
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      setShowSuccess(true);
      setSelectedCreditId('');
      setAdditionalAmount('');
      setComment('');
      setAmountError('');

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending request:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEarlyRepayment = (creditId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedCreditId === creditId) {
      setExpandedCreditId(null);
      setEarlyRepayment({
        creditId: '',
        type: 'total',
        amount: '',
        comment: '',
        amountError: '',
        isLoading: false,
        showSuccess: false,
        showError: false,
      });
    } else {
      setExpandedCreditId(creditId);
      setEarlyRepayment({
        creditId,
        type: 'total',
        amount: '',
        comment: '',
        amountError: '',
        isLoading: false,
        showSuccess: false,
        showError: false,
      });
    }
  };

  const validateEarlyRepaymentAmount = (value: string, maxAmount: number): boolean => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) {
      setEarlyRepayment(prev => ({ ...prev, amountError: 'Veuillez entrer un montant' }));
      return false;
    }
    if (num < 100) {
      setEarlyRepayment(prev => ({ ...prev, amountError: 'Le montant minimum est de 100 EUR' }));
      return false;
    }
    if (num > maxAmount) {
      setEarlyRepayment(prev => ({ ...prev, amountError: `Le montant ne peut pas depasser ${maxAmount.toLocaleString('fr-BE')} EUR` }));
      return false;
    }
    setEarlyRepayment(prev => ({ ...prev, amountError: '' }));
    return true;
  };

  const handleEarlyRepaymentRequest = async (e: React.FormEvent, credit: typeof credits[0]) => {
    e.preventDefault();
    e.stopPropagation();

    if (earlyRepayment.type === 'partial' && !validateEarlyRepaymentAmount(earlyRepayment.amount, credit.restant_du)) {
      return;
    }

    setEarlyRepayment(prev => ({ ...prev, isLoading: true, showSuccess: false, showError: false }));

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-early-repayment-request`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditType: credit.type,
          creditReference: credit.reference_number,
          clientName: `${client.first_name} ${client.last_name}`,
          clientEmail: client.email,
          repaymentType: earlyRepayment.type,
          amount: earlyRepayment.type === 'partial' ? parseFloat(earlyRepayment.amount) : credit.restant_du,
          remainingBalance: credit.restant_du,
          comment: earlyRepayment.comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      setEarlyRepayment(prev => ({
        ...prev,
        showSuccess: true,
        isLoading: false,
        type: 'total',
        amount: '',
        comment: '',
        amountError: '',
      }));

      setTimeout(() => {
        setEarlyRepayment(prev => ({ ...prev, showSuccess: false }));
        setExpandedCreditId(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending request:', error);
      setEarlyRepayment(prev => ({ ...prev, showError: true, isLoading: false }));
      setTimeout(() => setEarlyRepayment(prev => ({ ...prev, showError: false })), 5000);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-[#F57C00] px-4 py-3 mb-6">
        <p className="text-white text-sm text-center font-medium">
          Mode démonstration - Données fictives à titre indicatif uniquement
        </p>
      </div>

      <div className="px-4">
        <h1 className="text-2xl font-bold text-[#333] mb-6">
          Bonjour, {client.first_name} {client.last_name}
        </h1>

        <button
          onClick={handleNewCredit}
          className="w-full bg-[#F57C00] hover:bg-[#E67100] text-white rounded-xl p-4 flex items-center justify-center gap-3 mb-8 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Nouveau crédit</div>
            <div className="text-sm opacity-90">Faire une demande</div>
          </div>
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#333]">Mes crédits en cours</h2>
          {credits.length > 3 && (
            <button className="text-sm text-[#F57C00] hover:text-[#E67100] font-medium">
              Voir tout
            </button>
          )}
        </div>

        <div className="space-y-3">
          {credits.map((credit) => {
            const percentage = calculatePercentage(credit.deja_rembourse, credit.restant_du);
            const isExpanded = expandedCreditId === credit.id;

            return (
              <div key={credit.id} className="bg-[#1a2332] rounded-2xl overflow-hidden">
                <button
                  onClick={() => navigateTo('credit-detail', credit.id)}
                  className="w-full hover:bg-[#1e2838] p-4 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-3xl flex-shrink-0">{creditTypeIcons[credit.type] || ''}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold mb-1">{credit.type}</div>
                      <div className="text-sm text-slate-400 mb-2">{credit.reference_number}</div>
                      <div className="font-semibold mb-2 text-[#F57C00] text-xs">
                        {percentage}% remboursé
                      </div>
                      <div className="w-full h-2 rounded overflow-hidden bg-gray-700">
                        <div
                          className="h-full rounded transition-all duration-500 ease-out bg-[#F57C00]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white flex-shrink-0 ml-3" />
                </button>

                <div className="px-4 pb-3">
                  <button
                    onClick={(e) => toggleEarlyRepayment(credit.id, e)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-[#242f3f] hover:bg-[#2a3644] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 text-[#F57C00]" />
                      <span className="text-sm text-slate-300">Remboursement anticipé</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 bg-slate-700/30 rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
                      {earlyRepayment.showSuccess && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-3 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-green-300 text-sm">Demande envoyee avec succes</div>
                        </div>
                      )}

                      {earlyRepayment.showError && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3 flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="text-red-300 text-sm">Erreur, veuillez reessayer</div>
                        </div>
                      )}

                      <form onSubmit={(e) => handleEarlyRepaymentRequest(e, credit)} className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Restant du:</span>
                          <span className="text-white font-semibold">{credit.restant_du.toLocaleString('fr-BE')} EUR</span>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-2">Type de remboursement</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEarlyRepayment(prev => ({ ...prev, type: 'total', amount: '', amountError: '' }))}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                earlyRepayment.type === 'total'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              Total
                            </button>
                            <button
                              type="button"
                              onClick={() => setEarlyRepayment(prev => ({ ...prev, type: 'partial' }))}
                              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                earlyRepayment.type === 'partial'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              }`}
                            >
                              Partiel
                            </button>
                          </div>
                        </div>

                        {earlyRepayment.type === 'partial' && (
                          <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Montant a rembourser</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={earlyRepayment.amount}
                                onChange={(e) => setEarlyRepayment(prev => ({ ...prev, amount: e.target.value, amountError: '' }))}
                                placeholder={`Max: ${credit.restant_du.toLocaleString('fr-BE')}`}
                                min="100"
                                max={credit.restant_du}
                                className={`w-full px-3 pr-12 py-2.5 rounded-lg bg-slate-600 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                  earlyRepayment.amountError ? 'border-red-400' : 'border-slate-500'
                                }`}
                                style={{ fontSize: '14px' }}
                                required
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">EUR</span>
                            </div>
                            {earlyRepayment.amountError && <p className="mt-1 text-xs text-red-400">{earlyRepayment.amountError}</p>}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5">Commentaire (facultatif)</label>
                          <textarea
                            value={earlyRepayment.comment}
                            onChange={(e) => setEarlyRepayment(prev => ({ ...prev, comment: e.target.value.slice(0, 200) }))}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            placeholder="Precisions..."
                            style={{ fontSize: '14px' }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={earlyRepayment.isLoading}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          {earlyRepayment.isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Envoyer la demande
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
