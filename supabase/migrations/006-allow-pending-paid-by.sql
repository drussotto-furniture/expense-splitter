-- Allow expenses to be paid by pending members
-- First, make paid_by nullable
ALTER TABLE expenses
ALTER COLUMN paid_by DROP NOT NULL;

-- Add a paid_by_email column for pending members
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS paid_by_email TEXT;

-- Add check constraint to ensure either paid_by or paid_by_email is set
ALTER TABLE expenses
ADD CONSTRAINT paid_by_check CHECK (
  (paid_by IS NOT NULL AND paid_by_email IS NULL) OR
  (paid_by IS NULL AND paid_by_email IS NOT NULL)
);

-- Add comment for documentation
COMMENT ON COLUMN expenses.paid_by_email IS 'Email of pending member who paid for this expense (used when paid_by is NULL)';
