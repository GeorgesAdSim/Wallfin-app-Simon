import type { Client, Credit } from '../types';

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
