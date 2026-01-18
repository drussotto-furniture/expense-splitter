-- Fix RLS policies and refresh schema cache for pending members

-- Step 1: Update RLS policy for expenses to allow pending_by_pending_member
DROP POLICY IF EXISTS "Users can insert expenses in their groups" ON expenses;
CREATE POLICY "Users can insert expenses in their groups"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update expenses they created" ON expenses;
CREATE POLICY "Users can update expenses they created"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    paid_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.id = expenses.paid_by_pending_member
      AND group_members.group_id = expenses.group_id
      AND EXISTS (
        SELECT 1 FROM group_members gm2
        WHERE gm2.group_id = expenses.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.is_active = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete expenses they created" ON expenses;
CREATE POLICY "Users can delete expenses they created"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    paid_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.id = expenses.paid_by_pending_member
      AND group_members.group_id = expenses.group_id
      AND EXISTS (
        SELECT 1 FROM group_members gm2
        WHERE gm2.group_id = expenses.group_id
        AND gm2.user_id = auth.uid()
        AND gm2.is_active = true
      )
    )
  );

-- Step 2: Ensure expense_splits RLS policies allow pending members
DROP POLICY IF EXISTS "Users can view splits in their groups" ON expense_splits;
CREATE POLICY "Users can view splits in their groups"
  ON expense_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      JOIN group_members ON group_members.group_id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can insert splits in their groups" ON expense_splits;
CREATE POLICY "Users can insert splits in their groups"
  ON expense_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses
      JOIN group_members ON group_members.group_id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update splits they created" ON expense_splits;
CREATE POLICY "Users can update splits they created"
  ON expense_splits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_splits.expense_id
      AND (
        expenses.paid_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.id = expenses.paid_by_pending_member
          AND EXISTS (
            SELECT 1 FROM group_members gm2
            WHERE gm2.group_id = expenses.group_id
            AND gm2.user_id = auth.uid()
            AND gm2.is_active = true
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete splits they created" ON expense_splits;
CREATE POLICY "Users can delete splits they created"
  ON expense_splits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_splits.expense_id
      AND (
        expenses.paid_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.id = expenses.paid_by_pending_member
          AND EXISTS (
            SELECT 1 FROM group_members gm2
            WHERE gm2.group_id = expenses.group_id
            AND gm2.user_id = auth.uid()
            AND gm2.is_active = true
          )
        )
      )
    )
  );

-- Step 3: Notify Supabase to reload schema cache
-- This is done by running: NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
