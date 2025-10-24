# 🔧 Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Build Errors

### Error: "npm ERR! missing script: build"

**Cause:** Missing build script in package.json

**Solution:**
```bash
# Make sure package.json has:
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

### Error: "ENOENT: no such file or directory"

**Cause:** Vercel can't find your files

**Solution:**
1. Check "Root Directory" is set to `./` in Vercel
2. Make sure `vercel.json` is in your project root
3. Verify "Output Directory" is `dist`

---

### Error: "Failed to compile"

**Cause:** TypeScript or code errors

**Solution:**
```bash
# Test locally first:
npm install
npm run build

# Fix any errors shown
# Then redeploy
```

---

## 🔴 Blank Page Issues

### Blank White Page After Deploy

**Cause:** SPA routing not configured

**Solution:**
Your `vercel.json` should have this (already included):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

If missing, add it and redeploy.

---

### Console Error: "Failed to load module"

**Cause:** Import path issues

**Solution:**
```bash
# Check all imports use correct paths:
import { Button } from "./components/ui-custom/button"  // ✅ Correct
import { Button } from "components/ui-custom/button"    // ❌ Wrong
```

---

## 🔴 Image Issues

### Images Not Loading (404 errors)

**Cause:** Incorrect image imports

**Solution:**
Your Figma assets should work as-is:
```tsx
import image from "figma:asset/...png"  // ✅ Correct
```

For new images:
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback'
<ImageWithFallback src="url" alt="description" />
```

---

### Images Load Locally But Not on Vercel

**Cause:** Case-sensitive paths

**Solution:**
- Check file name matches exactly (case-sensitive)
- `Image.png` ≠ `image.png` on servers
- Verify all paths in your imports

---

## 🔴 CSS/Styling Issues

### Styles Not Applying

**Cause:** CSS not imported or build issue

**Solution:**
```tsx
// In App.tsx, verify this exists:
import "./styles/globals.css"
```

```bash
# Clear cache and rebuild:
rm -rf node_modules .next dist
npm install
npm run build
```

---

### Design System Variables Not Working

**Cause:** CSS variables not loading

**Solution:**
Check `/styles/globals.css` has your variables:
```css
:root {
  --primary: rgba(35, 136, 255, 1);
  --radius: 8px;
  /* etc */
}
```

Then use in components:
```tsx
className="bg-primary rounded-[var(--radius)]"
```

---

## 🔴 Git/GitHub Issues

### "Permission denied (publickey)"

**Cause:** SSH key not set up

**Solution:**
Use HTTPS instead:
```bash
git remote set-url origin https://github.com/USERNAME/repo.git
git push
```

Or set up SSH: https://docs.github.com/en/authentication

---

### "Failed to push some refs"

**Cause:** Remote has changes you don't have

**Solution:**
```bash
git pull origin main --rebase
git push origin main
```

---

### "Repository not found"

**Cause:** Wrong URL or no access

**Solution:**
```bash
# Check your remote:
git remote -v

# Should show:
# origin  https://github.com/USERNAME/inventorly-app.git

# Fix if wrong:
git remote set-url origin https://github.com/USERNAME/correct-repo.git
```

---

## 🔴 Vercel-Specific Issues

### "Deployment Failed" with No Clear Error

**Cause:** Build timeout or configuration issue

**Solution:**
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "General"
3. Verify:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node Version: 18.x or higher

---

### "This domain is not configured"

**Cause:** Custom domain DNS not set up correctly

**Solution:**
1. Vercel → Your Project → Settings → Domains
2. Check DNS status (should show green checkmarks)
3. If not, verify DNS records at your domain provider
4. Wait 15-30 minutes for DNS propagation
5. Check status at: https://dnschecker.org

---

### "Error: ECONNREFUSED"

**Cause:** Network issue or API timeout

**Solution:**
```bash
# Redeploy:
vercel --prod

# Or in GitHub:
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 🔴 Performance Issues

### Slow Initial Load

**Cause:** Large bundle size

**Solution:**
Vercel automatically optimizes, but you can help:
```tsx
// Use lazy loading for routes:
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./components/Dashboard'))

