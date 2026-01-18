-- Check if the user exists and their confirmation status
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  confirmation_sent_at
FROM auth.users
WHERE email = 'drussotto@hotmail.com';

-- Check if there's a profile for this user
SELECT
  id,
  email,
  full_name,
  created_at
FROM profiles
WHERE email = 'drussotto@hotmail.com';
