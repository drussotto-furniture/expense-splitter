-- Add pending_splits column to expenses table
-- This stores split information for pending members who don't have user_id yet
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS pending_splits JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN expenses.pending_splits IS 'Stores split amounts for pending members as JSON array: [{"member_id": "uuid", "amount": 100.50}]';
