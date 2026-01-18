-- Check current invitations in both tables
SELECT
  'invitations' as table_name,
  id,
  invited_email,
  invited_by,
  status,
  created_at
FROM invitations
WHERE invited_by = '54d371e7-75c5-4e45-8a46-cb7b108ec6e9'
ORDER BY created_at DESC;

SELECT
  'friend_invitations' as table_name,
  id,
  invited_email,
  inviter_id,
  created_at
FROM friend_invitations
WHERE inviter_id = '54d371e7-75c5-4e45-8a46-cb7b108ec6e9'
ORDER BY created_at DESC;
