-- Complete fix for pending members functionality
-- This script will:
-- 1. Add pending_member_id column to expense_splits
-- 2. Make user_id nullable
-- 3. Add foreign key constraint
-- 4. Add check constraint
-- 5. Add paid_by_pending_member to expenses table
-- 6. Make paid_by nullable
-- 7. Add check constraint for expenses

-- First, let's add the columns if they don't exist
DO $$
BEGIN
    -- Add pending_member_id to expense_splits if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'expense_splits'
        AND column_name = 'pending_member_id'
    ) THEN
        ALTER TABLE expense_splits
        ADD COLUMN pending_member_id UUID;
    END IF;

    -- Make user_id nullable in expense_splits
    ALTER TABLE expense_splits
    ALTER COLUMN user_id DROP NOT NULL;

    -- Add paid_by_pending_member to expenses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'expenses'
        AND column_name = 'paid_by_pending_member'
    ) THEN
        ALTER TABLE expenses
        ADD COLUMN paid_by_pending_member UUID;
    END IF;

    -- Make paid_by nullable in expenses
    ALTER TABLE expenses
    ALTER COLUMN paid_by DROP NOT NULL;
END $$;

-- Add foreign key constraint for expense_splits.pending_member_id
ALTER TABLE expense_splits
DROP CONSTRAINT IF EXISTS expense_splits_pending_member_id_fkey;

ALTER TABLE expense_splits
ADD CONSTRAINT expense_splits_pending_member_id_fkey
FOREIGN KEY (pending_member_id)
REFERENCES group_members(id)
ON DELETE CASCADE;

-- Add check constraint for expense_splits (either user_id or pending_member_id must be set)
ALTER TABLE expense_splits
DROP CONSTRAINT IF EXISTS check_user_or_pending;

ALTER TABLE expense_splits
ADD CONSTRAINT check_user_or_pending
CHECK (
  (user_id IS NOT NULL AND pending_member_id IS NULL) OR
  (user_id IS NULL AND pending_member_id IS NOT NULL)
);

-- Add foreign key constraint for expenses.paid_by_pending_member
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_paid_by_pending_member_fkey;

ALTER TABLE expenses
ADD CONSTRAINT expenses_paid_by_pending_member_fkey
FOREIGN KEY (paid_by_pending_member)
REFERENCES group_members(id)
ON DELETE SET NULL;

-- Add check constraint for expenses (either paid_by or paid_by_pending_member must be set)
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS check_payer_user_or_pending;

ALTER TABLE expenses
ADD CONSTRAINT check_payer_user_or_pending
CHECK (
  (paid_by IS NOT NULL AND paid_by_pending_member IS NULL) OR
  (paid_by IS NULL AND paid_by_pending_member IS NOT NULL)
);

-- Add comments for documentation
COMMENT ON COLUMN expense_splits.pending_member_id IS 'References group_members.id for pending members who do not have a user_id yet';
COMMENT ON COLUMN expenses.paid_by_pending_member IS 'References group_members.id for pending members who paid for the expense but do not have a user_id yet';
