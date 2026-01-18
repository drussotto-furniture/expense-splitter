-- Check RLS policies for invitations table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invitations'
ORDER BY cmd, policyname;

-- Test if Tracy can see her invitation directly
-- Replace with Tracy's user ID
SELECT
  id,
  invited_email,
  group_id,
  status,
  created_at
FROM invitations
WHERE invited_email = 'tracycohn@gmail.com'
AND status = 'pending';
