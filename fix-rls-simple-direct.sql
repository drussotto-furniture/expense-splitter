-- SIMPLE DIRECT FIX - No subqueries that could cause issues
-- This should definitely work

-- ============================================
-- PROFILES TABLE - Allow reading all profiles
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;

CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- INVITATIONS TABLE - Simple policies
-- ============================================
DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON invitations;
DROP POLICY IF EXISTS "Enable read access" ON invitations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invitations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invitations;

-- For now, make invitations accessible to all authenticated users
-- We'll tighten this later once it's working
CREATE POLICY "Enable read access"
  ON invitations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Enable update for authenticated users"
  ON invitations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
