-- Check Tracy's profile
SELECT id, email, full_name, created_at
FROM profiles
WHERE email = 'tracycohn@gmail.com';

-- Check invitations for Tracy's email
SELECT
  invitations.id,
  invitations.invited_email,
  invitations.group_id,
  invitations.status,
  invitations.created_at,
  invitations.invited_by,
  groups.name as group_name
FROM invitations
LEFT JOIN groups ON invitations.group_id = groups.id
WHERE invitations.invited_email = 'tracycohn@gmail.com'
ORDER BY invitations.created_at DESC;

-- Check if there's a case sensitivity issue
SELECT
  invitations.id,
  invitations.invited_email,
  invitations.group_id,
  invitations.status,
  invitations.created_at,
  groups.name as group_name
FROM invitations
LEFT JOIN groups ON invitations.group_id = groups.id
WHERE LOWER(invitations.invited_email) = LOWER('tracycohn@gmail.com')
ORDER BY invitations.created_at DESC;
