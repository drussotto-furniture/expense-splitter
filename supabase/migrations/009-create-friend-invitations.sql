-- Create friend_invitations table for inviting people who don't have accounts yet
CREATE TABLE IF NOT EXISTS friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(inviter_id, invited_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friend_invitations_inviter ON friend_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_email ON friend_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_friend_invitations_status ON friend_invitations(status);

-- Enable RLS
ALTER TABLE friend_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own sent invitations
CREATE POLICY "Users can view their sent friend invitations"
  ON friend_invitations FOR SELECT
  USING (auth.uid() = inviter_id);

-- Policy: Users can see invitations sent to their email
CREATE POLICY "Users can view invitations to their email"
  ON friend_invitations FOR SELECT
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can create friend invitations
CREATE POLICY "Users can create friend invitations"
  ON friend_invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Policy: Users can update invitations sent to their email (to accept/decline)
CREATE POLICY "Users can update invitations to their email"
  ON friend_invitations FOR UPDATE
  USING (
    invited_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete their own sent invitations
CREATE POLICY "Users can delete their sent invitations"
  ON friend_invitations FOR DELETE
  USING (auth.uid() = inviter_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_friend_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_invitations_updated_at
  BEFORE UPDATE ON friend_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_invitations_updated_at();
