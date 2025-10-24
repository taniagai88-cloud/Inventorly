# ⚡ Quick Deploy - 5 Minutes to Live!

## The Fastest Way (Vercel)

### 1️⃣ Go to Vercel
Visit: **https://vercel.com/new**

### 2️⃣ Sign Up / Sign In
- Click "Continue with GitHub" (recommended)
- Or use GitLab, Bitbucket, or Email

### 3️⃣ Import Your Project

**Option A: From Git (Best for teams)**
1. Push your code to GitHub
2. Click "Import Project" in Vercel
3. Select your repository
4. Click "Deploy"
5. ✅ Done! Live in 2 minutes

**Option B: From Command Line (Fastest)**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy (one command!)
vercel

# Follow prompts:
# - Login with your account
# - Select settings (or accept defaults)
# - Deploy!
```

### 4️⃣ Your App is Live! 🎉
You'll get a URL like: `inventorly-abc123.vercel.app`

---

## Next Steps

### Add a Custom Domain (Optional)
1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Vercel → Your Project → Settings → Domains
3. Add your domain (e.g., `inventorly.app`)
4. Update DNS records (Vercel shows you how)
5. SSL certificate added automatically!

### Share Your App
Send your team the link and start collecting feedback!

---

## Alternative: Netlify Drop

**Even easier - literally drag & drop!**

1. Go to: **https://app.netlify.com/drop**
2. Build your app: `npm run build`
3. Drag the `dist` folder onto Netlify
4. ✅ Instantly live!

---

## Troubleshooting

### Build Failed?
Make sure you have all dependencies:
```bash
npm install
npm run build
```

### Images Not Loading?
Check that all image imports use the correct paths

### Blank Page?
Check browser console for errors - usually a routing issue

---

## That's It!

Your Inventorly app is now:
- ✅ Live on the internet
- ✅ Automatically deployed on every push (if using Git)
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Automatic scaling

**Need more details?** See [DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md)
