-- Drop existing invitations policies
DROP POLICY IF EXISTS "Users can view invitations for their groups" ON invitations;
DROP POLICY IF EXISTS "Group admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Invited users can update invitation status" ON invitations;

-- SELECT: Users can view invitations for groups they created OR invitations sent to their email
CREATE POLICY "Users can view relevant invitations"
  ON invitations FOR SELECT
  USING (
    -- Can view invitations for groups they created
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
    -- OR invitations sent to their email
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- INSERT: Group creators can create invitations
CREATE POLICY "Group creators can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- UPDATE: Invited users can update invitation status (accept/decline)
-- Group creators can also update invitations
CREATE POLICY "Users can update invitations"
  ON invitations FOR UPDATE
  USING (
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );
