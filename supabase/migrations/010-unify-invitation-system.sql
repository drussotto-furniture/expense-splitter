-- Unified Invitation System Migration
-- This consolidates friend and group invitations into a single system

-- Step 1: Create function to auto-create friendships when group invitations are accepted
CREATE OR REPLACE FUNCTION create_friendship_on_invitation_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  inviter_id UUID;
  invited_user_id UUID;
BEGIN
  -- Only process when invitation status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    -- Get the inviter ID
    inviter_id := NEW.invited_by;

    -- Get the invited user's ID from their email
    SELECT id INTO invited_user_id
    FROM profiles
    WHERE email = NEW.invited_email
    LIMIT 1;

    -- If both users exist, create bidirectional friendship
    IF inviter_id IS NOT NULL AND invited_user_id IS NOT NULL AND inviter_id != invited_user_id THEN
      -- Create friendship (inviter -> invited)
      INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
      VALUES (inviter_id, invited_user_id, 'accepted', NOW(), NOW())
      ON CONFLICT (user_id, friend_id)
      DO UPDATE SET status = 'accepted', updated_at = NOW();

      -- Create reverse friendship (invited -> inviter)
      INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
      VALUES (invited_user_id, inviter_id, 'accepted', NOW(), NOW())
      ON CONFLICT (user_id, friend_id)
      DO UPDATE SET status = 'accepted', updated_at = NOW();

      RAISE NOTICE 'Friendship created between % and %', inviter_id, invited_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on invitations table
DROP TRIGGER IF EXISTS auto_create_friendship_on_acceptance ON invitations;
CREATE TRIGGER auto_create_friendship_on_acceptance
  AFTER UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_friendship_on_invitation_acceptance();

-- Step 2: Create function to auto-create friendships when users sign up with pending friend_invitations
CREATE OR REPLACE FUNCTION convert_friend_invitations_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new profile is created, check for pending friend invitations to their email

  -- Create friendships for all pending friend invitations (inviter -> new user)
  INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
  SELECT inviter_id, NEW.id, 'accepted', NOW(), NOW()
  FROM friend_invitations
  WHERE invited_email = NEW.email
    AND status = 'pending'
  ON CONFLICT (user_id, friend_id)
  DO UPDATE SET status = 'accepted', updated_at = NOW();

  -- Create reverse friendships (new user -> inviter)
  INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
  SELECT NEW.id, inviter_id, 'accepted', NOW(), NOW()
  FROM friend_invitations
  WHERE invited_email = NEW.email
    AND status = 'pending'
  ON CONFLICT (user_id, friend_id)
  DO UPDATE SET status = 'accepted', updated_at = NOW();

  -- Mark friend invitations as accepted
  UPDATE friend_invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE invited_email = NEW.email
    AND status = 'pending';

  RAISE NOTICE 'Converted friend invitations for %', NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_convert_invitations ON profiles;
CREATE TRIGGER on_profile_created_convert_invitations
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION convert_friend_invitations_on_signup();

-- Step 3: Backfill existing data - create friendships from accepted invitations
-- This is a one-time migration for existing accepted invitations

-- Create friendships from accepted group invitations (inviter -> invited)
INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
SELECT DISTINCT
  i.invited_by as user_id,
  p.id as friend_id,
  'accepted' as status,
  COALESCE(i.created_at, NOW()) as created_at,
  NOW() as updated_at
FROM invitations i
JOIN profiles p ON LOWER(p.email) = LOWER(i.invited_email)
WHERE i.status = 'accepted'
  AND i.invited_by IS NOT NULL
  AND p.id IS NOT NULL
  AND i.invited_by != p.id  -- Don't create self-friendships
  AND NOT EXISTS (
    SELECT 1 FROM friends f
    WHERE f.user_id = i.invited_by
      AND f.friend_id = p.id
  )
ON CONFLICT (user_id, friend_id)
DO UPDATE SET status = 'accepted', updated_at = NOW();

-- Create reverse friendships (invited -> inviter)
INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
SELECT DISTINCT
  p.id as user_id,
  i.invited_by as friend_id,
  'accepted' as status,
  COALESCE(i.created_at, NOW()) as created_at,
  NOW() as updated_at
FROM invitations i
JOIN profiles p ON LOWER(p.email) = LOWER(i.invited_email)
WHERE i.status = 'accepted'
  AND i.invited_by IS NOT NULL
  AND p.id IS NOT NULL
  AND i.invited_by != p.id  -- Don't create self-friendships
  AND NOT EXISTS (
    SELECT 1 FROM friends f
    WHERE f.user_id = p.id
      AND f.friend_id = i.invited_by
  )
ON CONFLICT (user_id, friend_id)
DO UPDATE SET status = 'accepted', updated_at = NOW();

-- Output summary
DO $$
DECLARE
  friendship_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO friendship_count FROM friends WHERE status = 'accepted';
  RAISE NOTICE 'Migration complete. Total accepted friendships: %', friendship_count;
END $$;
