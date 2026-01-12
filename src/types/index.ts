export type ViewType = 'login' | 'register' | 'accueil' | 'credits' | 'messages' | 'message-detail' | 'demandes' | 'credit-detail';

export type MessageType = 'paiement' | 'info' | 'rappel';

export interface Message {
  id: string;
  titre: string;
  contenu: string;
  date: string;
  lu: boolean;
  type: MessageType;
}

export type CreditType = 'Crédit Auto' | 'Prêt Travaux' | 'Crédit Énergie' | 'Prêt Personnel' | 'Prêt Vacances';

export type CreditStatus = 'en_cours' | 'en_attente' | 'solde';

export interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
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
