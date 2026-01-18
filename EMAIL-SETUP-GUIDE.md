# Email Setup Guide for Carvalytics.com

## Overview
This guide covers setting up two types of emails:
1. **Supabase Confirmation Emails** - For new user signups
2. **Resend Invitation Emails** - For inviting users to groups

---

## Part 1: Supabase Email Confirmation

### Step 1: Configure Supabase Site URL
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ailtlnipedjaeorwqmxf`
3. Go to **Authentication** → **URL Configuration**
4. Update:
   - **Site URL**: `https://carvalytics.com`
   - **Redirect URLs**: Add `https://carvalytics.com/**`
5. Click **Save**

### Step 2: Enable Email Confirmations
1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Email**
2. Make sure these are configured:
   - **Enable email provider**: ✅ ON
   - **Confirm email**: ✅ ON (if you want users to verify email before access)
   - **Secure email change**: ✅ ON (recommended)
3. Click **Save**

### Step 3: Customize Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. You can customize:
   - **Confirm signup** - Sent to new users
   - **Invite user** - Sent when you invite via Supabase
   - **Magic Link** - For passwordless login
   - **Change Email Address** - For email changes
   - **Reset Password** - For password resets

3. In each template, update the variables:
   - `{{ .SiteURL }}` will now be `https://carvalytics.com`
   - `{{ .ConfirmationURL }}` will link to your domain

### Step 4: Configure SMTP (Optional - for custom emails)
By default, Supabase sends emails from their domain. For production:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider (e.g., SendGrid, AWS SES, or use Resend's SMTP)

**Using Resend SMTP:**
- Host: `smtp.resend.com`
- Port: `587` or `465`
- Username: `resend`
- Password: Your Resend API Key
- Sender Email: `noreply@carvalytics.com`

---

## Part 2: Resend Setup for Invitation Emails

### Step 1: Add Your Domain to Resend
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `carvalytics.com`
4. Resend will show DNS records to add

### Step 2: Add DNS Records in GoDaddy
Log into GoDaddy and add these records (Resend will provide exact values):

#### TXT Record (Domain Verification):
- **Type:** TXT
- **Name:** `@`
- **Value:** `resend-verify=xxxxx` (copy from Resend)
- **TTL:** 600

#### MX Records (Optional - only if you want to receive emails):
- **Type:** MX
- **Name:** `@`
- **Priority:** 10
- **Value:** `mx.resend.com`

#### DKIM Records (Email Authentication):
Resend will provide 3 DKIM records like:

1. **Type:** TXT
   - **Name:** `resend._domainkey`
   - **Value:** `v=DKIM1; k=rsa; p=MIGfMA0GC...` (copy from Resend)

2. **Type:** TXT
   - **Name:** `resend2._domainkey`
   - **Value:** `v=DKIM1; k=rsa; p=MIGfMA0GC...`

3. **Type:** TXT
   - **Name:** `resend3._domainkey`
   - **Value:** `v=DKIM1; k=rsa; p=MIGfMA0GC...`

### Step 3: Verify Domain in Resend
1. After adding DNS records, wait 5-10 minutes
2. Go back to Resend → Domains
3. Click **Verify** next to carvalytics.com
4. If DNS has propagated, it will show as verified ✅

### Step 4: Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `expense-splitter`
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:
   - `RESEND_API_KEY` = `re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV` (your key)
   - `NEXT_PUBLIC_APP_URL` = `https://carvalytics.com`
5. Apply to: **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 5: Redeploy
After updating environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on latest deployment
3. Click **Redeploy**

Or just push to GitHub and Vercel will auto-deploy.

---

## Part 3: Testing

### Test Supabase Confirmation Email:
1. Go to `https://carvalytics.com/signup`
2. Create a new test account
3. Check email for confirmation link
4. Click link to verify email

### Test Resend Invitation Email:
1. Log into your app
2. Go to a group
3. Click **Invite Member**
4. Enter an email address
5. Check that email for invitation
6. Email should come from: `invites@carvalytics.com`

---

## Troubleshooting

### Emails not sending from Supabase:
- Check Site URL is set to `https://carvalytics.com`
- Check redirect URLs include `https://carvalytics.com/**`
- Check email provider is enabled
- Look at Supabase Logs: **Logs** → **Auth Logs**

### Emails not sending from Resend:
- Verify domain is verified in Resend dashboard
- Check DNS records are correct in GoDaddy
- Verify `RESEND_API_KEY` is in Vercel environment variables
- Check Resend logs: [Resend Emails](https://resend.com/emails)
- Make sure you're out of sandbox mode (domain must be verified)

### DNS Propagation Issues:
Check DNS propagation: [whatsmydns.net](https://www.whatsmydns.net/)
- Enter: `carvalytics.com`
- Record type: `TXT` or `A`
- Should show green checks globally within 24 hours

---

## Summary

### What's Updated:
✅ Email "from" address changed to: `invites@carvalytics.com`
✅ App URL updated to: `https://carvalytics.com`
✅ Local `.env.local` updated

### What You Need to Do:
1. ⬜ Configure Supabase Site URL and email settings
2. ⬜ Add carvalytics.com to Resend
3. ⬜ Add Resend DNS records to GoDaddy
4. ⬜ Verify domain in Resend
5. ⬜ Update Vercel environment variables
6. ⬜ Redeploy the app
7. ⬜ Test both email types

---

## Current Status
- ✅ Custom domain (carvalytics.com) is live
- ✅ Code updated for new domain
- ⬜ Resend domain verification pending
- ⬜ Supabase email configuration pending
