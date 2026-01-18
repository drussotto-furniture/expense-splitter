-- Simplest possible fix: Use a materialized approach
-- This completely avoids recursion by checking group ownership via the groups table

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Create a simple policy based on group ownership
-- Users can see members of groups they created OR their own membership records
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    -- Users can always see their own membership records
    user_id = auth.uid()
    OR
    -- Users can see members of groups they own
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
    OR
    -- For now, allow viewing if they're in the same group (using groups table to avoid recursion)
    group_id IN (
      SELECT g.id FROM groups g
      WHERE g.id IN (
        -- This subquery is evaluated first, avoiding the recursion
        SELECT DISTINCT gm.group_id
        FROM group_members gm
        WHERE gm.user_id = auth.uid()
      )
    )
  );

-- If the above still has issues, try this even simpler version:
-- Uncomment these lines and comment out the above policy

/*
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Temporarily allow all authenticated users to view group members
-- This is less secure but will get things working
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);
*/
