-- Migration: Add Friends Feature (Safe Version)
-- This migration safely adds the friends management functionality
-- It will not fail if some elements already exist

-- 1. Create the friends table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 2. Enable RLS on friends table (safe to run multiple times)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their friends and friend requests" ON friends;
CREATE POLICY "Users can view their friends and friend requests"
  ON friends FOR SELECT
  USING (
    user_id = auth.uid() OR friend_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create friend requests" ON friends;
CREATE POLICY "Users can create friend requests"
  ON friends FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update friend requests they received" ON friends;
CREATE POLICY "Users can update friend requests they received"
  ON friends FOR UPDATE
  USING (friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own friend connections" ON friends;
CREATE POLICY "Users can delete their own friend connections"
  ON friends FOR DELETE
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- 4. Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- 5. Update notifications table to support friend_request type
-- Note: This assumes notifications table already exists from setup-notifications.sql

-- First, drop the existing constraint if it exists
DO $$
BEGIN
  -- Drop constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

-- Add the new constraint with friend_request included
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('group_added', 'group_invitation', 'expense_added', 'settlement_requested', 'friend_request'));

-- 6. Create function to notify when friend request is sent
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
BEGIN
  -- Only notify for pending friend requests
  IF NEW.status = 'pending' THEN
    -- Get requester's name
    SELECT COALESCE(p.full_name, p.email, 'Someone')
    INTO requester_name
    FROM profiles p
    WHERE p.id = NEW.user_id;

    -- Create notification for the friend (recipient)
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.friend_id,
      'friend_request',
      'New Friend Request',
      requester_name || ' sent you a friend request',
      '/friends',
      jsonb_build_object(
        'friend_request_id', NEW.id,
        'requester_id', NEW.user_id,
        'requester_name', requester_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for friend requests (drop first if exists)
DROP TRIGGER IF EXISTS on_friend_request ON friends;
CREATE TRIGGER on_friend_request
  AFTER INSERT ON friends
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

-- Migration complete!
-- The friends feature is now fully set up and ready to use.
