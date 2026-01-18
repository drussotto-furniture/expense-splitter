-- Add 'shares' to the split_type check constraint
ALTER TABLE expenses
DROP CONSTRAINT expenses_split_type_check;

ALTER TABLE expenses
ADD CONSTRAINT expenses_split_type_check
CHECK (split_type IN ('equal', 'personal', 'custom', 'percentage', 'shares'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'expenses_split_type_check';
