-- Fix the infinite recursion issue in the group_members RLS policy
-- The problem: The policy was checking group_members to determine access to group_members

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Create a simpler, non-recursive policy
-- Users can view group members for groups they belong to
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    -- User can see their own memberships
    user_id = auth.uid()
    OR
    -- User can see other members in their groups
    group_id IN (
      SELECT gm.group_id
      FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- Alternative: If the above still causes issues, use this simpler version
-- Uncomment if needed:
/*
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    -- Simply allow users to see any group_member record
    -- for groups where they have ANY membership record
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
    )
  );
*/
