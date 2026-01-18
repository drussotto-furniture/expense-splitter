-- This script fixes the issue where existing groups disappeared after adding the pending members feature
-- The problem: the new RLS policy requires status = 'active', but existing records might not have this set

-- Step 1: Update all existing group_members that don't have a status set to 'active'
-- This will make your existing groups (like BVI) visible again
UPDATE group_members
SET status = 'active'
WHERE status IS NULL OR status = '';

-- Step 2: For any members with is_active = false, set their status to 'inactive'
-- This preserves the soft delete functionality we added earlier
UPDATE group_members
SET status = 'inactive'
WHERE is_active = false AND status = 'active';

-- Step 3: Verify the fix - this query should return your groups
-- Run this in Supabase SQL Editor to verify:
SELECT
  gm.id,
  gm.user_id,
  gm.group_id,
  gm.status,
  gm.is_active,
  g.name as group_name
FROM group_members gm
JOIN groups g ON gm.group_id = g.id
WHERE gm.status IN ('active', 'inactive')
ORDER BY gm.joined_at DESC;

-- Alternative fix: Update the RLS policy to be more permissive
-- This allows viewing groups even if status is not set or if they're inactive members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid()
      AND (status = 'active' OR status IS NULL OR is_active = true)
    )
    OR user_id = auth.uid()
  );
