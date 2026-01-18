-- Fix the invitations SELECT policy to properly match invited users

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view invitations for their groups" ON invitations;

-- Recreate with better logic
CREATE POLICY "Users can view invitations for their groups"
  ON invitations FOR SELECT
  USING (
    -- Users can see invitations for groups they're members of
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
    OR
    -- Users can see invitations sent to their email
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Verify the policy
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'invitations'
AND policyname = 'Users can view invitations for their groups';
