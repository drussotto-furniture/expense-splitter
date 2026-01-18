# Vercel Deployment Guide - Expense Splitter

## Prerequisites
- GitHub account (to connect with Vercel)
- Vercel account (free tier works great)
- Supabase project (you already have this)
- Resend account for email invitations (you already have this)

## Step 1: Push Your Code to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Expense Splitter app with deletion features"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `expense-splitter`
   - Don't initialize with README (you already have code)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/expense-splitter.git
git branch -M main
git push -u origin main
```

## Step 2: Create Vercel Project

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from your project directory:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - Project name? **expense-splitter**
   - Directory? **./
   - Want to modify settings? **N**

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

## Step 3: Configure Environment Variables in Vercel

You need to add these environment variables in Vercel:

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ailtlnipedjaeorwqmxf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JFXPzyvVZJn3C2npbH987A_6jroaFly
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
RESEND_API_KEY=re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV
```

**IMPORTANT**: Update `NEXT_PUBLIC_APP_URL` with your actual Vercel deployment URL after first deploy.

### Using Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://ailtlnipedjaeorwqmxf.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: sb_publishable_JFXPzyvVZJn3C2npbH987A_6jroaFly

vercel env add RESEND_API_KEY
# Paste: re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV

vercel env add NEXT_PUBLIC_APP_URL
# Paste: https://your-project-name.vercel.app (update after first deploy)
```

## Step 4: Update Supabase Configuration

After deployment, update your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication > URL Configuration**
4. Add these URLs:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Redirect URLs**:
     - `https://your-project-name.vercel.app/auth/callback`
     - `https://your-project-name.vercel.app/**` (wildcard for all routes)

5. Navigate to **Settings > API**
6. Verify your API keys match what you have in Vercel env vars

## Step 5: Update Resend Configuration (Optional)

For production email sending:

1. Go to Resend Dashboard: https://resend.com/domains
2. Add your custom domain if you have one
3. Verify the domain with DNS records
4. Update the "from" email in your invitation email code if needed

## Step 6: Deploy to Production

### Using Vercel CLI:
```bash
vercel --prod
```

### Using GitHub (Automatic):
- Push to your `main` branch
- Vercel will automatically deploy

## Step 7: Verify Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Test the following:
   - ✅ Sign up new account
   - ✅ Login with existing account
   - ✅ Create a group
   - ✅ Add an expense
   - ✅ Invite a member
   - ✅ Delete an expense
   - ✅ Remove a member
   - ✅ Delete a group

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Environment Variables Not Working
- Make sure they're added to all environments (Production, Preview, Development)
- Redeploy after adding env vars
- Check for typos in variable names

### Supabase Connection Issues
- Verify Supabase URL and anon key are correct
- Check Supabase project is active
- Ensure redirect URLs are configured in Supabase

### Email Invitations Not Sending
- Verify Resend API key is correct
- Check Resend dashboard for delivery status
- Note: Domain verification required for production email sending

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deploying

## Custom Domain (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Supabase redirect URLs

## Performance Tips

- Vercel automatically optimizes your Next.js app
- Images are automatically optimized
- Static pages are cached at the edge
- API routes run as serverless functions

## Monitoring

- View analytics in Vercel dashboard
- Check function logs for API route errors
- Monitor Supabase usage in Supabase dashboard

## Next Steps

1. Set up custom domain (optional)
2. Configure email domain in Resend (for production emails)
3. Enable analytics in Vercel
4. Set up error monitoring (Sentry, LogRocket, etc.)
5. Add a privacy policy and terms of service

## Useful Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

## Your Project URLs

After deployment, you'll have:
- **Production**: `https://expense-splitter.vercel.app`
- **Preview**: `https://expense-splitter-git-branch-name.vercel.app`
- **GitHub**: `https://github.com/YOUR_USERNAME/expense-splitter`

---

## Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add all environment variables
- [ ] Deploy to production
- [ ] Update `NEXT_PUBLIC_APP_URL` env var with actual URL
- [ ] Redeploy after updating URL
- [ ] Configure Supabase redirect URLs
- [ ] Test signup/login flow
- [ ] Test expense creation
- [ ] Test member invitations
- [ ] Test deletion features

Congratulations! Your Expense Splitter app is now live! 🎉
