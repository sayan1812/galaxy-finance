import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

const router = express.Router();

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// Helper to find the best valid APK file (must be > 1 MB)
function resolveValidApk() {
  const candidatePaths = [
    path.join(projectRoot, 'public', 'downloads', 'galaxy-finance-v1.0.0.apk'),
    path.join(projectRoot, 'public', 'downloads', 'galaxy-finance-release.apk'),
    path.join(projectRoot, 'public', 'galaxy-finance-v1.0.0.apk'),
    path.join(__dirname, '..', 'downloads', 'galaxy-finance-v1.0.0.apk'),
    path.join(__dirname, '..', 'downloads', 'galaxy-finance-release.apk'),
    path.resolve(process.cwd(), 'public', 'downloads', 'galaxy-finance-v1.0.0.apk'),
    path.resolve(process.cwd(), 'public', 'downloads', 'galaxy-finance-release.apk'),
    path.resolve(process.cwd(), 'public', 'galaxy-finance-v1.0.0.apk'),
    path.resolve(process.cwd(), 'server', 'downloads', 'galaxy-finance-v1.0.0.apk'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const stats = fs.statSync(p);
        if (stats.size > 1000000) {
          return p;
        }
      } catch {}
    }
  }
  return null;
}

// GET /api/v1/download/apk & /api/v1/download/info
router.get('/info', (req, res) => {
  const validApk = resolveValidApk();
  let sizeMb = '18.6 MB';
  try {
    if (validApk && fs.existsSync(validApk)) {
      const bytes = fs.statSync(validApk).size;
      sizeMb = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  } catch {}

  res.json({
    appName: 'Galaxy Finance',
    version: '1.0.0',
    platform: 'Android',
    architecture: 'arm64-v8a, armeabi-v7a',
    fileSize: sizeMb,
    releaseDate: '2026-10-12',
    downloadUrl: '/downloads/galaxy-finance-v1.0.0.apk',
  });
});

const handleApkStream = (req, res) => {
  const filePath = resolveValidApk();
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).size < 100000) {
    return res.status(404).json({
      error: 'Native APK package currently unavailable. Please tap "PWA Instant App" to install directly via browser.'
    });
  }

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="galaxy-finance-v1.0.0.apk"');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (req.method === 'HEAD') {
    return res.end();
  }

  const fileStream = fs.createReadStream(filePath);
  fileStream.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error streaming APK file. Please tap "PWA Instant App" to install directly via browser.'
      });
    }
  });
  fileStream.pipe(res);
};

router.get('/apk', handleApkStream);
router.head('/apk', handleApkStream);


export default router;
