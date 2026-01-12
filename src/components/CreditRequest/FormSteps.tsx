import { AlertCircle, AlertTriangle } from 'lucide-react';
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
import { useId } from 'react';

interface StepProps {
  formData: CreditRequestFormData;
  updateFormData: (data: Partial<CreditRequestFormData>) => void;
  errors: Record<string, string>;
}

function ErrorMessage({ message, id }: { message: string; id: string }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5 font-medium"
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function StepProject({ formData, updateFormData, errors }: StepProps) {
  const availableDurations = getAvailableDurations(formData.amount || 5001);
  const creditTypeId = useId();
  const amountId = useId();
  const durationId = useId();
  const descriptionId = useId();
  const creditTypeErrorId = useId();
  const amountErrorId = useId();
  const durationErrorId = useId();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Votre projet</h3>
        <p className="text-sm text-slate-600">Decrivez le credit que vous souhaitez obtenir</p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor={creditTypeId} className="block text-sm font-medium text-slate-700 mb-2">
            Type de credit <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <select
            id={creditTypeId}
            value={formData.creditType}
            onChange={(e) => updateFormData({ creditType: e.target.value })}
            aria-invalid={!!errors.creditType}
            aria-describedby={errors.creditType ? creditTypeErrorId : undefined}
            className={`w-full px-4 min-h-[48px] rounded-xl border text-base ${
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
          {errors.creditType && <ErrorMessage message={errors.creditType} id={creditTypeErrorId} />}
        </div>

        <div>
          <label htmlFor={amountId} className="block text-sm font-medium text-slate-700 mb-2">
            Montant souhaite <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <div className="relative">
            <input
              id={amountId}
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
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? amountErrorId : undefined}
              className={`w-full px-4 min-h-[48px] pr-14 rounded-xl border text-base ${
                errors.amount ? 'border-red-500' : 'border-gray-200'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">EUR</span>
          </div>
          <p className="text-sm text-slate-600 mt-1.5">Min: 5.001 EUR - Max: 100.000 EUR</p>
          {errors.amount && <ErrorMessage message={errors.amount} id={amountErrorId} />}
        </div>

        <div>
          <label htmlFor={durationId} className="block text-sm font-medium text-slate-700 mb-2">
            Duree souhaitee <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <select
            id={durationId}
            value={formData.durationMonths}
            onChange={(e) => updateFormData({ durationMonths: parseInt(e.target.value) })}
            aria-invalid={!!errors.durationMonths}
            aria-describedby={errors.durationMonths ? durationErrorId : undefined}
            className={`w-full px-4 min-h-[48px] rounded-xl border text-base ${
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
          {errors.durationMonths && <ErrorMessage message={errors.durationMonths} id={durationErrorId} />}
        </div>

        <div>
          <label htmlFor={descriptionId} className="block text-sm font-medium text-slate-700 mb-2">
            Description du projet (optionnel)
          </label>
          <textarea
            id={descriptionId}
            value={formData.projectDescription}
            onChange={(e) => updateFormData({ projectDescription: e.target.value })}
            placeholder="Decrivez votre projet..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none text-base"
          />
        </div>
      </div>
    </div>
  );
}

export function StepSituation({ formData, updateFormData, errors }: StepProps) {
  const employmentId = useId();
  const incomeId = useId();
  const familyId = useId();
  const householdId = useId();
  const employmentErrorId = useId();
  const incomeErrorId = useId();
  const familyErrorId = useId();
  const householdErrorId = useId();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Votre situation</h3>
        <p className="text-sm text-slate-600">Informations sur votre situation professionnelle et familiale</p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor={employmentId} className="block text-sm font-medium text-slate-700 mb-2">
            Situation professionnelle <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <select
            id={employmentId}
            value={formData.employmentStatus}
            onChange={(e) => updateFormData({ employmentStatus: e.target.value })}
            aria-invalid={!!errors.employmentStatus}
            aria-describedby={errors.employmentStatus ? employmentErrorId : undefined}
            className={`w-full px-4 min-h-[48px] rounded-xl border text-base ${
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
          {errors.employmentStatus && <ErrorMessage message={errors.employmentStatus} id={employmentErrorId} />}
        </div>

        <div>
          <label htmlFor={incomeId} className="block text-sm font-medium text-slate-700 mb-2">
            Revenu net mensuel <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <div className="relative">
            <input
              id={incomeId}
              type="number"
              min={0}
              step={100}
              value={formData.monthlyIncome || ''}
              onChange={(e) => updateFormData({ monthlyIncome: parseInt(e.target.value) || 0 })}
              placeholder="Ex: 2500"
              aria-invalid={!!errors.monthlyIncome}
              aria-describedby={errors.monthlyIncome ? incomeErrorId : undefined}
              className={`w-full px-4 min-h-[48px] pr-14 rounded-xl border text-base ${
                errors.monthlyIncome ? 'border-red-500' : 'border-gray-200'
              } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">EUR</span>
          </div>
          {errors.monthlyIncome && <ErrorMessage message={errors.monthlyIncome} id={incomeErrorId} />}
        </div>

        <div>
          <label htmlFor={familyId} className="block text-sm font-medium text-slate-700 mb-2">
            Situation familiale <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <select
            id={familyId}
            value={formData.familyStatus}
            onChange={(e) => updateFormData({ familyStatus: e.target.value })}
            aria-invalid={!!errors.familyStatus}
            aria-describedby={errors.familyStatus ? familyErrorId : undefined}
            className={`w-full px-4 min-h-[48px] rounded-xl border text-base ${
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
          {errors.familyStatus && <ErrorMessage message={errors.familyStatus} id={familyErrorId} />}
        </div>

        <div>
          <label htmlFor={householdId} className="block text-sm font-medium text-slate-700 mb-2">
            Nombre de personnes dans le foyer <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(obligatoire)</span>
          </label>
          <select
            id={householdId}
            value={formData.householdSize}
            onChange={(e) => updateFormData({ householdSize: parseInt(e.target.value) })}
            aria-invalid={!!errors.householdSize}
            aria-describedby={errors.householdSize ? householdErrorId : undefined}
            className={`w-full px-4 min-h-[48px] rounded-xl border text-base ${
              errors.householdSize ? 'border-red-500' : 'border-gray-200'
            } focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white`}
          >
            {HOUSEHOLD_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.householdSize && <ErrorMessage message={errors.householdSize} id={householdErrorId} />}
        </div>
      </div>
    </div>
  );
}

export function StepCharges({ formData, updateFormData }: StepProps) {
  const rentId = useId();
  const creditsId = useId();
  const otherChargesId = useId();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Vos charges actuelles</h3>
        <p className="text-sm text-slate-600">Indiquez vos charges mensuelles actuelles</p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor={rentId} className="block text-sm font-medium text-slate-700 mb-2">
            Loyer / Hypotheque mensuel
          </label>
          <div className="relative">
            <input
              id={rentId}
              type="number"
              min={0}
              step={50}
              value={formData.rentMortgage || ''}
              onChange={(e) => updateFormData({ rentMortgage: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 min-h-[48px] pr-14 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">EUR</span>
          </div>
        </div>

        <div>
          <label htmlFor={creditsId} className="block text-sm font-medium text-slate-700 mb-2">
            Credits en cours (mensualites totales)
          </label>
          <div className="relative">
            <input
              id={creditsId}
              type="number"
              min={0}
              step={50}
              value={formData.currentCredits || ''}
              onChange={(e) => updateFormData({ currentCredits: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 min-h-[48px] pr-14 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">EUR</span>
          </div>
        </div>

        <div>
          <label htmlFor={otherChargesId} className="block text-sm font-medium text-slate-700 mb-2">
            Autres charges fixes mensuelles
          </label>
          <div className="relative">
            <input
              id={otherChargesId}
              type="number"
              min={0}
              step={50}
              value={formData.otherCharges || ''}
              onChange={(e) => updateFormData({ otherCharges: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 min-h-[48px] pr-14 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">EUR</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4" role="status" aria-live="polite">
          <p className="text-sm text-slate-700">
            <strong>Total des charges actuelles :</strong>{' '}
            {formatCurrency(formData.rentMortgage + formData.currentCredits + formData.otherCharges)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StepVerifications({ formData, updateFormData, errors }: StepProps) {
  const belgianResidentId = useId();
  const bnbId = useId();
  const dataProcessingId = useId();
  const belgianErrorId = useId();
  const bnbErrorId = useId();
  const dataErrorId = useId();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Verifications</h3>
        <p className="text-sm text-slate-600">Confirmez les informations suivantes</p>
      </div>

      <div className="space-y-4" role="group" aria-labelledby="verifications-group">
        <span id="verifications-group" className="sr-only">Declarations obligatoires</span>

        <div>
          <label
            htmlFor={belgianResidentId}
            className={`flex items-start gap-3 p-4 bg-white border rounded-xl cursor-pointer hover:border-orange-200 transition-colors min-h-[64px] ${
              errors.isBelgianResident ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <input
              id={belgianResidentId}
              type="checkbox"
              checked={formData.isBelgianResident}
              onChange={(e) => updateFormData({ isBelgianResident: e.target.checked })}
              aria-invalid={!!errors.isBelgianResident}
              aria-describedby={errors.isBelgianResident ? belgianErrorId : undefined}
              className="mt-1 w-5 h-5 min-w-[20px] text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <p className="font-medium text-gray-900">Je suis resident(e) belge</p>
              <p className="text-sm text-slate-600">Je confirme resider en Belgique</p>
            </div>
          </label>
          {errors.isBelgianResident && <ErrorMessage message={errors.isBelgianResident} id={belgianErrorId} />}
        </div>

        <div>
          <label
            htmlFor={bnbId}
            className={`flex items-start gap-3 p-4 bg-white border rounded-xl cursor-pointer hover:border-orange-200 transition-colors min-h-[64px] ${
              errors.isNotBnbListed ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <input
              id={bnbId}
              type="checkbox"
              checked={formData.isNotBnbListed}
              onChange={(e) => updateFormData({ isNotBnbListed: e.target.checked })}
              aria-invalid={!!errors.isNotBnbListed}
              aria-describedby={errors.isNotBnbListed ? bnbErrorId : undefined}
              className="mt-1 w-5 h-5 min-w-[20px] text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <p className="font-medium text-gray-900">Je ne suis pas fiche(e) a la BNB</p>
              <p className="text-sm text-slate-600">Je declare ne pas etre inscrit(e) au fichier de la Banque Nationale de Belgique</p>
            </div>
          </label>
          {errors.isNotBnbListed && <ErrorMessage message={errors.isNotBnbListed} id={bnbErrorId} />}
        </div>

        <div>
          <label
            htmlFor={dataProcessingId}
            className={`flex items-start gap-3 p-4 bg-white border rounded-xl cursor-pointer hover:border-orange-200 transition-colors min-h-[64px] ${
              errors.acceptsDataProcessing ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <input
              id={dataProcessingId}
              type="checkbox"
              checked={formData.acceptsDataProcessing}
              onChange={(e) => updateFormData({ acceptsDataProcessing: e.target.checked })}
              aria-invalid={!!errors.acceptsDataProcessing}
              aria-describedby={errors.acceptsDataProcessing ? dataErrorId : undefined}
              className="mt-1 w-5 h-5 min-w-[20px] text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <p className="font-medium text-gray-900">J'accepte le traitement de mes donnees</p>
              <p className="text-sm text-slate-600">J'accepte que mes donnees soient utilisees pour traiter ma demande de credit</p>
            </div>
          </label>
          {errors.acceptsDataProcessing && <ErrorMessage message={errors.acceptsDataProcessing} id={dataErrorId} />}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3" role="alert">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-orange-800 text-sm leading-relaxed">
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

  const getStatusInfo = () => {
    if (!validation) return null;
    if (validation.status === 'OK') return { text: 'Faisable', ariaText: 'Demande faisable' };
    if (validation.status === 'LIMIT') return { text: 'Limite', ariaText: 'Demande limite, sera etudiee au cas par cas' };
    return { text: 'Non faisable', ariaText: 'Demande non faisable' };
  };

  const statusInfo = getStatusInfo();
  const minResteAVivre = RESTE_A_VIVRE_MIN[Math.min(formData.householdSize, 4)] || 2600;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Recapitulatif</h3>
        <p className="text-sm text-slate-600">Verifiez vos informations avant envoi</p>
      </div>

      {calculation && validation && (
        <div
          role="status"
          aria-label={statusInfo?.ariaText}
          className={`p-5 rounded-xl border-2 ${
            validation.status === 'OK' ? 'bg-green-50 border-green-200' :
            validation.status === 'LIMIT' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                validation.status === 'OK' ? 'bg-green-500' :
                validation.status === 'LIMIT' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              aria-hidden="true"
            >
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
              <p className="text-sm text-slate-700">
                {validation.status === 'DEBT_HIGH' && 'Taux d\'endettement trop eleve (superieur a 33%)'}
                {validation.status === 'INCOME_LOW' && `Reste a vivre insuffisant (minimum ${formatCurrency(minResteAVivre)})`}
                {validation.status === 'LIMIT' && 'Votre dossier sera etudie au cas par cas'}
                {validation.status === 'OK' && 'Votre demande respecte tous les criteres'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-600 mb-1">Mensualite estimee</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(calculation.mensualite)}</p>
              <p className="text-sm text-slate-600">TAEG: {calculation.taeg}%</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-600 mb-1">Taux d'endettement</p>
              <p className={`text-xl font-bold ${validation.tauxEndettement > 33 ? 'text-red-600' : 'text-gray-900'}`}>
                {validation.tauxEndettement.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600">Max recommande: 33%</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3 col-span-2">
              <p className="text-sm font-medium text-slate-600 mb-1">Reste a vivre</p>
              <p className={`text-xl font-bold ${validation.resteAVivre < minResteAVivre ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(validation.resteAVivre)}
              </p>
              <p className="text-sm text-slate-600">Min requis: {formatCurrency(minResteAVivre)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        <section className="p-4" aria-labelledby="recap-project">
          <p id="recap-project" className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2">Projet</p>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-700">Type</dt>
              <dd className="font-medium">{getCreditTypeLabel()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Montant</dt>
              <dd className="font-medium">{formatCurrency(formData.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Duree</dt>
              <dd className="font-medium">{formData.durationMonths} mois</dd>
            </div>
          </dl>
        </section>

        <section className="p-4" aria-labelledby="recap-situation">
          <p id="recap-situation" className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2">Situation</p>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-700">Emploi</dt>
              <dd className="font-medium">{getEmploymentLabel()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Revenus</dt>
              <dd className="font-medium">{formatCurrency(formData.monthlyIncome)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Famille</dt>
              <dd className="font-medium">{getFamilyLabel()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Foyer</dt>
              <dd className="font-medium">{formData.householdSize} personne(s)</dd>
            </div>
          </dl>
        </section>

        <section className="p-4" aria-labelledby="recap-charges">
          <p id="recap-charges" className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2">Charges</p>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-700">Loyer/Hypotheque</dt>
              <dd className="font-medium">{formatCurrency(formData.rentMortgage)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Credits actuels</dt>
              <dd className="font-medium">{formatCurrency(formData.currentCredits)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-700">Autres charges</dt>
              <dd className="font-medium">{formatCurrency(formData.otherCharges)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
