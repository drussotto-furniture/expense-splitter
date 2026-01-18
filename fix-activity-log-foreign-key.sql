-- Add foreign key constraint from group_activities to profiles
ALTER TABLE group_activities
DROP CONSTRAINT IF EXISTS group_activities_user_id_fkey;

ALTER TABLE group_activities
ADD CONSTRAINT group_activities_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- Force reload the schema cache
NOTIFY pgrst, 'reload schema';
