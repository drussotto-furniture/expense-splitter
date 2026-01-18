# Database Migration Notes

## Required Database Changes

To support the new deletion features, you need to add the `is_active` column to the `group_members` table in Supabase.

### SQL Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add is_active column to group_members table
ALTER TABLE group_members
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_group_members_is_active ON group_members(is_active);

-- Update existing records to be active (if any exist)
UPDATE group_members SET is_active = true WHERE is_active IS NULL;
```

### Alternative: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** > **Tables** > `group_members`
3. Click **Edit table** or **Add column**
4. Add a new column:
   - **Name**: `is_active`
   - **Type**: `boolean`
   - **Default value**: `true`
   - **Nullable**: No (uncheck)

### Verify Migration

After running the migration, verify it worked:

```sql
-- Check the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'group_members'
  AND column_name = 'is_active';

-- Check all existing members are active
SELECT COUNT(*) FROM group_members WHERE is_active = true;
```

## Features Implemented

### 1. Delete Expenses
- Users can delete their own expenses (only expenses they paid for)
- Confirmation dialog with expense description
- Cascades to delete all associated expense_splits
- Located in: `components/expenses/DeleteExpenseButton.tsx`

### 2. Delete Groups
- Only group creator (admin) can delete the group
- Shows warning with counts of affected data:
  - Number of expenses and splits
  - Number of members
  - Invitations
  - Settlements
- Cascades deletion in correct order to handle foreign key constraints
- Redirects to groups list after deletion
- Located in: `components/groups/DeleteGroupButton.tsx`

### 3. Remove Members (Soft Delete)
- Only group creator (admin) can remove members
- Cannot remove yourself
- **Soft delete approach**: Sets `is_active = false` instead of deleting
- Shows information about member's expense history
- Preserves all expense data for historical accuracy
- Located in: `components/groups/RemoveMemberButton.tsx`

### 4. UI Updates
- Inactive members show "(Inactive)" badge in:
  - Member list in group details
  - Expense split displays
- Inactive members are:
  - Filtered out from new expense splits
  - Grayed out in expense history
  - Still visible in past expenses
- Delete buttons only show for authorized users

## How It Works

### Soft Delete for Members
When a member is removed:
1. `group_members.is_active` is set to `false`
2. They won't appear in the "Split Between" list for new expenses
3. Their past expenses remain visible with "(Inactive)" label
4. Balances remain accurate for historical records
5. They can be re-invited if needed (will create a new membership record)

### Hard Delete for Expenses
When an expense is deleted:
1. All `expense_splits` for that expense are deleted first
2. Then the `expense` record is deleted
3. This removes the expense from balance calculations

### Cascade Delete for Groups
When a group is deleted (in order):
1. Get all expense IDs for the group
2. Delete all `expense_splits` for those expenses
3. Delete all `expenses` in the group
4. Delete all `settlements` in the group
5. Delete all `invitations` for the group
6. Delete all `group_members` in the group
7. Delete the `group` itself

## Security Notes

- All deletion operations require authentication
- Only expense creators can delete their own expenses
- Only group creators can delete groups or remove members
- RLS policies in Supabase should be configured to enforce these rules

## Next Steps

1. **Run the SQL migration** (see above)
2. **Test the features** in your development environment
3. **Update RLS policies** in Supabase if needed:
   ```sql
   -- Example: Allow users to soft-delete members if they're the group creator
   CREATE POLICY "Group creators can update members"
   ON group_members FOR UPDATE
   USING (
     EXISTS (
       SELECT 1 FROM groups
       WHERE groups.id = group_members.group_id
       AND groups.created_by = auth.uid()
     )
   );
   ```
4. **Consider adding an audit log** to track deletions for compliance

## Files Modified

- `types/index.ts` - Added `is_active` to GroupMember interface
- `components/expenses/DeleteExpenseButton.tsx` - New component
- `components/expenses/ExpenseList.tsx` - Added delete buttons and inactive member display
- `components/groups/DeleteGroupButton.tsx` - New component
- `components/groups/RemoveMemberButton.tsx` - New component
- `components/expenses/AddExpenseButton.tsx` - Filter inactive members from splits
- `app/groups/[id]/page.tsx` - Integrated all new components
