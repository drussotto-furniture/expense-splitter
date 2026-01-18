-- Fix the pending members trigger to work with the new RLS policies
-- The trigger needs SECURITY DEFINER to bypass RLS checks

-- Recreate the trigger function with proper security
CREATE OR REPLACE FUNCTION create_pending_member_on_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a member record already exists for this email/group
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = NEW.group_id
    AND (pending_email = NEW.invited_email OR user_id IN (
      SELECT id FROM profiles WHERE email = NEW.invited_email
    ))
  ) THEN
    -- Create a pending member record
    -- Using SECURITY DEFINER allows this to bypass RLS
    INSERT INTO group_members (group_id, user_id, pending_email, status, role, is_active)
    VALUES (
      NEW.group_id,
      NEW.invited_by, -- Temporarily use inviter's ID, will be updated on acceptance
      NEW.invited_email,
      'pending',
      'member',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_invitation_created ON invitations;
CREATE TRIGGER on_invitation_created
  AFTER INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_pending_member_on_invitation();

-- Also update the invitation acceptance trigger
CREATE OR REPLACE FUNCTION activate_pending_member_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If invitation was accepted, update the pending member
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update the pending member to active and link to actual user
    UPDATE group_members
    SET
      user_id = (SELECT id FROM profiles WHERE email = NEW.invited_email LIMIT 1),
      status = 'active',
      pending_email = NULL,
      is_active = true
    WHERE group_id = NEW.group_id
      AND pending_email = NEW.invited_email
      AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_invitation_accepted ON invitations;
CREATE TRIGGER on_invitation_accepted
  AFTER UPDATE ON invitations
  FOR EACH ROW
  WHEN (NEW.status = 'accepted')
  EXECUTE FUNCTION activate_pending_member_on_acceptance();
