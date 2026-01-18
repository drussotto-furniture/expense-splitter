-- Create activity log table for tracking all group changes
-- This provides an audit trail like Splitwise

-- Create enum for activity types
CREATE TYPE activity_type AS ENUM (
  'expense_created',
  'expense_updated',
  'expense_deleted',
  'member_invited',
  'member_removed',
  'member_accepted',
  'member_left',
  'group_updated',
  'settlement_created'
);

-- Create the activity log table
CREATE TABLE IF NOT EXISTS group_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_created_at ON group_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_activities_user_id ON group_activities(user_id);

-- Add RLS policies
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities in groups they are members of
CREATE POLICY "Users can view activities in their groups"
  ON group_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = true
    )
  );

-- Users can insert activities in groups they are members of
CREATE POLICY "Users can insert activities in their groups"
  ON group_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = true
    )
  );

-- Add comments for documentation
COMMENT ON TABLE group_activities IS 'Audit trail of all actions taken within a group';
COMMENT ON COLUMN group_activities.details IS 'JSON object containing action-specific details like expense amount, member email, etc.';
COMMENT ON COLUMN group_activities.user_id IS 'User who performed the action, NULL for system-generated events';