// In your component:
<Suspense fallback={<LoadingScreen />}>
  <Dashboard />
</Suspense>
```

---

### Images Loading Slowly

**Cause:** Large image files

**Solution:**
Already handled by `ImageWithFallback` component.
For new images, use optimized formats:
- Use WebP when possible
- Compress images before upload
- Vercel's Image Optimization is automatic

---

## 🔴 Environment Variables

### "API Key Undefined"

**Cause:** Environment variables not set

**Solution:**
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add your variables:
   ```
   Name: VITE_API_KEY
   Value: your_actual_key
   ```
4. Select all environments (Production, Preview, Development)
5. Save
6. Redeploy your app

---

### Environment Variables Not Updating

**Cause:** Deployment cache

**Solution:**
After changing environment variables:
```bash
# Trigger a new deployment:
vercel --prod

# Or commit anything to trigger auto-deploy:
git commit --allow-empty -m "Update env vars"
git push
```

---

## 🔴 Database/Backend Issues

### "Cannot connect to database"

**Note:** Your app is currently frontend-only.

**If you add a backend later:**
1. Check connection strings in environment variables
2. Verify database is accessible from Vercel's servers
3. Check firewall/security group settings
4. Use Vercel's supported databases

---

## 🟡 Warnings (Non-Critical)

### "Build time optimization warning"

**Cause:** Large dependencies

**Action:** Usually safe to ignore
**Optional Fix:** Use lazy loading (see Performance section)

---

### "Missing alt attribute"

**Cause:** Accessibility warning

**Action:** Good to fix for accessibility
```tsx
// Add alt text:
<ImageWithFallback src="..." alt="Description of image" />
```

---

## 🆘 Still Stuck?

### Step 1: Check Build Locally
```bash
npm install
npm run build
npm run preview
```

If it works locally, it should work on Vercel.

---

### Step 2: Check Vercel Logs
1. Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click the failed deployment
4. Read the "Build Logs"
5. Look for the first error message

---

### Step 3: Clear Everything & Retry
```bash
# Locally:
rm -rf node_modules dist .vercel
npm install
npm run build

# Then redeploy:
vercel --prod
```

---

### Step 4: Get Help

**Vercel Support:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

**Search for your error:**
```
site:vercel.com [your error message]
```

**Stack Overflow:**
- Tag: [vercel]
- Search existing questions first

---

## 📋 Debug Checklist

When something goes wrong, check:

- [ ] Does it work locally? (`npm run build`)
- [ ] Are all dependencies installed?
- [ ] Is `vercel.json` in the project root?
- [ ] Are environment variables set correctly?
- [ ] Are import paths correct (case-sensitive)?
- [ ] Is the build command correct in Vercel settings?
- [ ] Is the output directory `dist`?
- [ ] Are there any console errors? (F12 in browser)
- [ ] Did you check the Vercel build logs?
- [ ] Have you tried redeploying?

---

## ✅ Prevention Tips

### Before Every Deploy:
1. Test locally with `npm run build`
2. Check for console errors
3. Test all major features
4. Verify mobile responsiveness
5. Review git changes before pushing

### Regular Maintenance:
1. Keep dependencies updated
2. Monitor Vercel analytics
3. Check for deprecation warnings
4. Review build logs occasionally

---

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Build fails | `npm install && npm run build` locally first |
| Blank page | Check `vercel.json` has rewrites |
| Images 404 | Verify import paths are correct |
| Styles missing | Ensure `globals.css` is imported |
| Git errors | Use HTTPS instead of SSH |
| Deploy fails | Clear cache, redeploy |
| DNS issues | Wait 15-30 min, check dnschecker.org |
| Env vars not working | Redeploy after setting them |

---

**Most issues are solved by:**
```bash
rm -rf node_modules dist
npm install
npm run build
vercel --prod
```

**If that doesn't work, check the Vercel build logs for the specific error message.**

---

Good luck! Your Inventorly app is solid and should deploy smoothly. 🚀
