/*
  # Allow admins to read all profiles

  1. Security Changes
    - Add SELECT policy on `profiles` table allowing admin users to read all profiles
    - This enables admin users to list viewers when sending messages

  2. Important Notes
    - Only users with role = 'admin' in the profiles table can access other profiles
    - Regular viewers remain restricted to their own profile only
*/

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
