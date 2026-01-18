-- Add 'shares' as a new split type option for expenses
-- This allows splitting expenses by shares (e.g., person A gets 2 shares, person B gets 1 share)

-- Drop the existing check constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_split_type_check;

-- Add the new constraint with 'shares' included
ALTER TABLE expenses ADD CONSTRAINT expenses_split_type_check
  CHECK (split_type IN ('equal', 'personal', 'custom', 'percentage', 'shares'));

-- Add comment for documentation
COMMENT ON COLUMN expenses.split_type IS 'How the expense is split: equal (split evenly), personal (one person pays), custom (manual amounts), percentage (by percentage), shares (by share count)';
