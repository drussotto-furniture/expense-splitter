-- Add pending_splits column to expenses table to track splits for pending members
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS pending_splits JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN expenses.pending_splits IS 'Array of splits for pending members who haven''t signed up yet. Format: [{"email": "user@example.com", "amount": 10.50}]';
