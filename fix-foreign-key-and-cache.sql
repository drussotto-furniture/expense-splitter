-- Drop and recreate the foreign key constraint to ensure it's properly registered
-- This will fix the "Could not find a relationship" error

-- Drop existing constraint if it exists
ALTER TABLE expense_splits
DROP CONSTRAINT IF EXISTS expense_splits_pending_member_id_fkey;

-- Recreate the constraint
ALTER TABLE expense_splits
ADD CONSTRAINT expense_splits_pending_member_id_fkey
FOREIGN KEY (pending_member_id)
REFERENCES group_members(id)
ON DELETE CASCADE;

-- Force reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'expense_splits'
    AND kcu.column_name = 'pending_member_id';
