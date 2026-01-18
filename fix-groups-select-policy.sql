-- Fix groups SELECT policy to allow users to see groups they have invitations for

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their groups" ON groups;

-- Recreate with updated logic that includes pending invitations
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  USING (
    -- Group creators can see their groups
    created_by = auth.uid()
    OR
    -- Active members can see their groups
    user_is_group_member(id, auth.uid())
    OR
    -- Users with pending invitations can see the group
    id IN (
      SELECT group_id FROM invitations
      WHERE invited_email IN (SELECT email FROM profiles WHERE id = auth.uid())
      AND status = 'pending'
    )
  );

-- Verify the policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'groups'
AND policyname = 'Users can view their groups';
