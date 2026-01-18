-- FINAL SOLUTION: Proper RLS policies without recursion
-- This uses a helper table to break the recursion chain

-- Step 1: Create a helper view that tracks user's group memberships
-- Views are evaluated separately and don't trigger RLS recursion
CREATE OR REPLACE VIEW user_groups AS
SELECT DISTINCT user_id, group_id
FROM group_members
WHERE user_id IS NOT NULL;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON group_members;
DROP POLICY IF EXISTS "Users can update group members" ON group_members;
DROP POLICY IF EXISTS "Users can delete group members" ON group_members;

-- Step 3: Create new SELECT policy using the view (breaks recursion)
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    -- Users can see their own memberships
    user_id = auth.uid()
    OR
    -- Users can see other members in groups they belong to
    -- Using the view breaks the recursion
    group_id IN (
      SELECT group_id FROM user_groups WHERE user_id = auth.uid()
    )
  );

-- Step 4: Recreate other policies
CREATE POLICY "Users can insert group members"
  ON group_members FOR INSERT
  WITH CHECK (
    -- Users can add members to groups they created
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    -- Users can add themselves to a group (for invitation acceptance)
    user_id = auth.uid()
  );

CREATE POLICY "Users can update group members"
  ON group_members FOR UPDATE
  USING (
    -- Group creators can update any membership
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    -- Users can update their own membership
    user_id = auth.uid()
  )
  WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete group members"
  ON group_members FOR DELETE
  USING (
    -- Only group creators can remove members
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- Step 5: Grant access to the view
GRANT SELECT ON user_groups TO authenticated;
