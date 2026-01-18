-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('group_added', 'group_invitation', 'expense_added', 'settlement_requested')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to navigate to when notification is clicked
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- Additional data like group_id, expense_id, etc.
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications (via service role)
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Function to create notification when member is added
CREATE OR REPLACE FUNCTION notify_member_added()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  added_by_name TEXT;
BEGIN
  -- Only notify for active members (not pending)
  IF NEW.status = 'active' AND NEW.user_id IS NOT NULL THEN
    -- Get group name
    SELECT name INTO group_name
    FROM groups
    WHERE id = NEW.group_id;

    -- Get the name of who added them (creator of the group or last modifier)
    SELECT COALESCE(p.full_name, p.email, 'Someone')
    INTO added_by_name
    FROM groups g
    LEFT JOIN profiles p ON p.id = g.created_by
    WHERE g.id = NEW.group_id;

    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      NEW.user_id,
      'group_added',
      'Added to ' || group_name,
      added_by_name || ' added you to the group "' || group_name || '"',
      '/groups/' || NEW.group_id,
      jsonb_build_object(
        'group_id', NEW.group_id,
        'group_name', group_name,
        'added_by', added_by_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for member additions
DROP TRIGGER IF EXISTS on_member_added ON group_members;
CREATE TRIGGER on_member_added
  AFTER INSERT ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_member_added();
