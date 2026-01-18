-- Fix infinite recursion by using a security definer function
-- This breaks the recursion chain by executing the check with elevated privileges

-- Step 1: Create a function that checks if a user is a member of a group
CREATE OR REPLACE FUNCTION is_group_member(group_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Step 3: Create a new policy using the function
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    is_group_member(group_id, auth.uid())
  );
