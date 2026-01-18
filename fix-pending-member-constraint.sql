-- Fix the unique constraint to allow multiple pending members
-- The issue: UNIQUE(group_id, user_id) doesn't allow NULL user_id for pending members

-- Step 1: Drop the existing unique constraint
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_group_id_user_id_key;

-- Step 2: Create a partial unique index that only applies when user_id IS NOT NULL
-- This allows multiple pending members (with NULL user_id) but ensures unique active members
CREATE UNIQUE INDEX group_members_group_user_unique 
ON group_members(group_id, user_id) 
WHERE user_id IS NOT NULL;

-- Step 3: Update the trigger to use NULL user_id for pending members
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
    -- Create a pending member record with NULL user_id
    -- This avoids the unique constraint violation
    INSERT INTO group_members (group_id, user_id, pending_email, status, role, is_active)
    VALUES (
      NEW.group_id,
      NULL, -- Use NULL instead of invited_by to avoid unique constraint violation
      NEW.invited_email,
      'pending',
      'member',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_invitation_created ON invitations;
CREATE TRIGGER on_invitation_created
  AFTER INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_pending_member_on_invitation();
