-- Allow pending members in expense splits
-- Add pending_member_id column to store group_members.id for pending members
ALTER TABLE expense_splits
ADD COLUMN IF NOT EXISTS pending_member_id UUID REFERENCES group_members(id) ON DELETE CASCADE;

-- Make user_id nullable since pending members won't have one
ALTER TABLE expense_splits
ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id or pending_member_id is set (but not both)
ALTER TABLE expense_splits
ADD CONSTRAINT check_user_or_pending
CHECK (
  (user_id IS NOT NULL AND pending_member_id IS NULL) OR
  (user_id IS NULL AND pending_member_id IS NOT NULL)
);

-- Add comment
COMMENT ON COLUMN expense_splits.pending_member_id IS 'References group_members.id for pending members who do not have a user_id yet';
