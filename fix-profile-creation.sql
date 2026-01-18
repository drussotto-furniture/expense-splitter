-- Fix profile creation issue by adding INSERT policy for profiles table
-- The trigger function uses SECURITY DEFINER which should bypass RLS,
-- but we should have an explicit INSERT policy for safety

-- Add INSERT policy for profiles (system-level user creation)
CREATE POLICY "Enable insert for authenticated users during signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify the policy is in place
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if Tracy's email already exists in profiles (it shouldn't)
SELECT id, email, full_name, created_at
FROM profiles
WHERE email = 'tracycohn@gmail.com';

-- Check the trigger function is still in place
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
