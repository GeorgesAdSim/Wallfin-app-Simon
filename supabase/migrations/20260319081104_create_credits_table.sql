/*
  # Create credits table for client portal

  1. New Tables
    - `credits`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to auth.users)
      - `reference_number` (text, unique) - e.g. WF-2023-001542
      - `type` (text) - Credit type label
      - `montant_initial` (numeric) - Initial borrowed amount
      - `mensualite` (numeric) - Monthly payment
      - `taeg` (numeric) - Annual percentage rate
      - `duree_total` (integer) - Total duration in months
      - `echeances_restantes` (integer) - Remaining installments
      - `deja_rembourse` (numeric) - Already repaid amount
      - `restant_du` (numeric) - Remaining balance
      - `date_debut` (date) - Start date
      - `date_fin` (date) - End date
      - `prochaine_echeance` (date) - Next payment date
      - `jour_prelevement` (integer) - Day of month for direct debit
      - `statut` (text) - Status: en_cours, en_attente, solde
      - `created_at` / `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `credits` table
    - Authenticated users can only SELECT their own credits (client_id = auth.uid())
*/

CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_number text UNIQUE NOT NULL,
  type text NOT NULL,
  montant_initial numeric NOT NULL DEFAULT 0,
  mensualite numeric NOT NULL DEFAULT 0,
  taeg numeric NOT NULL DEFAULT 0,
  duree_total integer NOT NULL DEFAULT 0,
  echeances_restantes integer NOT NULL DEFAULT 0,
  deja_rembourse numeric NOT NULL DEFAULT 0,
  restant_du numeric NOT NULL DEFAULT 0,
  date_debut date NOT NULL DEFAULT CURRENT_DATE,
  date_fin date NOT NULL DEFAULT CURRENT_DATE,
  prochaine_echeance date NOT NULL DEFAULT CURRENT_DATE,
  jour_prelevement integer NOT NULL DEFAULT 1,
  statut text NOT NULL DEFAULT 'en_cours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON credits FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_credits_client_id ON credits(client_id);
CREATE INDEX IF NOT EXISTS idx_credits_statut ON credits(statut);
