import express from 'express';

const router = express.Router();

// GET /api/v1/download/info
router.get('/info', (req, res) => {
  res.json({
    appName: 'Galaxy Finance',
    version: '1.0.0',
    platform: 'Android / Web',
    type: 'PWA WebAPK',
    installMethod: 'Native 1-Tap Browser Install (Add to Home Screen)',
    directApkSupported: false,
    message: 'Galaxy Finance installs instantly as a native standalone PWA app.'
  });
});

// Decommission uncompiled APK streaming
router.all(['/apk', '/*'], (req, res) => {
  res.status(410).json({
    status: 'deprecated',
    message: 'Direct uncompiled APK downloads are removed. Please install Galaxy Finance directly via 1-Tap PWA on your phone.'
  });
});

export default router;
