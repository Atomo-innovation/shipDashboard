const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

const activeStreams = new Map();

app.post('/api/start-stream', async (req, res) => {
  const { rtspUrl = 'rtsp://admin:admin123456@192.168.1.10:8554/profile0' } = req.body;
  if (!rtspUrl) {
    return res.status(400).json({ success: false, message: 'RTSP URL required' });
  }

  try {
    const streamId = 'ship_corner_camera';

    if (activeStreams.has(streamId)) {
      console.log(`📹 Stream already running: ${streamId}`);
      return res.json({
        success: true,
        streamUrl: `/api/stream/${streamId}/index.m3u8`,
        message: 'Stream already active',
      });
    }
    const streamDir = path.join(__dirname, 'streams', streamId);
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
    }

    console.log(`📹 Starting ship camera stream: ${streamId} from ${rtspUrl.replace(/:[^:@]+@/, ':****@')}`);

    let ffmpegFailed = false;
    const ffmpegProcess = spawn('ffmpeg', [
      '-rtsp_transport', 'tcp',
      '-fflags', 'nobuffer',
      '-flags', 'low_delay',
      '-i', rtspUrl,
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '64k', '-ac', '1',
      '-f', 'hls',
      '-hls_time', '1',
      '-hls_list_size', '3',
      '-hls_flags', 'delete_segments+append_list+omit_endlist',
      '-hls_segment_filename', `${streamDir}/seg_%03d.ts`,
      '-start_number', '0',
      '-g', '30',
      '-sc_threshold', '0',
      '-tune', 'zerolatency',
      '-preset', 'ultrafast',
      '-fflags', '+genpts',
      `${streamDir}/index.m3u8`,
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    ffmpegProcess.on('error', (err) => {
      console.error(`❌ FFmpeg error [${streamId}]: ${err.message}`);
      ffmpegFailed = true;
    });
    ffmpegProcess.stderr.on('data', (data) => {
      const errMsg = data.toString().trim();
      if (errMsg.includes('error') || errMsg.includes('Connection refused')) {
        console.error(`FFmpeg Error [${streamId}]: ${errMsg}`);
        ffmpegFailed = true;
      }
    });
    ffmpegProcess.on('close', (code) => {
      console.log(`FFmpeg [${streamId}] closed: ${code}`);
      if (code !== 0) ffmpegFailed = true;
      if (ffmpegFailed) activeStreams.delete(streamId);
    });

    activeStreams.set(streamId, { url: rtspUrl, startTime: Date.now(), ffmpegProcess, streamDir, failed: false });
    res.json({ success: true, streamUrl: `/api/stream/${streamId}/index.m3u8`, message: 'Stream started (ready in 1s)' });
  } catch (error) {
    console.error('❌ Start-stream error:', error);
    res.status(500).json({ success: false, message: 'FFmpeg error - install ffmpeg?' });
  }
});

app.post('/api/stop-stream', (req, res) => {
  const { streamId = 'ship_corner_camera' } = req.body;
  console.log(`🛑 Stop request received for: ${streamId}`);

  if (activeStreams.has(streamId)) {
    const stream = activeStreams.get(streamId);
    if (stream.ffmpegProcess && !stream.ffmpegProcess.killed) {
      stream.ffmpegProcess.kill('SIGINT');
      setTimeout(() => {
        if (!stream.ffmpegProcess.killed) stream.ffmpegProcess.kill('SIGKILL');
      }, 5000);
    }
    activeStreams.delete(streamId);
    setTimeout(() => {
      const streamDir = path.join(__dirname, 'streams', streamId);
      if (fs.existsSync(streamDir)) fs.rmSync(streamDir, { recursive: true, force: true });
    }, 10000);
    console.log(`🛑 Stream stopped: ${streamId}`);
  }
  res.json({ success: true });
});

app.get('/api/stream/:streamId/index.m3u8', (req, res) => {
  const { streamId } = req.params;
  if (!activeStreams.has(streamId)) {
    return res.status(404).send('Stream not found');
  }
  const stream = activeStreams.get(streamId);
  if (stream.failed) {
    return res.status(503).send('#EXTM3U\n#EXT-X-ERROR:Stream Failed\n');
  }
  const m3u8Path = path.join(stream.streamDir, 'index.m3u8');
  if (!fs.existsSync(m3u8Path)) {
    return res.status(202).send('#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:1\n');
  }
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Expires', '0');
  const streamFile = fs.createReadStream(m3u8Path);
  streamFile.pipe(res);
  streamFile.on('error', (err) => {
    console.error(`❌ m3u8 error [${streamId}]:`, err);
    if (!res.headersSent) res.status(500).send('Playlist failed');
  });
});

app.get('/api/stream/:streamId/:segment', (req, res) => {
  const { streamId, segment } = req.params;
  if (!activeStreams.has(streamId)) {
    return res.status(404).send('Stream not found');
  }
  const stream = activeStreams.get(streamId);
  if (stream.failed) {
    return res.status(503).send('Stream failed');
  }
  const segmentPath = path.join(stream.streamDir, segment);
  if (!fs.existsSync(segmentPath)) {
    return res.status(404).send('Segment not ready');
  }
  res.setHeader('Content-Type', 'video/MP2T');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Accept-Ranges', 'bytes');
  const fileStream = fs.createReadStream(segmentPath);
  fileStream.pipe(res);
  fileStream.on('error', (err) => {
    console.error(`❌ Segment error [${streamId}/${segment}]:`, err);
    if (!res.headersSent) res.status(500).send('Segment read failed');
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

app.get('/twin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'three_realistic.html'));
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  activeStreams.forEach((stream) => {
    if (stream.ffmpegProcess && !stream.ffmpegProcess.killed) {
      stream.ffmpegProcess.kill('SIGINT');
    }
    if (fs.existsSync(stream.streamDir)) fs.rmSync(stream.streamDir, { recursive: true, force: true });
  });
  activeStreams.clear();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`🚀 Ship Camera Server on http://localhost:${PORT}`);
  console.log(`📹 Stream API ready. Use RTSP: rtsp://your-corner-camera`);
});
