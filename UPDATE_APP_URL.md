# Update App URL in Vercel

Your app is deployed at: **expense-splitter-fawn.vercel.app**

You need to update the `NEXT_PUBLIC_APP_URL` environment variable to use this actual URL.

## Option 1: Via Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click on your **expense-splitter** project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_APP_URL`
5. Click the **three dots** (⋯) → **Edit**
6. Change the value to: `https://expense-splitter-fawn.vercel.app`
7. Make sure it's checked for **Production**, **Preview**, and **Development**
8. Click **Save**
9. Go to **Deployments** tab
10. Click **three dots** on latest deployment → **Redeploy**

## Option 2: Via CLI

```bash
# Remove the old value
vercel env rm NEXT_PUBLIC_APP_URL production

# Add the new value
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, paste: https://expense-splitter-fawn.vercel.app
# Add to Preview: Y
# Add to Development: Y

# Redeploy
vercel --prod
```

## After Updating

Once you've updated and redeployed, you also need to update Supabase:

### Update Supabase Redirect URLs

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update:
   - **Site URL**: `https://expense-splitter-fawn.vercel.app`
   - **Redirect URLs**: Add these:
     - `https://expense-splitter-fawn.vercel.app/**`
     - `https://expense-splitter-fawn.vercel.app/auth/callback`
5. Click **Save**

## Test Your App

After completing the above steps, test:

1. Visit: https://expense-splitter-fawn.vercel.app
2. Sign up with a new account
3. Create a group
4. Try inviting a member (add yourself with a different email to test)
5. Check notifications bell icon
6. Test all features

## For Email Invitations

The emails will work with the test domain `onboarding@resend.dev` for now.

If you want production-ready emails later:
1. Add your custom domain to Resend
2. Update the "from" email in the code
3. Redeploy

See [RESEND-SETUP.md](RESEND-SETUP.md) for details.

---

Your app is now fully deployed! 🎉
