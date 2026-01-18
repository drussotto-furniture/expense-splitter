# Quick Start - Deploy to Vercel in 5 Minutes

Follow these steps to get your Expense Splitter app live on Vercel quickly.

## Step 1: Commit Your Code (1 min)

```bash
git add .
git commit -m "Ready for deployment - Expense Splitter with deletion features and dark theme"
```

## Step 2: Push to GitHub (1 min)

If you haven't already connected to GitHub:

```bash
# If you don't have a remote yet
git remote add origin https://github.com/YOUR_USERNAME/expense-splitter.git
git branch -M main
git push -u origin main
```

If you already have a remote:
```bash
git push
```

## Step 3: Deploy to Vercel (2 mins)

### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
vercel
```

Follow the prompts - just press Enter to accept defaults!

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `expense-splitter` repo
4. Click "Import"
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

## Step 4: Add Environment Variables (1 min)

While your first deployment is building, add environment variables:

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add these 4 variables (one at a time):

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ailtlnipedjaeorwqmxf.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_JFXPzyvVZJn3C2npbH987A_6jroaFly

Name: RESEND_API_KEY
Value: re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV

Name: NEXT_PUBLIC_APP_URL
Value: https://your-project-name.vercel.app
```

**IMPORTANT**: For `NEXT_PUBLIC_APP_URL`, use your actual Vercel URL (you'll get it after first deploy).

4. Click "Save"
5. Trigger a redeploy (Deployments tab → three dots → Redeploy)

## Step 5: Update Supabase (30 sec)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL** to: `https://your-vercel-url.vercel.app`
5. Add to **Redirect URLs**:
   - `https://your-vercel-url.vercel.app/**`
6. Click **Save**

## Done! 🎉

Your app is now live at `https://your-vercel-url.vercel.app`

## Quick Test

Visit your URL and test:
1. Sign up for an account
2. Create a group
3. Add an expense
4. Invite a friend

---

## Troubleshooting

**Build Failed?**
- Check the build logs in Vercel dashboard
- Make sure you pushed all files to GitHub
- Run `npm run build` locally to test

**Login Not Working?**
- Verify Supabase redirect URLs are set correctly
- Check environment variables in Vercel
- Redeploy after adding env vars

**Emails Not Sending?**
- Check Resend API key is correct
- Note: Production emails require domain verification in Resend

---

## Next Steps (Optional)

### Add Custom Domain
1. Go to Vercel Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Monitor Your App
- View analytics in Vercel dashboard
- Check Supabase usage
- Monitor function logs

### Continuous Deployment
Now every push to `main` will automatically deploy!

Push changes:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically build and deploy!

---

Need help? Check [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.
