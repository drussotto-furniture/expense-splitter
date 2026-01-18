-- Comprehensive RLS policy fix for all tables
-- This ensures users can properly invite members and accept invitations

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to view all profiles (needed for checking if invitee exists)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- INVITATIONS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view invitations" ON invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON invitations;

-- Users can view invitations they sent or received
CREATE POLICY "Users can view invitations"
  ON invitations FOR SELECT
  USING (
    invited_by = auth.uid()
    OR
    invited_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Users can create invitations for groups they own
CREATE POLICY "Users can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- Users can update invitations they received (to accept/decline)
CREATE POLICY "Users can update invitations"
  ON invitations FOR UPDATE
  USING (
    invited_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    invited_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- GROUP_MEMBERS TABLE POLICIES (already fixed)
-- ============================================
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert group members" ON group_members;
CREATE POLICY "Users can insert group members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update group members" ON group_members;
CREATE POLICY "Users can update group members"
  ON group_members FOR UPDATE
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    user_id = auth.uid()
  )
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete group members" ON group_members;
CREATE POLICY "Users can delete group members"
  ON group_members FOR DELETE
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- ============================================
-- VERIFY THE VIEW EXISTS
-- ============================================
CREATE OR REPLACE VIEW user_groups AS
SELECT DISTINCT user_id, group_id
FROM group_members
WHERE user_id IS NOT NULL;

GRANT SELECT ON user_groups TO authenticated;
