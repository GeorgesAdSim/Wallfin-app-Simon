import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreditRequestPayload {
  requestNumber: string;
  formData: {
    creditType: string;
    amount: number;
    durationMonths: number;
    projectDescription: string;
    employmentStatus: string;
    monthlyIncome: number;
    familyStatus: string;
    householdSize: number;
    rentMortgage: number;
    currentCredits: number;
    otherCharges: number;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  calculation: {
    mensualite: number;
    taeg: number;
  };
  validation: {
    tauxEndettement: number;
    resteAVivre: number;
    faisable: boolean;
    status: string;
  };
}

const CREDIT_TYPE_LABELS: Record<string, string> = {
  pret_personnel: 'Pret Personnel',
  credit_auto: 'Credit Auto',
  pret_travaux: 'Pret Travaux',
  credit_energie: 'Credit Energie',
  pret_vacances: 'Pret Vacances',
  regroupement: 'Regroupement de Credits'
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  independant: 'Independant',
  fonctionnaire: 'Fonctionnaire',
  retraite: 'Retraite',
  sans_emploi: 'Sans emploi'
};

const FAMILY_LABELS: Record<string, string> = {
  seul: 'Seul(e)',
  en_couple: 'En couple',
  avec_enfants: 'Avec enfant(s)'
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: CreditRequestPayload = await req.json();
    const { requestNumber, formData, calculation, validation } = payload;

    const creditTypeLabel = CREDIT_TYPE_LABELS[formData.creditType] || formData.creditType;
    const employmentLabel = EMPLOYMENT_LABELS[formData.employmentStatus] || formData.employmentStatus;
    const familyLabel = FAMILY_LABELS[formData.familyStatus] || formData.familyStatus;

    const totalCharges = formData.rentMortgage + formData.currentCredits + formData.otherCharges;

    const emailBody = `
NOUVELLE DEMANDE DE CREDIT - ${requestNumber}
============================================

Client: ${formData.contactName}

1. PROJET
---------
Type de credit: ${creditTypeLabel}
Montant souhaite: ${formatCurrency(formData.amount)}
Duree: ${formData.durationMonths} mois
Description: ${formData.projectDescription || 'Non renseignee'}

2. SITUATION
------------
Situation professionnelle: ${employmentLabel}
Revenu net mensuel: ${formatCurrency(formData.monthlyIncome)}
Situation familiale: ${familyLabel}
Nombre de personnes dans le foyer: ${formData.householdSize}

3. CHARGES ACTUELLES
--------------------
Loyer/Hypotheque: ${formatCurrency(formData.rentMortgage)}
Credits en cours: ${formatCurrency(formData.currentCredits)}
Autres charges: ${formatCurrency(formData.otherCharges)}
TOTAL CHARGES: ${formatCurrency(totalCharges)}

4. ANALYSE FINANCIERE
---------------------
Mensualite estimee: ${formatCurrency(calculation.mensualite)}
TAEG: ${calculation.taeg}%
Taux d'endettement: ${validation.tauxEndettement.toFixed(2)}%
Reste a vivre: ${formatCurrency(validation.resteAVivre)}
Faisabilite: ${validation.status === 'OK' ? 'FAISABLE' : validation.status === 'LIMIT' ? 'LIMITE' : 'NON FAISABLE'}

5. CONTACT
----------
Nom: ${formData.contactName}
Email: ${formData.contactEmail}
Telephone: ${formData.contactPhone}

============================================
Cette demande a ete generee automatiquement via l'espace client Wallfin.
`;

    console.log('Email content for request', requestNumber);
    console.log(emailBody);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email prepared successfully',
        requestNumber,
        emailPreview: emailBody
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});