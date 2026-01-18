# Database Migrations

This directory contains all database migrations for the Expense Splitter application. Migrations should be run in numerical order.

## Migration Order

1. **001-initial-schema.sql** - Creates the base schema including profiles, groups, expenses, friends, and all core tables with RLS policies
2. **002-setup-storage.sql** - Sets up the storage bucket for receipt uploads
3. **003-setup-notifications.sql** - Creates notifications table and triggers for in-app notifications
4. **004-add-pending-members.sql** - Adds pending member support to group_members table
5. **005-add-pending-splits.sql** - Adds pending_splits JSONB column to expenses table
6. **006-allow-pending-paid-by.sql** - Allows expenses to be paid by pending members (adds paid_by_email)
7. **007-create-activity-log.sql** - Creates activity log for audit trail
8. **008-add-shares-split-type.sql** - Adds 'shares' as a split type option
9. **009-create-friend-invitations.sql** - Creates friend_invitations table for inviting non-users
10. **010-unify-invitation-system.sql** - Unifies friend and group invitations with auto-friendship creation
11. **011-fix-pending-members-complete.sql** - Completes pending member support with proper foreign keys
12. **012-fix-foreign-keys.sql** - Fixes foreign key constraints in group_activities table
13. **013-fix-rls-recursion.sql** - Fixes RLS recursion issues with user_groups view
14. **014-fix-storage-bucket-public.sql** - Makes receipts bucket public for easier image viewing

## Applying Migrations

If using Supabase CLI:
```bash
supabase db push
```

Or apply migrations manually in order using the Supabase dashboard SQL editor.

## Notes

- All migrations are idempotent where possible (use `IF NOT EXISTS`, `DROP IF EXISTS`)
- RLS is enabled on all user-facing tables
- Indexes are created for commonly queried columns
- Foreign keys use appropriate CASCADE/SET NULL behaviors
