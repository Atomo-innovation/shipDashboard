# shipDashboard

## Fix Vercel "No entrypoint found in output directory"

That error means Vercel thought this was a **Node server**. It is a **static site**.

### In Vercel project settings (required)

**Settings → Build & Development Settings** — turn **OFF** all overrides, OR set:

| Setting | Value |
|--------|--------|
| Framework Preset | **Other** |
| Build Command | *(leave empty — use vercel.json)* |
| Output Directory | **CLEAR / empty** (do NOT set `dist` or `public`) |
| Install Command | *(leave empty — use vercel.json)* |

Then **Redeploy** with **Build Cache disabled**.

### What the build does

It writes static files into `.vercel/output/static` (Vercel Build Output API) so HTML/CSS/JS deploy correctly — no Node `server.js` entrypoint needed.

## Local

```bash
npm install
npm start
```
