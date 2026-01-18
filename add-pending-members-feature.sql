-- Add a status column to group_members to track pending invitations
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'pending', 'inactive'));

-- Add an email column to group_members for pending members who haven't signed up yet
ALTER TABLE group_members
ADD COLUMN IF NOT EXISTS pending_email TEXT;

-- Update existing members to have 'active' status
UPDATE group_members SET status = 'active' WHERE status IS NULL;

-- Create a function to create pending member when invitation is sent
CREATE OR REPLACE FUNCTION create_pending_member_on_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a member record already exists for this email/group
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = NEW.group_id
    AND pending_email = NEW.invited_email
  ) THEN
    -- Create a pending member record
    INSERT INTO group_members (group_id, user_id, pending_email, status, role)
    VALUES (
      NEW.group_id,
      NEW.invited_by, -- Temporarily use inviter's ID, will be updated on acceptance
      NEW.invited_email,
      'pending',
      'member'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create pending member when invitation is sent
DROP TRIGGER IF EXISTS on_invitation_created ON invitations;
CREATE TRIGGER on_invitation_created
  AFTER INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_pending_member_on_invitation();

-- Update invitation acceptance to activate the pending member
CREATE OR REPLACE FUNCTION activate_pending_member_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If invitation was accepted, update the pending member
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update the pending member to active and link to actual user
    UPDATE group_members
    SET
      user_id = auth.uid(),
      status = 'active',
      pending_email = NULL
    WHERE group_id = NEW.group_id
      AND pending_email = NEW.invited_email
      AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation acceptance
DROP TRIGGER IF EXISTS on_invitation_accepted ON invitations;
CREATE TRIGGER on_invitation_accepted
  AFTER UPDATE ON invitations
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION activate_pending_member_on_acceptance();

-- Update RLS policy to allow viewing pending members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR user_id = auth.uid()
  );

-- Update expense_splits to allow NULL user_id for pending members (will be filled in later)
-- This is already flexible enough since we're inserting the actual user_id
