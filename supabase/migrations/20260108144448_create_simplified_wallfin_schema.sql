/*
  # Simplified Wallfin Client Portal Schema

  ## Overview
  This migration creates a simplified schema for the Wallfin client portal,
  focusing on read-only credit consultation rather than credit application.

  ## New Tables
  
  ### `clients`
  - `id` (uuid, primary key) - Client unique identifier
  - `email` (text, unique) - Client email for authentication
  - `first_name` (text) - Client first name
  - `last_name` (text) - Client last name
  - `phone` (text) - Client phone number
  - `address` (text, nullable) - Client address
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `credits`
  - `id` (uuid, primary key) - Credit unique identifier
  - `client_id` (uuid, foreign key) - Reference to client
  - `reference_number` (text, unique) - Credit reference (e.g., WF-2023-001542)
  - `type` (text) - Credit type (credit_auto, pret_travaux, etc.)
  - `montant_initial` (numeric) - Initial borrowed amount
  - `mensualite` (numeric) - Monthly payment amount
  - `taeg` (numeric) - Annual percentage rate
  - `duree_total` (integer) - Total duration in months
  - `echeances_restantes` (integer) - Remaining payments
  - `deja_rembourse` (numeric) - Already reimbursed amount
  - `restant_du` (numeric) - Remaining amount to pay
  - `date_debut` (date) - Credit start date
  - `date_fin` (date) - Credit end date
  - `prochaine_echeance` (date) - Next payment date
  - `statut` (text) - Status (en_cours, en_attente, solde)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Clients can only view their own data
  - Authenticated users can only access their own credits
*/

-- Drop existing tables if they exist (clean slate for simplified structure)
DROP TABLE IF EXISTS credit_requests CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS mensualites CASCADE;
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credits table
CREATE TABLE credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reference_number text UNIQUE NOT NULL,
  type text NOT NULL,
  montant_initial numeric NOT NULL,
  mensualite numeric NOT NULL,
  taeg numeric NOT NULL,
  duree_total integer NOT NULL,
  echeances_restantes integer NOT NULL,
  deja_rembourse numeric NOT NULL,
  restant_du numeric NOT NULL,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  prochaine_echeance date NOT NULL,
  statut text NOT NULL DEFAULT 'en_cours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view own client data"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for credits
CREATE POLICY "Users can view own credits"
  ON credits FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE auth.uid() = id
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_credits_client_id ON credits(client_id);
CREATE INDEX idx_credits_reference_number ON credits(reference_number);
CREATE INDEX idx_credits_statut ON credits(statut);
