-- TEMPORARY FIX: Remove recursion entirely
-- This will get your app working immediately
-- We'll create a better policy after testing

-- Drop ALL existing policies on group_members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON group_members;
DROP POLICY IF EXISTS "Users can update group members" ON group_members;
DROP POLICY IF EXISTS "Users can delete group members" ON group_members;

-- Create simple, non-recursive policies

-- SELECT: Users can see their own memberships
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: Users can add members to groups they created
CREATE POLICY "Users can insert group members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- UPDATE: Users can update memberships in groups they created
CREATE POLICY "Users can update group members"
  ON group_members FOR UPDATE
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- DELETE: Users can delete memberships in groups they created
CREATE POLICY "Users can delete group members"
  ON group_members FOR DELETE
  USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );
