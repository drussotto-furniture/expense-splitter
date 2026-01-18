-- Check Tracy's group membership in the BVI group
SELECT
  gm.id,
  gm.group_id,
  gm.user_id,
  gm.pending_email,
  gm.status,
  gm.role,
  p.email as user_email,
  p.full_name as user_name,
  g.name as group_name
FROM group_members gm
LEFT JOIN profiles p ON gm.user_id = p.id
LEFT JOIN groups g ON gm.group_id = g.id
WHERE (gm.pending_email = 'tracycohn@gmail.com' OR p.email = 'tracycohn@gmail.com')
  AND g.name LIKE '%BVI%';

-- Check the invitation status
SELECT
  id,
  invited_email,
  status,
  created_at,
  group_id
FROM invitations
WHERE invited_email = 'tracycohn@gmail.com';
