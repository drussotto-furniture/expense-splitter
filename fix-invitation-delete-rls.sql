-- Fix RLS policies to allow users to delete their own invitations

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own invitations" ON invitations;

-- Create new delete policy for invitations table
CREATE POLICY "Users can delete their own invitations"
ON invitations
FOR DELETE
TO authenticated
USING (invited_by = auth.uid());

-- Also add delete policy for friend_invitations table
DROP POLICY IF EXISTS "Users can delete their own friend invitations" ON friend_invitations;

CREATE POLICY "Users can delete their own friend invitations"
ON friend_invitations
FOR DELETE
TO authenticated
USING (inviter_id = auth.uid());

-- Verify policies are in place
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('invitations', 'friend_invitations')
AND cmd = 'DELETE'
ORDER BY tablename, policyname;
