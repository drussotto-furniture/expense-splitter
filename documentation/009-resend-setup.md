# Resend Email Setup Guide

Follow these steps to set up email notifications for invitations:

## 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (it's free!)
3. Create your account

## 2. Get Your API Key

1. Once logged in, go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name like "Expense Splitter Development"
4. Select "Full Access" permission
5. Click "Create"
6. **Copy the API key** (you'll only see it once!)

## 3. Add API Key to Your App

1. Open `.env.local` file in your project
2. Replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   ```
3. Save the file

## 4. Restart Your Dev Server

After adding the API key, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C if running in foreground)
# Then restart:
npm run dev
```

## 5. Test It Out!

1. Go to a group in your app
2. Click "Invite Member"
3. Enter an email address (use your own email to test)
4. Click "Send Invitation"
5. Check your email inbox for the invitation!

## Important Notes

### Free Tier Limits
- Resend's free tier includes:
  - 3,000 emails per month
  - 100 emails per day
- Perfect for testing and small apps!

### Email "From" Address
Currently, the emails come from `onboarding@resend.dev` (Resend's test domain).

**For production**, you should:
1. Add your own domain in Resend dashboard
2. Verify DNS records
3. Update the `from` address in `/app/api/send-invitation/route.ts`:
   ```typescript
   from: 'Expense Splitter <invites@yourdomain.com>',
   ```

### Troubleshooting

If emails aren't sending:
1. Check the browser console for errors
2. Check your terminal/dev server logs
3. Verify your API key is correct in `.env.local`
4. Make sure you restarted the dev server after adding the key

## What Happens Now

When you invite someone:
1. An invitation is created in the database
2. An email is sent to the invited person
3. They can click the link in the email to sign up
4. Or if they already have an account, they can log in and see the invitation on the Invitations page

## Next Steps

Once this is working, you can:
- Customize the email template in `/app/api/send-invitation/route.ts`
- Add your own domain for professional-looking emails
- Deploy to production with Vercel
