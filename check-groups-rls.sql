-- Check RLS policies on groups table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'groups'
ORDER BY cmd, policyname;
