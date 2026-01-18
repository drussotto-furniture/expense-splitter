-- Get Tracy's invitation details
SELECT
  invitations.id,
  invitations.invited_email,
  invitations.group_id,
  invitations.status,
  invitations.created_at,
  groups.name as group_name
FROM invitations
JOIN groups ON invitations.group_id = groups.id
WHERE invitations.invited_email = 'tracycohn@gmail.com'
AND invitations.invited_by = '54d371e7-75c5-4e45-8a46-cb7b108ec6e9'
ORDER BY invitations.created_at DESC
LIMIT 1;
