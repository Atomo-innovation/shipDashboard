module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // FFmpeg + RTSP cannot run on Vercel serverless. Use `npm start` locally for live camera.
  return res.status(503).json({
    success: false,
    message:
      "Live RTSP camera streaming is not available on Vercel. Run locally with `npm start` (requires FFmpeg).",
  });
};
