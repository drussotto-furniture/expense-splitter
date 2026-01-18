-- Allow pending members to be expense payers
-- Add paid_by_pending_member column to store group_members.id for pending members
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS paid_by_pending_member UUID REFERENCES group_members(id) ON DELETE SET NULL;

-- Make paid_by nullable since pending members might pay
ALTER TABLE expenses
ALTER COLUMN paid_by DROP NOT NULL;

-- Add a check constraint to ensure either paid_by or paid_by_pending_member is set (but not both)
ALTER TABLE expenses
ADD CONSTRAINT check_payer_user_or_pending
CHECK (
  (paid_by IS NOT NULL AND paid_by_pending_member IS NULL) OR
  (paid_by IS NULL AND paid_by_pending_member IS NOT NULL)
);

-- Add comment
COMMENT ON COLUMN expenses.paid_by_pending_member IS 'References group_members.id for pending members who paid but do not have a user_id yet';
