export const TABLEAU_WALLFIN: Record<number, Record<number, { mensualite: number; taeg: number }>> = {
  5001: {
    24: { mensualite: 236.05, taeg: 12.99 },
    30: { mensualite: 194.42, taeg: 12.99 },
    36: { mensualite: 166.76, taeg: 12.99 }
  },
  10001: {
    24: { mensualite: 463.67, taeg: 7.65 },
    30: { mensualite: 380.35, taeg: 7.65 },
    36: { mensualite: 324.92, taeg: 7.65 },
    42: { mensualite: 272.45, taeg: 7.65 },
    48: { mensualite: 242.80, taeg: 7.65 },
    60: { mensualite: 199.89, taeg: 7.65 }
  },
  15001: {
    24: { mensualite: 695.49, taeg: 7.65 },
    30: { mensualite: 570.50, taeg: 7.65 },
    36: { mensualite: 487.37, taeg: 7.65 },
    42: { mensualite: 408.67, taeg: 7.65 },
    48: { mensualite: 364.19, taeg: 7.65 },
    60: { mensualite: 299.83, taeg: 7.65 },
    72: { mensualite: 258.60, taeg: 7.65 },
    84: { mensualite: 229.30, taeg: 7.65 }
  },
  20001: {
    24: { mensualite: 927.31, taeg: 7.65 },
    30: { mensualite: 760.66, taeg: 7.65 },
    36: { mensualite: 649.82, taeg: 7.65 },
    42: { mensualite: 544.88, taeg: 7.65 },
    48: { mensualite: 485.57, taeg: 7.65 },
    60: { mensualite: 399.77, taeg: 7.65 },
    72: { mensualite: 344.79, taeg: 7.65 },
    84: { mensualite: 305.73, taeg: 7.65 },
    96: { mensualite: 276.62, taeg: 7.65 },
    108: { mensualite: 254.14, taeg: 7.65 },
    120: { mensualite: 236.31, taeg: 7.65 }
  },
  50000: {
    24: { mensualite: 2318.16, taeg: 7.65 },
    30: { mensualite: 1901.57, taeg: 7.65 },
    36: { mensualite: 1624.47, taeg: 7.65 },
    42: { mensualite: 1362.14, taeg: 7.65 },
    48: { mensualite: 1213.88, taeg: 7.65 },
    60: { mensualite: 999.38, taeg: 7.65 },
    72: { mensualite: 861.94, taeg: 7.65 },
    84: { mensualite: 764.30, taeg: 7.65 },
    96: { mensualite: 691.53, taeg: 7.65 },
    108: { mensualite: 635.34, taeg: 7.65 },
    120: { mensualite: 590.75, taeg: 7.65 }
  },
  100000: {
    24: { mensualite: 4636.32, taeg: 7.65 },
    30: { mensualite: 3803.14, taeg: 7.65 },
    36: { mensualite: 3248.94, taeg: 7.65 },
    42: { mensualite: 2724.29, taeg: 7.65 },
    48: { mensualite: 2427.77, taeg: 7.65 },
    60: { mensualite: 1998.77, taeg: 7.65 },
    72: { mensualite: 1723.89, taeg: 7.65 },
    84: { mensualite: 1528.61, taeg: 7.65 },
    96: { mensualite: 1383.07, taeg: 7.65 },
    108: { mensualite: 1270.68, taeg: 7.65 },
    120: { mensualite: 1181.50, taeg: 7.65 }
  }
};

const MONTANTS_REF = [5001, 10001, 15001, 20001, 50000, 100000];

export const RESTE_A_VIVRE_MIN: Record<number, number> = {
  1: 1500,
  2: 2000,
  3: 2300,
  4: 2600
};

export function getAvailableDurations(montant: number): number[] {
  if (montant < 5001) return [];
  if (montant < 10000) return [24, 30, 36];
  if (montant < 15000) return [24, 30, 36, 42, 48, 60];
  if (montant < 20000) return [24, 30, 36, 42, 48, 60, 72, 84];
  return [24, 30, 36, 42, 48, 60, 72, 84, 96, 108, 120];
}

