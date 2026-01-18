# 🚀 Deploy Now - Copy & Paste Commands

Run these commands in order. I've made it super simple!

## 1. Initialize Git & Commit Everything

```bash
git init
git add .
git commit -m "Initial commit - Expense Splitter with deletion features"
```

## 2. Create GitHub Repository

Go to: https://github.com/new

- Repository name: `expense-splitter`
- Keep it public or private (your choice)
- **Don't** initialize with README, .gitignore, or license
- Click "Create repository"

## 3. Push to GitHub

**Replace YOUR_USERNAME with your GitHub username:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/expense-splitter.git
git branch -M main
git push -u origin main
```

## 4. Deploy with Vercel

### Method A: Using Vercel CLI (Recommended - Fastest!)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (opens browser)
vercel login

# Deploy!
vercel
```

When prompted:
- Set up and deploy? → **Y**
- Which scope? → (Select your account)
- Link to existing project? → **N**
- Project name? → **expense-splitter** (or press Enter)
- Directory? → **./` (press Enter)
- Want to override settings? → **N**

Your app will deploy in ~2 minutes! ⚡

### Method B: Using Vercel Dashboard

1. Go to: https://vercel.com/new
2. Click "Import" next to your `expense-splitter` repo
3. Click "Deploy" (Vercel auto-detects Next.js)
4. Wait ~2 minutes for build to complete

## 5. Add Environment Variables

After deployment completes, you'll get a URL like:
`https://expense-splitter-xyz.vercel.app`

### Add to Vercel:

Go to: Your Project → Settings → Environment Variables

Add these **4 variables** (copy-paste each):

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ailtlnipedjaeorwqmxf.supabase.co
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_JFXPzyvVZJn3C2npbH987A_6jroaFly
Environment: Production, Preview, Development

Name: RESEND_API_KEY
Value: re_Li2JBn1V_FzVTcpKPFxQCYuwnMpwxurHV
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_APP_URL
Value: (your actual Vercel URL - e.g., https://expense-splitter-xyz.vercel.app)
Environment: Production, Preview, Development
```

Click **Save** after each one.

## 6. Redeploy

After adding env vars:

### Using CLI:
```bash
vercel --prod
```

### Using Dashboard:
1. Go to Deployments tab
2. Click three dots on latest deployment
3. Click "Redeploy"

## 7. Update Supabase

Go to: https://supabase.com/dashboard → Your Project → Authentication → URL Configuration

Update:
- **Site URL**: `https://your-vercel-url.vercel.app`
- **Redirect URLs**: Add `https://your-vercel-url.vercel.app/**`

Click **Save**

## 8. Test Your App! 🎉

Visit: `https://your-vercel-url.vercel.app`

Try:
1. ✅ Sign up
2. ✅ Create a group
3. ✅ Add an expense
4. ✅ Invite a member
5. ✅ Delete an expense
6. ✅ Remove a member

## All Done! 🎊

Your Expense Splitter is now live!

---

## Bonus: Set Up Continuous Deployment

Now every time you push to GitHub, Vercel will automatically deploy:

```bash
# Make a change
git add .
git commit -m "Update something"
git push

# Vercel automatically deploys! 🚀
```

---

## Quick Reference

**Your URLs:**
- 🌐 Live App: `https://your-vercel-url.vercel.app`
- 📦 GitHub: `https://github.com/YOUR_USERNAME/expense-splitter`
- ⚡ Vercel Dashboard: `https://vercel.com/dashboard`

**Commands:**
```bash
# Push updates
git add .
git commit -m "Your message"
git push

# Deploy to production (if using CLI)
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls
```

---

Need detailed help? See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
