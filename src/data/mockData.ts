import type { Client, Credit, Message } from '../types';

export const mockClient: Client = {
  id: 'client-demo-1',
  email: 'jean.dupont@email.be',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '+32 470 12 34 56',
  address: 'Rue de la Paix 123, 4000 Liège',
  created_at: '2023-01-15T10:00:00Z',
  updated_at: '2024-01-10T14:30:00Z',
};

export const mockCredits: Credit[] = [
  {
    id: 'credit-1',
    client_id: 'client-demo-1',
    reference_number: 'WF-2023-001542',
    type: 'Crédit Auto',
    montant_initial: 15000,
    mensualite: 299.83,
    taeg: 7.65,
    duree_total: 60,
    echeances_restantes: 42,
    deja_rembourse: 5396.94,
    restant_du: 12593.86,
    date_debut: '2023-06-15',
    date_fin: '2028-06-15',
    prochaine_echeance: '2025-02-15',
    jour_prelevement: 15,
    statut: 'en_cours',
    created_at: '2023-06-15T09:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'credit-2',
    client_id: 'client-demo-1',
    reference_number: 'WF-2024-003891',
    type: 'Prêt Travaux',
    montant_initial: 25000,
    mensualite: 344.79,
    taeg: 7.65,
    duree_total: 84,
    echeances_restantes: 78,
    deja_rembourse: 2068.74,
    restant_du: 22556.14,
    date_debut: '2024-08-01',
    date_fin: '2031-08-01',
    prochaine_echeance: '2025-02-01',
    jour_prelevement: 1,
    statut: 'en_cours',
    created_at: '2024-08-01T09:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const creditTypeIcons: Record<string, string> = {
  'Crédit Auto': '🚗',
  'Prêt Travaux': '🏠',
  'Crédit Énergie': '☀️',
  'Prêt Personnel': '💰',
  'Prêt Vacances': '✈️',
};

export const creditTypeLabels: Record<string, string> = {
  'Crédit Auto': 'Credit Auto',
  'Prêt Travaux': 'Pret Travaux',
  'Crédit Énergie': 'Credit Energie',
  'Prêt Personnel': 'Pret Personnel',
  'Prêt Vacances': 'Pret Vacances',
};

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    titre: 'Confirmation de paiement',
    contenu: "Votre echeance du 15/01/2025 pour votre Credit Auto (WF-2023-001542) a bien ete prelevee.\n\nMontant : 299,83 EUR\n\nMerci de votre confiance.\n\nL'equipe Wallfin",
    date: '2025-01-15T10:30:00',
    lu: false,
    type: 'paiement',
  },
  {
    id: 'msg-002',
    titre: 'Bonne annee 2025 !',
    contenu: "Toute l'equipe Wallfin vous souhaite une excellente annee 2025 !\n\nNous restons a votre disposition pour tous vos projets de financement.\n\nCordialement,\nL'equipe Wallfin",
    date: '2025-01-01T09:00:00',
    lu: true,
    type: 'info',
  },
  {
    id: 'msg-003',
    titre: 'Rappel : Prochaine echeance',
    contenu: "Votre prochaine echeance pour votre Pret Travaux (WF-2024-003891) sera prelevee le 01/02/2025.\n\nMontant : 344,79 EUR\n\nAssurez-vous que votre compte est suffisamment approvisionne.\n\nL'equipe Wallfin",
    date: '2024-12-26T14:00:00',
    lu: true,
    type: 'rappel',
  },
  {
    id: 'msg-004',
    titre: 'Votre espace client est disponible',
    contenu: "Bienvenue sur votre Espace Client Wallfin !\n\nVous pouvez desormais :\n- Consulter vos credits en cours\n- Suivre vos remboursements\n- Nous contacter facilement\n\nN'hesitez pas a nous faire part de vos retours.\n\nL'equipe Wallfin",
    date: '2024-12-20T11:00:00',
    lu: true,
    type: 'info',
  },
];
