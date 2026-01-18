# Notification System Setup Guide

## Overview

This system provides **both email and in-app notifications** when users are added to groups. It handles two scenarios:

1. **Inviting a new user** (not in the system) - Creates an invitation + sends email
2. **Adding an existing user** - Adds them directly + sends notification email + creates in-app notification

## Files Created/Modified

### New Files

1. **[setup-notifications.sql](setup-notifications.sql)** - Database schema for notifications table
2. **[app/api/notify-member-added/route.ts](app/api/notify-member-added/route.ts)** - API endpoint for email notifications
3. **[components/notifications/NotificationBell.tsx](components/notifications/NotificationBell.tsx)** - In-app notification UI component

### Modified Files

1. **[components/groups/InviteMemberButton.tsx](components/groups/InviteMemberButton.tsx:147-166)** - Added notification logic for existing users
2. **[app/groups/page.tsx](app/groups/page.tsx:65)** - Added NotificationBell to header
3. **[app/groups/[id]/page.tsx](app/groups/[id]/page.tsx:105)** - Added NotificationBell to group detail page
4. **[types/index.ts](types/index.ts:102-112)** - Added Notification interface

## Setup Instructions

### 1. Run Database Migration

Run the SQL migration to create the notifications table and triggers:

```bash
# Connect to your Supabase database
psql <your-database-connection-string>

# Run the migration
\i setup-notifications.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `setup-notifications.sql`
3. Run the query

### 2. Verify Environment Variables

Ensure these are set in your `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### 3. Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as User A and create a group

3. Add User B (who already has an account) to the group:
   - Start typing their email in the "Invite Member" modal
   - Select them from the autocomplete suggestions
   - Click "Add Member"

4. Verify User B receives:
   - ✅ Email notification about being added
   - ✅ In-app notification (bell icon with badge)
   - ✅ Immediate access to the group

## How It Works

### For Existing Users

When you add an existing user via [InviteMemberButton.tsx](components/groups/InviteMemberButton.tsx:134-166):

1. **Database Insert** - User is added to `group_members` with `status: 'active'`
2. **Trigger Fires** - `notify_member_added()` function creates in-app notification
3. **Email Sent** - API call to `/api/notify-member-added` sends email
4. **Real-time Update** - NotificationBell updates via Supabase real-time subscription

### For New Users (Invitations)

When you invite a new user (email not in system):

1. **Invitation Created** - Record added to `invitations` table
2. **Email Sent** - Invitation email sent via `/api/send-invitation`
3. **User Signs Up** - New user creates account with that email
4. **Auto-Accept** - System matches email and adds them to group

## Features

### NotificationBell Component

Located in header of all authenticated pages:

- **Badge** - Shows unread count
- **Dropdown** - Click to view all notifications
- **Actions**:
  - Click notification → Navigate to linked page + mark as read
  - Check icon → Mark as read
  - X icon → Delete notification
  - "Mark all read" → Bulk mark all as read
- **Real-time** - Updates instantly via Supabase subscriptions

### Notification Types

Currently implemented:
- `group_added` - When added to a group

Future extensibility:
- `expense_added` - When new expense added
- `settlement_requested` - When payment requested
- `group_invitation` - When invited to join

### Email Templates

Two email templates:

1. **Invitation Email** ([send-invitation/route.ts](app/api/send-invitation/route.ts:28-60))
   - For users not in system
   - Includes sign-up link
   - Invitation message from sender

2. **Member Added Email** ([notify-member-added/route.ts](app/api/notify-member-added/route.ts:24-56))
   - For existing users
   - Direct link to group
   - Notification that they were added

## Database Schema

### notifications table

```sql
id            UUID PRIMARY KEY
user_id       UUID → auth.users(id)
type          TEXT (group_added | group_invitation | expense_added | settlement_requested)
title         TEXT
message       TEXT
link          TEXT (URL to navigate when clicked)
read          BOOLEAN (default: false)
created_at    TIMESTAMPTZ
metadata      JSONB (additional data like group_id, group_name)
```

### Triggers

1. **on_member_added** - Fires after INSERT on `group_members`
   - Creates notification for newly added active members
   - Includes group name and who added them

## Security (RLS Policies)

- ✅ Users can only view their own notifications
- ✅ Users can update their own notifications (mark as read)
- ✅ Users can delete their own notifications
- ✅ System (service role) can insert notifications

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Add existing user to group
- [ ] User receives email notification
- [ ] In-app notification appears with badge
- [ ] Click notification navigates to group
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Mark all read works
- [ ] Real-time updates work (add user in one browser, see notification in another)
- [ ] Invite new user (non-existing email) still works with old flow

## Troubleshooting

### No email received
- Check RESEND_API_KEY is set correctly
- Check Resend dashboard for delivery status
- Verify sender email domain is verified in Resend

### No in-app notification
- Check browser console for errors
- Verify notifications table exists in database
- Check RLS policies allow user to read notifications
- Test Supabase connection

### Trigger not firing
- Check database logs for trigger errors
- Verify trigger exists: `\d+ group_members` in psql
- Test function manually:
  ```sql
  SELECT notify_member_added();
  ```

## Future Enhancements

1. **Push Notifications** - Add browser push notifications
2. **Email Preferences** - Let users opt out of certain notifications
3. **Notification History** - Archive instead of delete
4. **Group Activity Feed** - Show all group activity in one place
5. **@Mentions** - Notify users when mentioned in comments
6. **Expense Notifications** - Notify when expenses are added/modified
7. **Settlement Reminders** - Periodic reminders for unpaid balances
