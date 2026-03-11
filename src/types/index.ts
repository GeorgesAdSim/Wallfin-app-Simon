export type ViewType = 'login' | 'register' | 'accueil' | 'credits' | 'messages' | 'message-detail' | 'demandes' | 'credit-detail' | 'global-report' | 'profile';

export type MessageType = 'paiement' | 'info' | 'rappel';

export interface Message {
  id: string;
  titre: string;
  contenu: string;
  created_at: string;
  is_read: boolean;
  type?: MessageType;
}

export type CreditType = 'Crédit Auto' | 'Prêt Travaux' | 'Crédit Énergie' | 'Prêt Personnel' | 'Prêt Vacances' | 'Crédit Personnel' | 'Regroupement de Crédit';

export type CreditStatus = 'en_cours' | 'en_attente' | 'solde';

export interface Client {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Credit {
  id: string;
  client_id: string;
  reference_number: string;
  type: CreditType;
  montant_initial: number;
  mensualite: number;
  taeg: number;
  duree_total: number;
  echeances_restantes: number;
  deja_rembourse: number;
  restant_du: number;
  date_debut: string;
  date_fin: string;
  prochaine_echeance: string;
  jour_prelevement: number;
  statut: CreditStatus;
  created_at: string;
  updated_at: string;
}

export interface AppState {
  currentView: ViewType;
  selectedCreditId: string | null;
  isAuthenticated: boolean;
}

export interface CreditRequestFormData {
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
  isBelgianResident: boolean;
  isNotBnbListed: boolean;
  acceptsDataProcessing: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}
