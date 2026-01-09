import { useState } from 'react';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CreditRequestFormData } from '../../types';
import { StepIndicator } from './StepIndicator';
import { StepProject, StepSituation, StepCharges, StepVerifications, StepRecap } from './FormSteps';
import { calculerMensualite, validerDemande, generateRequestNumber } from '../../utils/calculations';
import { supabase } from '../../lib/supabase';

const STEP_LABELS = ['Projet', 'Situation', 'Charges', 'Verifications', 'Recapitulatif'];

const initialFormData: CreditRequestFormData = {
  creditType: '',
  amount: 15000,
  durationMonths: 60,
  projectDescription: '',
  employmentStatus: '',
  monthlyIncome: 0,
  familyStatus: '',
  householdSize: 1,
  rentMortgage: 0,
  currentCredits: 0,
  otherCharges: 0,
  isBelgianResident: false,
  isNotBnbListed: false,
  acceptsDataProcessing: false,
  contactName: '',
  contactEmail: '',
  contactPhone: ''
};

export function CreditRequestForm() {
  const { navigateTo, client } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreditRequestFormData>(() => ({
    ...initialFormData,
    contactName: client ? `${client.first_name} ${client.last_name}` : '',
    contactEmail: client?.email || '',
    contactPhone: client?.phone || ''
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);

  const updateFormData = (data: Partial<CreditRequestFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.creditType) newErrors.creditType = 'Selectionnez un type de credit';
        if (!formData.amount || formData.amount < 5001) newErrors.amount = 'Montant minimum: 5.001 EUR';
        if (formData.amount > 100000) newErrors.amount = 'Montant maximum: 100.000 EUR';
        if (!formData.durationMonths) newErrors.durationMonths = 'Selectionnez une duree';
        break;
      case 2:
        if (!formData.employmentStatus) newErrors.employmentStatus = 'Selectionnez votre situation';
        if (!formData.monthlyIncome || formData.monthlyIncome <= 0) newErrors.monthlyIncome = 'Indiquez vos revenus';
        if (!formData.familyStatus) newErrors.familyStatus = 'Selectionnez votre situation familiale';
        break;
      case 4:
        if (!formData.isBelgianResident) newErrors.isBelgianResident = 'Vous devez etre resident belge';
        if (!formData.isNotBnbListed) newErrors.isNotBnbListed = 'Cette declaration est obligatoire';
        if (!formData.acceptsDataProcessing) newErrors.acceptsDataProcessing = 'Vous devez accepter le traitement des donnees';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      const calculation = calculerMensualite(formData.amount, formData.durationMonths);
      if (!calculation) {
        throw new Error('Erreur de calcul de la mensualite');
      }

      const charges = formData.rentMortgage + formData.currentCredits + formData.otherCharges;
      const validation = validerDemande(
        formData.monthlyIncome,
        charges,
        calculation.mensualite,
        formData.householdSize
      );

      const requestNumber = generateRequestNumber();

      const { error } = await supabase.from('credit_requests').insert({
        user_id: client?.id || null,
        request_number: requestNumber,
        credit_type: formData.creditType,
        amount: formData.amount,
        duration_months: formData.durationMonths,
        project_description: formData.projectDescription || null,
        employment_status: formData.employmentStatus,
        monthly_income: formData.monthlyIncome,
        family_status: formData.familyStatus,
        household_size: formData.householdSize,
        rent_mortgage: formData.rentMortgage,
        current_credits: formData.currentCredits,
        other_charges: formData.otherCharges,
        calculated_monthly_payment: calculation.mensualite,
        calculated_taeg: calculation.taeg,
        calculated_debt_ratio: validation.tauxEndettement,
        calculated_remaining_income: validation.resteAVivre,
        feasibility_status: validation.status,
        contact_name: formData.contactName || client?.first_name + ' ' + client?.last_name || 'Non renseigne',
        contact_email: formData.contactEmail || client?.email || 'non-renseigne@email.com',
        contact_phone: formData.contactPhone || client?.phone || '',
        is_belgian_resident: formData.isBelgianResident,
        is_not_bnb_listed: formData.isNotBnbListed,
        accepts_data_processing: formData.acceptsDataProcessing
      });

      if (error) {
        console.error('Error submitting request:', error);
      }

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-credit-request-email`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestNumber,
            formData,
            calculation,
            validation
          })
        });
      } catch (emailError) {
        console.log('Email sending skipped or failed:', emailError);
      }

      setSubmittedRequestNumber(requestNumber);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRequestNumber) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyee</h2>
          <p className="text-gray-500 mb-4">Votre demande a ete transmise avec succes</p>
          <div className="bg-gray-100 rounded-xl px-6 py-4 inline-block mb-6">
            <p className="text-sm text-gray-500 mb-1">Numero de demande</p>
            <p className="text-xl font-bold text-gray-900">{submittedRequestNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Un conseiller Wallfin vous contactera dans les plus brefs delais pour finaliser votre dossier.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigateTo('requests')}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              Voir mes demandes
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Retour a l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepProject formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2:
        return <StepSituation formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3:
        return <StepCharges formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 4:
        return <StepVerifications formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5:
        return <StepRecap formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigateTo('dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Retour</span>
      </button>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Nouvelle demande de credit</h2>
        <p className="text-sm text-gray-500">Completez le formulaire en {STEP_LABELS.length} etapes</p>
      </div>

      <StepIndicator
        currentStep={currentStep}
        totalSteps={STEP_LABELS.length}
        stepLabels={STEP_LABELS}
      />

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {renderStep()}
      </div>

      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            onClick={handlePrev}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Precedent</span>
          </button>
        )}
        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            <span>Suivant</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Envoyer ma demande</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
