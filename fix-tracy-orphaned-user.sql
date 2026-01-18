-- Fix Tracy's orphaned auth user by creating the missing profile

-- First, get Tracy's auth user details
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'tracycohn@gmail.com';

-- Option 1: Create the missing profile manually
-- (Uncomment and run this if you want to fix the existing user)
/*
INSERT INTO public.profiles (id, email, full_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'tracycohn@gmail.com'
AND id NOT IN (SELECT id FROM profiles);
*/

-- Option 2: Delete the orphaned auth user so Tracy can sign up fresh
-- (Uncomment and run this if you want to let her sign up again)
/*
DELETE FROM auth.users
WHERE email = 'tracycohn@gmail.com';
*/

-- After running either option, verify the fix:
-- Check if profile exists
SELECT id, email, full_name, created_at
FROM profiles
WHERE email = 'tracycohn@gmail.com';

-- Check auth user
SELECT id, email, created_at
FROM auth.users
WHERE email = 'tracycohn@gmail.com';
