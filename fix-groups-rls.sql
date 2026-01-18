-- First, let's fix the groups table policies to avoid checking group_members

-- Drop existing groups policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group admins can update groups" ON groups;
DROP POLICY IF EXISTS "Group admins can delete groups" ON groups;

-- Create a function to check group membership without RLS
CREATE OR REPLACE FUNCTION user_is_group_member(group_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = $1 AND gm.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Users can view groups they created OR are members of
-- Using SECURITY DEFINER function to avoid recursion
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid()
    OR user_is_group_member(id, auth.uid())
  );

-- INSERT: Users can create groups
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Group creators can update their groups
CREATE POLICY "Group creators can update groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid());

-- DELETE: Group creators can delete their groups
CREATE POLICY "Group creators can delete groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());
