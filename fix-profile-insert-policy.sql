-- The issue is that the INSERT policy requires auth.uid() = id
-- But during signup, the user isn't authenticated yet when the trigger runs
-- The trigger uses SECURITY DEFINER which should bypass RLS, but let's make sure

-- Drop the incorrect INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON profiles;

-- Check what policies exist now
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Verify the trigger function uses SECURITY DEFINER
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'handle_new_user';

-- Let's try a different approach: make the function more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$;

-- Verify the trigger is still in place
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
