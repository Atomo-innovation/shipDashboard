# shipDashboard

Same dashboard locally and on Vercel (static files in `public/`).

## Fix Vercel (important)

`ship-dashboard.vercel.app` is a **different Vite app** — not this repo.

Deploy **this** GitHub repo fresh:

1. Open https://vercel.com/new
2. Import **`Atomo-innovation/shipDashboard`**
3. Settings:
   - Framework Preset: **Other**
   - Root Directory: `.` (leave default)
   - Build Command: **leave empty**
   - Output Directory: **`public`**
   - Install Command: **leave empty**
4. Click **Deploy**

You will get a new URL like `shipdashboard-xxxxx.vercel.app` — that one will match local.

## Local

```bash
npm install
npm start
```

http://localhost:3006
