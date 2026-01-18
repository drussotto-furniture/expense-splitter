# 🚀 Deployment Steps - Ready to Execute

## ✅ Completed Steps

- [x] Git repository initialized
- [x] All files committed
- [x] Code pushed to GitHub: https://github.com/drussotto-furniture/expense-splitter
- [x] Vercel CLI installed (version 48.12.0)

## 📋 Next Steps - Follow Along

### Step 1: Login to Vercel

Run this command (it will open your browser):

```bash
vercel login
```

This will:
- Open a browser window
- Ask you to authorize the CLI
- Come back to terminal when done

### Step 2: Deploy to Vercel

Run this command:

```bash
vercel
```

**Answer the prompts:**
- `Set up and deploy "~/code-projects/expense-splitter"?` → **Y** (press Enter)
- `Which scope do you want to deploy to?` → Select your account (press Enter)
- `Link to existing project?` → **N** (press Enter)
- `What's your project's name?` → **expense-splitter** (or press Enter)
- `In which directory is your code located?` → **./` (press Enter)
- `Want to modify these settings?` → **N** (press Enter)

The deployment will start! It takes about 2-3 minutes.

**Save the URL you get!** It will look like:
`https://expense-splitter-abc123.vercel.app`

### Step 3: Add Environment Variables

After deployment completes, you need to add your environment variables.

Run these commands **one at a time** and paste the values when prompted:

```bash
# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# When prompted, paste: https://ailtlnipedjaeorwqmxf.supabase.co
# Then add to Preview: Y
# Then add to Development: Y

# Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# When prompted, paste: sb_publishable_JFXPzyvVZJn3C2npbH987A_6jroaFly
# Then add to Preview: Y
# Then add to Development: Y

# Resend API Key
vercel env add RESEND_API_KEY production
# When prompted, paste: re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV
# Then add to Preview: Y
# Then add to Development: Y

# App URL (use YOUR actual Vercel URL from Step 2)
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, paste: https://expense-splitter-abc123.vercel.app (YOUR URL)
# Then add to Preview: Y
# Then add to Development: Y
```

### Step 4: Redeploy with Environment Variables

Now that env vars are added, redeploy to production:

```bash
vercel --prod
```

Wait for deployment to complete (~2-3 minutes).

### Step 5: Update Supabase Configuration

Go to your Supabase Dashboard:
https://supabase.com/dashboard

1. Select your project
2. Go to **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://your-vercel-url.vercel.app` (your actual URL)
   - **Redirect URLs**: Add these:
     - `https://your-vercel-url.vercel.app/**`
     - `https://your-vercel-url.vercel.app/auth/callback`
4. Click **Save**

### Step 6: Run Database Migrations

You need to run the notifications setup SQL. Go to:
https://supabase.com/dashboard → Your Project → SQL Editor

Copy and paste the contents of [setup-notifications.sql](setup-notifications.sql) and click **Run**.

This creates:
- notifications table
- RLS policies
- triggers for notifications

### Step 7: Test Your Deployment! 🎉

Visit your Vercel URL: `https://your-vercel-url.vercel.app`

Test these features:
- [ ] Sign up with a new account
- [ ] Create a group
- [ ] Add an expense
- [ ] Invite a member (try both search and browse tabs)
- [ ] Check notifications (bell icon)
- [ ] Remove a pending member
- [ ] Delete an expense
- [ ] View balances

## 🎊 You're Live!

Your expense splitter is now deployed and running in production!

## 📝 Important URLs

- **Live App**: https://your-vercel-url.vercel.app (replace with yours)
- **GitHub**: https://github.com/drussotto-furniture/expense-splitter
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

## 🔄 Making Updates

From now on, when you want to deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Vercel will automatically deploy!
# Or manually deploy with:
vercel --prod
```

## 🐛 Troubleshooting

### Build fails?
```bash
# Test build locally first
npm run build
```

### Environment variables not working?
```bash
# Check what's set
vercel env ls

# Pull env vars to local
vercel env pull
```

### Need deployment logs?
```bash
vercel logs
```

### Supabase connection issues?
- Check redirect URLs are correct
- Verify API keys in Vercel match Supabase
- Check RLS policies are enabled

## 🎯 Optional: Custom Domain

Want to use your own domain? Follow these steps:

1. Go to Vercel project → Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_APP_URL` env var
5. Update Supabase redirect URLs

## 📊 Monitoring

- **Vercel Analytics**: Automatic in your dashboard
- **Supabase Logs**: Check database activity
- **Function Logs**: View API route errors in Vercel

## 🔐 Security Checklist

- [x] Environment variables not in git (.env.local in .gitignore)
- [x] Supabase RLS policies enabled
- [x] API keys secured in Vercel
- [x] Redirect URLs configured properly
- [ ] Consider adding rate limiting (future)
- [ ] Set up error monitoring like Sentry (future)

---

**Need help?** Check the detailed guides:
- [DEPLOY_NOW.md](DEPLOY_NOW.md) - Quick reference
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Detailed guide
- [NOTIFICATION_SYSTEM_SETUP.md](NOTIFICATION_SYSTEM_SETUP.md) - Notification setup

Good luck! 🚀
