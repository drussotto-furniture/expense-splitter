# Friends Management Feature

This document describes the friends management feature that has been added to the Expense Splitter app.

## Overview

The friends feature allows users to:
- Send friend requests to other users
- Accept or decline incoming friend requests
- View all their friends in one place
- Remove friends from their list
- Browse past collaborators to quickly add as friends
- Receive notifications when someone sends them a friend request

This feature is similar to how Splitwise manages friends, making it easier to split expenses with people you frequently collaborate with.

## Database Schema

### Friends Table

```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),      -- User who sent the request
  friend_id UUID REFERENCES profiles(id),    -- User who received the request
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);
```

### Notification Types

The `friend_request` notification type has been added to the notifications system:
- **Type**: `friend_request`
- **Title**: "New Friend Request"
- **Message**: "{Name} sent you a friend request"
- **Link**: `/friends`

## File Structure

### Pages
- **`app/friends/page.tsx`**: Main friends page showing accepted friends, pending requests (received), and sent requests

### Components
- **`components/friends/FriendCard.tsx`**: Displays individual friend cards with accept/decline/remove actions
- **`components/friends/AddFriendButton.tsx`**: Modal for adding friends with search and browse tabs
- **`components/friends/RemoveFriendButton.tsx`**: Confirmation modal for removing friends

### Types
- **`types/index.ts`**: Added `Friend` interface and updated `Notification` type

### Database
- **`migrations/add-friends-feature.sql`**: Complete migration to add the friends feature
- **`supabase-schema.sql`**: Updated with friends table schema
- **`setup-notifications.sql`**: Updated with friend_request notification trigger

## Features

### 1. Friends List Page (`/friends`)

The friends page shows:
- **Pending Friend Requests (Received)**: Requests you need to respond to
  - Accept button (green)
  - Decline button (red)
- **Sent Requests**: Requests you've sent that are waiting for response
  - Cancel Request button
- **Your Friends**: All accepted friendships
  - Friend since date
  - Remove button

### 2. Add Friend Button

Two ways to add friends:

**Search Tab:**
- Type email or name to search for users
- Auto-complete suggestions as you type
- Shows users from across the platform

**Browse Tab:**
- Shows all users you've worked with in groups
- Filters out existing friends
- One-click to send friend request

### 3. Friend Request Flow

1. User A sends friend request to User B
   - Request created with status='pending'
   - Notification sent to User B

2. User B sees the request in their "Pending Friend Requests" section
   - Can Accept: status changes to 'accepted'
   - Can Decline: request is deleted

3. Both users can now see each other in their friends list

### 4. Removing Friends

- Click "Remove" button on any friend card
- Confirmation modal appears with warning
- Friend connection is deleted (can be re-added later)

## Navigation

The Friends link has been added to the header navigation on:
- **Groups page** (`/groups`)
- **Friends page** (`/friends`)

The link appears between the main title and the Notifications bell.

## Row Level Security (RLS)

All RLS policies have been configured:

```sql
-- Users can view their own friends and requests
SELECT: user_id = auth.uid() OR friend_id = auth.uid()

-- Users can create friend requests
INSERT: user_id = auth.uid()

-- Users can update requests they received
UPDATE: friend_id = auth.uid()

-- Users can delete their own connections
DELETE: user_id = auth.uid() OR friend_id = auth.uid()
```

## Installation

1. Run the migration:
   ```bash
   psql YOUR_DATABASE_URL -f migrations/add-friends-feature.sql
   ```

   Or in Supabase dashboard:
   - Go to SQL Editor
   - Copy the contents of `migrations/add-friends-feature.sql`
   - Run the SQL

2. The friends feature is now available at `/friends`

## Usage Examples

### Accessing the Friends Page
Navigate to the Friends page by clicking the "Friends" link in the header, or go directly to `/friends`.

### Adding a Friend
1. Click "Add Friend" button
2. Choose Search or Browse tab
3. Select a user or type their email
4. Click "Send Request"

### Responding to Friend Requests
1. Go to `/friends`
2. See pending requests at the top
3. Click "Accept" or "Decline"

### Removing a Friend
1. Find the friend in your list
2. Click "Remove"
3. Confirm in the modal

## Technical Notes

### Bidirectional Relationships

Friendships are stored unidirectionally in the database:
- `user_id` = requester
- `friend_id` = recipient

The UI handles both directions when querying:
```typescript
// Query for friends where current user is EITHER user_id OR friend_id
const sentFriends = await supabase
  .from('friends')
  .select('*, profile:profiles!friends_friend_id_fkey(*)')
  .eq('user_id', user.id)
  .eq('status', 'accepted')

const receivedFriends = await supabase
  .from('friends')
  .select('*, profile:profiles!friends_user_id_fkey(*)')
  .eq('friend_id', user.id)
  .eq('status', 'accepted')
```

### Notifications

Friend request notifications are created automatically via database trigger:
- Trigger: `on_friend_request`
- Function: `notify_friend_request()`
- Fires: AFTER INSERT on friends table
- Creates notification for the recipient when status='pending'

### Future Enhancements

Potential improvements for the future:
- Email notifications for friend requests
- Mutual friends count
- Friend suggestions based on common groups
- Bulk friend requests
- Friend request expiration
- Block/unblock functionality
- Friend activity feed

## Troubleshooting

**Friend request not showing up:**
- Check that the user exists in the system
- Verify RLS policies are correctly applied
- Check notifications table for the notification

**Cannot accept friend request:**
- Verify you're logged in as the recipient (friend_id)
- Check RLS UPDATE policy allows friend_id to update

**Duplicate friend request error:**
- Check for existing friendship in both directions
- Clear declined requests if you want to re-request

## Integration with Groups

The friends feature integrates well with the existing groups functionality:
- The "Browse" tab shows users you've worked with in groups
- This makes it easy to add frequent collaborators as friends
- Future enhancement: Quickly add friends to groups
