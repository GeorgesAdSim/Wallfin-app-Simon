/*
  # Wallfin Client Portal Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text) - Prénom du client
      - `last_name` (text) - Nom du client
      - `phone` (text) - Numéro de téléphone
      - `email` (text) - Adresse email
      - `address` (text) - Adresse postale
      - `birth_date` (date) - Date de naissance
      - `gender` (text) - Sexe (M/F)
      - `is_client` (boolean) - Est un client actif
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `credits`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `reference` (text) - Numéro de référence du crédit
      - `type` (text) - Type de crédit (personnel, auto, immobilier)
      - `total_amount` (numeric) - Montant total emprunté
      - `remaining_amount` (numeric) - Montant restant à rembourser
      - `monthly_payment` (numeric) - Mensualité
      - `total_months` (integer) - Durée totale en mois
      - `remaining_months` (integer) - Mois restants
      - `interest_rate` (numeric) - Taux d'intérêt
      - `start_date` (date) - Date de début
      - `status` (text) - Statut (active, completed, suspended)
      - `created_at` (timestamptz)

    - `mensualites`
      - `id` (uuid, primary key)
      - `credit_id` (uuid, references credits)
      - `month_number` (integer) - Numéro du mois
      - `due_date` (date) - Date d'échéance
      - `amount` (numeric) - Montant de la mensualité
      - `principal` (numeric) - Part capital
      - `interest` (numeric) - Part intérêts
      - `status` (text) - Statut (paid, pending, overdue)
      - `paid_at` (timestamptz) - Date de paiement

    - `requests`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients, nullable for prospects)
      - `type` (text) - Type (information, settlement, new_credit)
      - `subject` (text) - Sujet de la demande
      - `message` (text) - Message/détails
      - `credit_id` (uuid, references credits, nullable)
      - `status` (text) - Statut (pending, in_progress, completed)
      - `response` (text) - Réponse de Wallfin
      - `contact_email` (text) - Email de contact (pour prospects)
      - `contact_phone` (text) - Téléphone de contact
      - `contact_name` (text) - Nom du contact (pour prospects)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Clients can only access their own data
    - Prospects can create requests without authentication
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  email text NOT NULL,
  address text,
  birth_date date,
  gender text CHECK (gender IN ('M', 'F', 'Autre')),
  is_client boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own profile"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update own profile"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('personnel', 'auto', 'immobilier', 'travaux', 'consommation')),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  remaining_amount numeric NOT NULL CHECK (remaining_amount >= 0),
  monthly_payment numeric NOT NULL CHECK (monthly_payment > 0),
  total_months integer NOT NULL CHECK (total_months > 0),
  remaining_months integer NOT NULL CHECK (remaining_months >= 0),
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  start_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own credits"
  ON credits FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Create mensualites table
CREATE TABLE IF NOT EXISTS mensualites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_id uuid NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  month_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  principal numeric NOT NULL,
  interest numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  paid_at timestamptz,
  UNIQUE(credit_id, month_number)
);

ALTER TABLE mensualites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own mensualites"
  ON mensualites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM credits
      WHERE credits.id = mensualites.credit_id
      AND credits.client_id = auth.uid()
    )
  );

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('information', 'settlement', 'new_credit')),
  subject text NOT NULL,
  message text NOT NULL,
  credit_id uuid REFERENCES credits(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  response text,
  contact_email text,
  contact_phone text,
  contact_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own requests"
  ON requests FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Anyone can create prospect requests"
  ON requests FOR INSERT
  TO anon
  WITH CHECK (client_id IS NULL AND contact_email IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credits_client_id ON credits(client_id);
CREATE INDEX IF NOT EXISTS idx_mensualites_credit_id ON mensualites(credit_id);
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
