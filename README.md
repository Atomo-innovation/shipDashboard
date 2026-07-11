# shipDashboard

Ship digital twin monitoring dashboard (vibration, fire/smoke, 3D twin).

## Deploy on Vercel

1. Import this GitHub repo in [Vercel](https://vercel.com/new)
2. Framework Preset: **Other** (leave build command empty)
3. Deploy

Dashboard UI works on Vercel. Live RTSP camera needs the local server (FFmpeg cannot run on Vercel serverless).

## Local (with camera stream)

```bash
npm install
npm start
```

Open http://localhost:3006
