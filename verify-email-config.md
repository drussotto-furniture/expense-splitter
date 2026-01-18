# Email Configuration Verification

## ✅ What Should Be Configured:

### Supabase Configuration:
- [ ] Site URL set to: `https://carvalytics.com`
- [ ] Redirect URLs include:
  - [ ] `https://carvalytics.com/**`
  - [ ] `https://carvalytics.com/auth/callback`
- [ ] Email provider enabled
- [ ] Email confirmation enabled (if desired)

### Resend Configuration:
- [ ] Domain `carvalytics.com` added to Resend
- [ ] DNS records added to GoDaddy:
  - [ ] TXT record for domain verification
  - [ ] DKIM records (3 records)
- [ ] Domain verified in Resend dashboard (shows green checkmark)

### Vercel Configuration:
- [ ] Environment variable: `NEXT_PUBLIC_APP_URL` = `https://carvalytics.com`
- [ ] Environment variable: `RESEND_API_KEY` = `re_Li2JBn1V_...` (your key)
- [ ] Latest deployment completed successfully

---

## 🧪 Testing Guide:

### Test 1: Supabase Confirmation Email
1. Go to: https://carvalytics.com/signup
2. Enter a test email and password
3. Click Sign Up
4. Check your email for confirmation link from Supabase
5. Click the confirmation link
6. Verify it redirects to: https://carvalytics.com

**Expected Result:** Email arrives and confirmation link works

**If it fails:**
- Check Supabase Dashboard → Logs → Auth Logs for errors
- Verify Site URL is set correctly
- Check that redirect URLs include the wildcard

---

### Test 2: Resend Invitation Email
1. Go to: https://carvalytics.com
2. Log into your account
3. Navigate to one of your groups
4. Click "Invite Member"
5. Enter a test email address
6. Click "Send Invitation"
7. Check that email inbox

**Expected Result:**
- Email arrives from: `Carvalytics Expense Splitter <invites@carvalytics.com>`
- Email contains invitation link
- Links point to: https://carvalytics.com

**If it fails:**
- Check Resend Dashboard → Emails for error logs
- Verify domain is verified (green checkmark)
- Check browser console for errors
- Check Vercel deployment logs for errors

---

## 🔍 Troubleshooting Commands:

### Check Vercel Environment Variables:
```bash
vercel env ls
```

### Check Latest Deployment Status:
```bash
vercel ls
```

### View Deployment Logs:
```bash
vercel logs
```

### Check DNS Propagation:
Visit: https://www.whatsmydns.net/
- Enter: `carvalytics.com`
- Check TXT records (should show Resend verification)
- Check A record (should show: 76.76.21.21)

---

## 📋 Quick Status Check:

### Current Configuration:
✅ Custom domain: carvalytics.com (live)
✅ Code updated with new domain
✅ Latest commit pushed to GitHub
✅ Email "from" addresses updated to: invites@carvalytics.com

### Pending Verification:
⏳ Supabase Site URL configured
⏳ Resend domain verified
⏳ Vercel environment variables updated
⏳ Emails sending successfully

---

## 🎯 Success Criteria:

All emails should:
1. ✅ Arrive at recipient inbox (not spam)
2. ✅ Show sender as: `invites@carvalytics.com` (for invitations)
3. ✅ Contain links to: `https://carvalytics.com`
4. ✅ Links work and redirect properly
5. ✅ No errors in console or logs

---

## 📞 Need Help?

If something isn't working:
1. Check the specific test section above
2. Follow the troubleshooting steps
3. Check the logs in:
   - Supabase Dashboard → Logs → Auth Logs
   - Resend Dashboard → Emails
   - Vercel Dashboard → Deployments → Logs
4. Verify DNS propagation (can take up to 24 hours)
