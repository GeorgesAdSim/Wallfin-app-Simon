import { AlertCircle } from 'lucide-react';
import type { CreditRequestFormData } from '../../types';
import {
  CREDIT_TYPES,
  EMPLOYMENT_STATUSES,
  FAMILY_STATUSES,
  HOUSEHOLD_SIZES,
  getAvailableDurations,
  calculerMensualite,
  validerDemande,
  RESTE_A_VIVRE_MIN
} from '../../utils/calculations';
import { formatCurrency } from '../../utils/format';

interface StepProps {
  formData: CreditRequestFormData;
  updateFormData: (data: Partial<CreditRequestFormData>) => void;
  errors: Record<string, string>;
}

export function StepProject({ formData, updateFormData, errors }: StepProps) {
  const availableDurations = getAvailableDurations(formData.amount || 5001);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Votre projet</h3>
        <p className="text-sm text-gray-500">Decrivez le credit que vous souhaitez obtenir</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de credit <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.creditType}
            onChange={(e) => updateFormData({ creditType: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.creditType ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
          >
            <option value="">Selectionnez un type</option>
            {CREDIT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.creditType && (
            <p className="text-red-500 text-xs mt-1">{errors.creditType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant souhaite <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={5001}
              max={100000}
              step={100}
              value={formData.amount || ''}
              onChange={(e) => {
                const amount = parseInt(e.target.value) || 0;
                const durations = getAvailableDurations(amount);
                const updates: Partial<CreditRequestFormData> = { amount };
                if (!durations.includes(formData.durationMonths)) {
                  updates.durationMonths = durations[0] || 24;
                }
                updateFormData(updates);
              }}
              placeholder="Ex: 15000"
              className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                errors.amount ? 'border-red-500' : 'border-gray-200'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Min: 5.001 EUR - Max: 100.000 EUR</p>
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duree souhaitee <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.durationMonths}
            onChange={(e) => updateFormData({ durationMonths: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.durationMonths ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
            disabled={availableDurations.length === 0}
          >
            {availableDurations.map((duration) => (
              <option key={duration} value={duration}>
                {duration} mois ({Math.round(duration / 12 * 10) / 10} ans)
              </option>
            ))}
          </select>
          {errors.durationMonths && (
            <p className="text-red-500 text-xs mt-1">{errors.durationMonths}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du projet (optionnel)
          </label>
          <textarea
            value={formData.projectDescription}
            onChange={(e) => updateFormData({ projectDescription: e.target.value })}
            placeholder="Decrivez votre projet..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export function StepSituation({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Votre situation</h3>
        <p className="text-sm text-gray-500">Informations sur votre situation professionnelle et familiale</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Situation professionnelle <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.employmentStatus}
            onChange={(e) => updateFormData({ employmentStatus: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.employmentStatus ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
          >
            <option value="">Selectionnez</option>
            {EMPLOYMENT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.employmentStatus && (
            <p className="text-red-500 text-xs mt-1">{errors.employmentStatus}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Revenu net mensuel <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={100}
              value={formData.monthlyIncome || ''}
              onChange={(e) => updateFormData({ monthlyIncome: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 2500"
              className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                errors.monthlyIncome ? 'border-red-500' : 'border-gray-200'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
          </div>
          {errors.monthlyIncome && (
            <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Situation familiale <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.familyStatus}
            onChange={(e) => updateFormData({ familyStatus: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.familyStatus ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
          >
            <option value="">Selectionnez</option>
            {FAMILY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.familyStatus && (
            <p className="text-red-500 text-xs mt-1">{errors.familyStatus}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de personnes dans le foyer <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.householdSize}
            onChange={(e) => updateFormData({ householdSize: parseInt(e.target.value) })}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.householdSize ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
          >
            {HOUSEHOLD_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.householdSize && (
            <p className="text-red-500 text-xs mt-1">{errors.householdSize}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StepCharges({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Vos charges actuelles</h3>
        <p className="text-sm text-gray-500">Indiquez vos charges mensuelles actuelles</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loyer / Hypotheque mensuel
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={50}
              value={formData.rentMortgage || ''}
              onChange={(e) => updateFormData({ rentMortgage: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credits en cours (mensualites totales)
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={50}
              value={formData.currentCredits || ''}
              onChange={(e) => updateFormData({ currentCredits: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Autres charges fixes mensuelles
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={50}
              value={formData.otherCharges || ''}
              onChange={(e) => updateFormData({ otherCharges: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">EUR</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <strong>Total des charges actuelles :</strong>{' '}
            {formatCurrency(formData.rentMortgage + formData.currentCredits + formData.otherCharges)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StepVerifications({ formData, updateFormData, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Verifications</h3>
        <p className="text-sm text-gray-500">Confirmez les informations suivantes</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-orange-200 transition-colors">
          <input
            type="checkbox"
            checked={formData.isBelgianResident}
            onChange={(e) => updateFormData({ isBelgianResident: e.target.checked })}
            className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <p className="font-medium text-gray-900">Je suis resident(e) belge</p>
            <p className="text-sm text-gray-500">Je confirme resider en Belgique</p>
          </div>
        </label>
        {errors.isBelgianResident && (
          <p className="text-red-500 text-xs">{errors.isBelgianResident}</p>
        )}

        <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-orange-200 transition-colors">
          <input
            type="checkbox"
            checked={formData.isNotBnbListed}
            onChange={(e) => updateFormData({ isNotBnbListed: e.target.checked })}
            className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <p className="font-medium text-gray-900">Je ne suis pas fiche(e) a la BNB</p>
            <p className="text-sm text-gray-500">Je declare ne pas etre inscrit(e) au fichier de la Banque Nationale de Belgique</p>
          </div>
        </label>
        {errors.isNotBnbListed && (
          <p className="text-red-500 text-xs">{errors.isNotBnbListed}</p>
        )}

        <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-orange-200 transition-colors">
          <input
            type="checkbox"
            checked={formData.acceptsDataProcessing}
            onChange={(e) => updateFormData({ acceptsDataProcessing: e.target.checked })}
            className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <p className="font-medium text-gray-900">J'accepte le traitement de mes donnees</p>
            <p className="text-sm text-gray-500">J'accepte que mes donnees soient utilisees pour traiter ma demande de credit</p>
          </div>
        </label>
        {errors.acceptsDataProcessing && (
          <p className="text-red-500 text-xs">{errors.acceptsDataProcessing}</p>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-orange-700 text-xs leading-relaxed">
          Un credit vous engage et doit etre rembourse. Verifiez vos capacites de remboursement avant de vous engager.
        </p>
      </div>
    </div>
  );
}

export function StepRecap({ formData }: { formData: CreditRequestFormData }) {
  const calculation = calculerMensualite(formData.amount, formData.durationMonths);
  const charges = formData.rentMortgage + formData.currentCredits + formData.otherCharges;
  const validation = calculation
    ? validerDemande(
        formData.monthlyIncome,
        charges,
        calculation.mensualite,
        formData.householdSize
      )
    : null;

  const getCreditTypeLabel = () =>
    CREDIT_TYPES.find((t) => t.value === formData.creditType)?.label || formData.creditType;

  const getEmploymentLabel = () =>
    EMPLOYMENT_STATUSES.find((s) => s.value === formData.employmentStatus)?.label || formData.employmentStatus;

  const getFamilyLabel = () =>
    FAMILY_STATUSES.find((s) => s.value === formData.familyStatus)?.label || formData.familyStatus;

  const getStatusIcon = () => {
    if (!validation) return null;
    if (validation.status === 'OK') return { icon: 'check', color: 'green', text: 'Faisable' };
    if (validation.status === 'LIMIT') return { icon: 'alert', color: 'yellow', text: 'Limite' };
    return { icon: 'x', color: 'red', text: 'Non faisable' };
  };

  const statusInfo = getStatusIcon();
  const minResteAVivre = RESTE_A_VIVRE_MIN[Math.min(formData.householdSize, 4)] || 2600;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Recapitulatif</h3>
        <p className="text-sm text-gray-500">Verifiez vos informations avant envoi</p>
      </div>

      {calculation && validation && (
        <div className={`p-5 rounded-xl border-2 ${
          validation.status === 'OK' ? 'bg-green-50 border-green-200' :
          validation.status === 'LIMIT' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              validation.status === 'OK' ? 'bg-green-500' :
              validation.status === 'LIMIT' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              <span className="text-white text-2xl">
                {validation.status === 'OK' ? '✓' : validation.status === 'LIMIT' ? '!' : '✗'}
              </span>
            </div>
            <div>
              <p className={`font-bold text-lg ${
                validation.status === 'OK' ? 'text-green-700' :
                validation.status === 'LIMIT' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {statusInfo?.text}
              </p>
              <p className="text-sm text-gray-600">
                {validation.status === 'DEBT_HIGH' && 'Taux d\'endettement trop eleve (> 33%)'}
                {validation.status === 'INCOME_LOW' && `Reste a vivre insuffisant (min ${formatCurrency(minResteAVivre)})`}
                {validation.status === 'LIMIT' && 'Votre dossier sera etudie au cas par cas'}
                {validation.status === 'OK' && 'Votre demande respecte tous les criteres'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Mensualite estimee</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(calculation.mensualite)}</p>
              <p className="text-xs text-gray-500">TAEG: {calculation.taeg}%</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Taux d'endettement</p>
              <p className={`text-xl font-bold ${validation.tauxEndettement > 33 ? 'text-red-600' : 'text-gray-900'}`}>
                {validation.tauxEndettement.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Max recommande: 33%</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3 col-span-2">
              <p className="text-xs text-gray-500 mb-1">Reste a vivre</p>
              <p className={`text-xl font-bold ${validation.resteAVivre < minResteAVivre ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(validation.resteAVivre)}
              </p>
              <p className="text-xs text-gray-500">Min requis: {formatCurrency(minResteAVivre)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Projet</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-medium">{getCreditTypeLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Montant</span>
              <span className="font-medium">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duree</span>
              <span className="font-medium">{formData.durationMonths} mois</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Situation</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Emploi</span>
              <span className="font-medium">{getEmploymentLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenus</span>
              <span className="font-medium">{formatCurrency(formData.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Famille</span>
              <span className="font-medium">{getFamilyLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Foyer</span>
              <span className="font-medium">{formData.householdSize} personne(s)</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Charges</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Loyer/Hypotheque</span>
              <span className="font-medium">{formatCurrency(formData.rentMortgage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credits actuels</span>
              <span className="font-medium">{formatCurrency(formData.currentCredits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Autres charges</span>
              <span className="font-medium">{formatCurrency(formData.otherCharges)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
