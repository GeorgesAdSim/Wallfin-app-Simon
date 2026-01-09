/*
  # Extended Credit Request Schema for Wallfin

  1. New Tables
    - `credit_requests` - Full credit request form data
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for guests)
      - `request_number` (text, unique) - Format WF-YYYY-XXXXXX
      - `status` (text) - pending, in_review, approved, rejected
      
      Project details:
      - `credit_type` (text) - Type of credit requested
      - `amount` (numeric) - Requested amount
      - `duration_months` (integer) - Requested duration
      - `project_description` (text, nullable)
      
      Personal situation:
      - `employment_status` (text)
      - `monthly_income` (numeric)
      - `family_status` (text)
      - `household_size` (integer)
      
      Current charges:
      - `rent_mortgage` (numeric)
      - `current_credits` (numeric)
      - `other_charges` (numeric)
      
      Calculations:
      - `calculated_monthly_payment` (numeric)
      - `calculated_taeg` (numeric)
      - `calculated_debt_ratio` (numeric)
      - `calculated_remaining_income` (numeric)
      - `feasibility_status` (text) - OK, DEBT_HIGH, INCOME_LOW
      
      Contact info:
      - `contact_name` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      
      Timestamps:
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view their own requests
    - Anonymous users can create requests
*/

-- Create credit_requests table
CREATE TABLE IF NOT EXISTS credit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  
  credit_type text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 5001 AND amount <= 100000),
  duration_months integer NOT NULL CHECK (duration_months > 0),
  project_description text,
  
  employment_status text NOT NULL,
  monthly_income numeric NOT NULL CHECK (monthly_income > 0),
  family_status text NOT NULL,
  household_size integer NOT NULL CHECK (household_size >= 1),
  
  rent_mortgage numeric DEFAULT 0,
  current_credits numeric DEFAULT 0,
  other_charges numeric DEFAULT 0,
  
  calculated_monthly_payment numeric NOT NULL,
  calculated_taeg numeric NOT NULL,
  calculated_debt_ratio numeric NOT NULL,
  calculated_remaining_income numeric NOT NULL,
  feasibility_status text NOT NULL CHECK (feasibility_status IN ('OK', 'DEBT_HIGH', 'INCOME_LOW', 'LIMIT')),
  
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  
  is_belgian_resident boolean DEFAULT false,
  is_not_bnb_listed boolean DEFAULT false,
  accepts_data_processing boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit requests"
  ON credit_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create credit requests"
  ON credit_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous can create credit requests"
  ON credit_requests FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_credit_requests_user_id ON credit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_status ON credit_requests(status);
CREATE INDEX IF NOT EXISTS idx_credit_requests_number ON credit_requests(request_number);
