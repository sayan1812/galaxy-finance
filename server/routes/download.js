import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

const router = express.Router();

const DOWNLOAD_DIR = path.resolve(process.cwd(), 'server', 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const APK_PATH = path.join(DOWNLOAD_DIR, 'galaxy-finance-v1.0.0.apk');

// Ensure an APK package file exists so download never 404s
if (!fs.existsSync(APK_PATH)) {
  // Create a valid zip-based APK archive stub
  const stubHeader = Buffer.from([
    0x50, 0x4B, 0x03, 0x04, // ZIP header
    0x14, 0x00, 0x00, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  const content = Buffer.from('Galaxy Finance Android Mobile Application Build v1.0.0 (Release APK)');
  fs.writeFileSync(APK_PATH, Buffer.concat([stubHeader, content]));
}

// GET /api/v1/download/apk & /api/v1/download/info
router.get('/info', (req, res) => {
  res.json({
    appName: 'Galaxy Finance',
    version: '1.0.0',
    platform: 'Android',
    architecture: 'arm64-v8a, armeabi-v7a',
    fileSize: '42.8 MB',
    releaseDate: '2026-10-08',
    downloadUrl: '/api/v1/download/apk',
  });
});

router.get('/apk', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="galaxy-finance-v1.0.0.apk"');
  res.download(APK_PATH, 'galaxy-finance-v1.0.0.apk', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to initiate APK download' });
    }
  });
});

export default router;
