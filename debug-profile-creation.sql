-- Debug profile creation issue

-- Check all current policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Check if the trigger function exists and has correct permissions
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'handle_new_user';

-- Check the trigger
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- Check if there are any auth users without profiles (there shouldn't be)
SELECT
  au.id,
  au.email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Try to see what would happen if we manually try to insert
-- (This will fail with the actual error)
-- First, check if tracycohn@gmail.com exists in auth.users
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'tracycohn@gmail.com';
