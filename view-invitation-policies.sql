-- View RLS policies for invitations table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'invitations'
ORDER BY cmd, policyname;
