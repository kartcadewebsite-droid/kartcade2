# Deployment Guide

## Building for Production

Run the build command:

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

---

## Option 1: Vercel (Recommended)

Best for React apps. Free tier available.

### Via GitHub:
1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Vercel auto-detects Vite
5. Click Deploy

### Via CLI:
```bash
npm install -g vercel
vercel
```

**Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

## Option 2: Netlify

Another excellent free option.

### Via Dashboard:
1. Go to netlify.com
2. Drag & drop `dist/` folder
3. Done!

### Via Git:
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`

### Via CLI:
```bash
npm install -g netlify-cli
netlify deploy --dir=dist --prod
```

---

## Option 3: Traditional Hosting

For cPanel, FTP, or shared hosting:

1. Run `npm run build`
2. Upload contents of `dist/` folder (not the folder itself)
3. Upload to `public_html` or root directory

### .htaccess (Apache)

Create `.htaccess` in dist folder for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Option 4: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select dist as public directory
# Configure as SPA: Yes
firebase deploy
```

---

## Environment Variables

If needed, create `.env` file:

```
VITE_API_URL=https://your-api.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test contact forms work
- [ ] Check mobile responsiveness
- [ ] Verify images load
- [ ] Test all links
- [ ] Check animations work
- [ ] Update sitemap.xml with real domain
- [ ] Submit sitemap to Google Search Console
