# shipDashboard

## Vercel (must match local UI)

This project deploys **only** the `public/` folder (copied to `dist/` at build time).  
Express (`local-server.js`) is **not** used on Vercel — that was why CSS was missing.

### Deploy / fix existing project

1. Vercel → your project → **Settings → General → Build & Development Settings**
2. Click **Override** and set:
   - **Framework Preset:** Other
   - **Build Command:** `rm -rf dist && mkdir dist && cp -R public/. dist/`
   - **Output Directory:** `dist`
   - **Install Command:** `echo skip-install`
3. **Deployments → … → Redeploy** (uncheck “Use existing Build Cache”)

### Verify after deploy

Open these on your Vercel domain — both must be **200**, not 404:

- `https://YOUR-APP.vercel.app/`
- `https://YOUR-APP.vercel.app/css/dashboard.css`
- `https://YOUR-APP.vercel.app/js/dashboard.js`
- `https://YOUR-APP.vercel.app/assets/atomologo.png`

If CSS is 404, Output Directory is still wrong in project settings.

## Local (with camera)

```bash
npm install
npm start
```

http://localhost:3006
