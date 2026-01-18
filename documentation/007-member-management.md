# Member Management Updates

## Summary

Fixed two issues with the member management system:

1. **Pending member removal** - Can now properly remove/cancel pending member invitations
2. **Member browsing** - Added a "Browse Members" tab to easily add existing users from a list

## Changes Made

### 1. Fixed Pending Member Removal

**Files Modified:**
- [components/groups/RemoveMemberButton.tsx](components/groups/RemoveMemberButton.tsx)
- [app/groups/[id]/page.tsx](app/groups/[id]/page.tsx:188-202)

**What Was Fixed:**
- Remove button now shows for pending members
- Pending members are **deleted** (not soft-deleted) since they have no expense history
- Active members are **soft-deleted** (marked inactive) to preserve expense history
- Updated UI message for pending members: "cancel the invitation for" instead of "remove"

**Key Changes:**
```typescript
// RemoveMemberButton now accepts isPending prop
interface RemoveMemberButtonProps {
  memberId: string
  memberName: string
  userId: string | null  // Can be null for pending members
  groupId: string
  isPending?: boolean
}

// Different deletion logic based on status
if (isPending) {
  // Delete entirely (no expense history)
  await supabase.from('group_members').delete().eq('id', memberId)
} else {
  // Soft delete (preserve expense history)
  await supabase.from('group_members')
    .update({ is_active: false, status: 'inactive' })
    .eq('id', memberId)
}
```

### 2. Enhanced Member Invitation with Browse Tab

**File Modified:**
- [components/groups/InviteMemberButton.tsx](components/groups/InviteMemberButton.tsx)

**New Features:**

#### Tabbed Interface
- **"Search / Invite" tab**: Original functionality - search or enter email
- **"Browse Members" tab**: See all users you've worked with in a scrollable list

#### Browse Members Tab
- Loads all users you've worked with in other groups
- Filters out current group members automatically
- Filters out pending invitations
- Click a user to instantly add them to the group
- Auto-sends email + in-app notification

#### Smart Filtering
The browse list excludes:
- Current group members (active)
- Pending invitations
- The current user
- Inactive members

**UI Improvements:**
- Clean tabbed interface
- Scrollable user list (max height 400px)
- Loading state while fetching users
- Empty state when no users available
- One-click adding from browse list

## How to Use

### Adding an Existing Member

**Option 1: Search Tab (Original)**
1. Click "Invite Member" button
2. Start typing a name or email
3. Select from autocomplete suggestions OR enter any email
4. Click "Add Member"

**Option 2: Browse Tab (New)**
1. Click "Invite Member" button
2. Click "Browse Members" tab
3. Scroll through the list of users you've worked with
4. Click any user to instantly add them

### Removing a Pending Member

1. Find the pending member (shows "Pending" badge)
2. Click the remove button (X icon)
3. Confirm cancellation
4. Invitation is deleted (can be resent later)

### Removing an Active Member

1. Find the active member
2. Click the remove button (X icon)
3. Review expense warning (if they have expenses)
4. Confirm removal
5. Member is marked inactive (expense history preserved)

## Technical Details

### Member States

```typescript
// Pending member (invitation sent)
{
  status: 'pending',
  is_active: true,
  user_id: null,
  pending_email: 'user@example.com'
}

// Active member
{
  status: 'active',
  is_active: true,
  user_id: 'uuid',
  pending_email: null
}

// Removed member
{
  status: 'inactive',
  is_active: false,
  user_id: 'uuid',
  pending_email: null
}
```

### Browse Members Query

```typescript
// Fetch all users from any group you're in
const { data: pastMembers } = await supabase
  .from('group_members')
  .select(`
    user_id,
    profiles!inner (id, email, full_name)
  `)
  .neq('user_id', currentUser.id)
  .eq('is_active', true)
  .eq('status', 'active')

// Filter out current group members
// Deduplicate by user ID
// Return sorted list
```

## Benefits

### For Users
- **Faster member adding**: Browse and click instead of typing
- **Discoverability**: See all available users at once
- **Proper pending member management**: Can cancel invitations cleanly
- **Clear visual distinction**: Pending vs Active vs Inactive members

### For System
- **Clean data**: Pending members deleted (no orphaned records)
- **Preserved history**: Active members soft-deleted
- **Better UX**: Clear separation of search vs browse
- **Automatic filtering**: No duplicate adds, no re-adding removed members

## Testing Checklist

- [x] Browse tab loads users correctly
- [x] Browse tab filters out current members
- [x] Browse tab filters out pending invitations
- [x] Click user in browse list adds them instantly
- [x] Email notification sent when adding from browse
- [x] In-app notification created when adding from browse
- [x] Pending member shows remove button
- [x] Clicking remove on pending member deletes them
- [x] Pending member can be re-invited after removal
- [x] Active member shows remove button
- [x] Clicking remove on active member soft-deletes them
- [x] Removed active member shows "Inactive" badge
- [x] Removed active member doesn't show remove button
- [x] Search tab still works for new emails
- [x] Search tab autocomplete still works

## Future Enhancements

1. **Search within browse list**: Add filter input for long user lists
2. **Group by recent activity**: Sort by last interaction
3. **Bulk add**: Select multiple users at once
4. **User avatars**: Show profile pictures in browse list
5. **Re-activate removed members**: Add button to re-activate inactive members
6. **Member roles in browse**: Show what role they had in previous groups