export function calculerMensualite(montant: number, duree: number): { mensualite: number; taeg: number } | null {
  if (montant < 5001 || montant > 100000) return null;

  const availableDurations = getAvailableDurations(montant);
  if (!availableDurations.includes(duree)) return null;

  if (TABLEAU_WALLFIN[montant]?.[duree]) {
    return TABLEAU_WALLFIN[montant][duree];
  }

  let inf = 5001;
  let sup = 100000;

  for (let i = 0; i < MONTANTS_REF.length - 1; i++) {
    if (montant >= MONTANTS_REF[i] && montant < MONTANTS_REF[i + 1]) {
      inf = MONTANTS_REF[i];
      sup = MONTANTS_REF[i + 1];
      break;
    }
  }

  const dataInf = TABLEAU_WALLFIN[inf]?.[duree];
  const dataSup = TABLEAU_WALLFIN[sup]?.[duree];

  if (!dataInf || !dataSup) {
    const closestRef = MONTANTS_REF.reduce((prev, curr) =>
      Math.abs(curr - montant) < Math.abs(prev - montant) ? curr : prev
    );
    const closestData = TABLEAU_WALLFIN[closestRef]?.[duree];
    if (!closestData) return null;

    const ratio = montant / closestRef;
    return {
      mensualite: Math.round(closestData.mensualite * ratio * 2) / 2,
      taeg: closestData.taeg
    };
  }

  const ratio = (montant - inf) / (sup - inf);
  const mensualite = dataInf.mensualite + (dataSup.mensualite - dataInf.mensualite) * ratio;

  return {
    mensualite: Math.round(mensualite * 2) / 2,
    taeg: dataInf.taeg
  };
}

export type FeasibilityStatus = 'OK' | 'DEBT_HIGH' | 'INCOME_LOW' | 'LIMIT';

export interface ValidationResult {
  tauxEndettement: number;
  resteAVivre: number;
  faisable: boolean;
  status: FeasibilityStatus;
}

export function validerDemande(
  revenus: number,
  charges: number,
  nouvelleMensualite: number,
  nbPersonnes: number
): ValidationResult {
  const totalCharges = charges + nouvelleMensualite;
  const tauxEndettement = (totalCharges / revenus) * 100;
  const resteAVivre = revenus - totalCharges;
  const resteMin = RESTE_A_VIVRE_MIN[Math.min(nbPersonnes, 4)] || 2600;

  const isDebtHigh = tauxEndettement > 33;
  const isIncomeLow = resteAVivre < resteMin;
  const isLimit = (tauxEndettement > 30 && tauxEndettement <= 33) ||
                  (resteAVivre >= resteMin && resteAVivre < resteMin * 1.1);

  let status: FeasibilityStatus = 'OK';
  if (isDebtHigh) {
    status = 'DEBT_HIGH';
  } else if (isIncomeLow) {
    status = 'INCOME_LOW';
  } else if (isLimit) {
    status = 'LIMIT';
  }

  return {
    tauxEndettement: Math.round(tauxEndettement * 100) / 100,
    resteAVivre: Math.round(resteAVivre * 100) / 100,
    faisable: !isDebtHigh && !isIncomeLow,
    status
  };
}

export function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `WF-${year}-${random}`;
}

export const CREDIT_TYPES = [
  { value: 'pret_personnel', label: 'Pret Personnel' },
  { value: 'credit_auto', label: 'Credit Auto' },
  { value: 'pret_travaux', label: 'Pret Travaux' },
  { value: 'credit_energie', label: 'Credit Energie' },
  { value: 'pret_vacances', label: 'Pret Vacances' },
  { value: 'regroupement', label: 'Regroupement de Credits' }
];

export const EMPLOYMENT_STATUSES = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'independant', label: 'Independant' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'retraite', label: 'Retraite' },
  { value: 'sans_emploi', label: 'Sans emploi' }
];

export const FAMILY_STATUSES = [
  { value: 'seul', label: 'Seul(e)' },
  { value: 'en_couple', label: 'En couple' },
  { value: 'avec_enfants', label: 'Avec enfant(s)' }
];

export const HOUSEHOLD_SIZES = [
  { value: 1, label: '1 personne' },
  { value: 2, label: '2 personnes' },
  { value: 3, label: '3 personnes' },
  { value: 4, label: '4+ personnes' }
];
