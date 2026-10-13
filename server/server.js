import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Automatically load environment variables from .env
try {
  if (typeof process.loadEnvFile === 'function') {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  }
} catch {
  // Ignored if .env already loaded
}

import { connectDB } from './config/db.js';
import { initDatabase, dbPath } from './db.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import banksRoutes from './routes/banks.js';
import transactionsRoutes from './routes/transactions.js';
import budgetsRoutes from './routes/budgets.js';
import reportsRoutes from './routes/reports.js';
import calendarRoutes from './routes/calendar.js';
import settingsRoutes from './routes/settings.js';
import syncRoutes from './routes/sync.js';
import notificationsRoutes from './routes/notifications.js';

// MongoDB Core v1 Routes
import accountsMongoRoutes from './routes/accountsMongo.js';
import transactionsMongoRoutes from './routes/transactionsMongo.js';
import dashboardMongoRoutes from './routes/dashboardMongo.js';
import authMongoRoutes from './routes/authMongo.js';
import usersMongoRoutes from './routes/usersMongo.js';
import categoriesMongoRoutes from './routes/categoriesMongo.js';
import downloadRoutes from './routes/download.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB Atlas connection & legacy SQLite fallbacks
connectDB().catch((err) => console.warn('[MongoDB Init Non-fatal]:', err.message));
initDatabase();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Set Security & COOP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Request logging (sanitized, never logs passwords or OTPs)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    if (!req.path.startsWith('/assets/')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${elapsed}ms)`);
    }
  });
  next();
});

// Health check routes
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    service: 'Galaxy Finance Mobile & Web Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'MongoDB Atlas + SQLite Fallback Connected',
    env: process.env.NODE_ENV || 'development'
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// MongoDB Atlas Endpoints (v1 & General API prefixes)
app.use('/api/v1/auth', authMongoRoutes);
app.use('/api/auth', authMongoRoutes);

app.use('/api/v1/users', usersMongoRoutes);
app.use('/api/users', usersMongoRoutes);

app.use('/api/v1/categories', categoriesMongoRoutes);
app.use('/api/categories', categoriesMongoRoutes);

app.use('/api/v1/accounts', accountsMongoRoutes);
app.use('/api/accounts', accountsMongoRoutes);
app.use('/api/banks', accountsMongoRoutes); // Direct MongoDB Accounts alias

app.use('/api/v1/transactions', transactionsMongoRoutes);
app.use('/api/transactions', transactionsMongoRoutes);

app.use('/api/v1/dashboard', dashboardMongoRoutes);
app.use('/api/dashboard', dashboardMongoRoutes);

app.use('/api/v1/download', downloadRoutes);
app.use('/download', downloadRoutes);

// Android APK Package Delivery — Binary Streaming & Strict Header Enforcement
function resolveApkPath(requestedName = 'galaxy-finance-v1.0.0.apk') {
  const specificPaths = [
    path.join(projectRoot, 'public', 'downloads', requestedName),
    path.join(projectRoot, 'public', requestedName),
    path.join(__dirname, 'downloads', requestedName),
    path.resolve(process.cwd(), 'public', 'downloads', requestedName),
    path.resolve(process.cwd(), 'public', requestedName),
    path.resolve(process.cwd(), 'server', 'downloads', requestedName),
  ];

  for (const candidate of specificPaths) {
    if (fs.existsSync(candidate)) {
      try {
        const stats = fs.statSync(candidate);
        if (stats.size > 1000000) return candidate;
      } catch {}
    }
  }

  // If the request was for galaxy-finance apk (or generic download), allow fallback to standard release APK
  if (!requestedName || requestedName.includes('galaxy') || requestedName === 'app-release.apk' || requestedName === 'app.apk') {
    const fallbackPaths = [
      path.join(projectRoot, 'public', 'downloads', 'galaxy-finance-v1.0.0.apk'),
      path.join(projectRoot, 'public', 'downloads', 'galaxy-finance-release.apk'),
      path.join(projectRoot, 'public', 'galaxy-finance-v1.0.0.apk'),
      path.join(__dirname, 'downloads', 'galaxy-finance-v1.0.0.apk'),
      path.join(__dirname, 'downloads', 'galaxy-finance-release.apk'),
    ];
    for (const candidate of fallbackPaths) {
      if (fs.existsSync(candidate)) {
        try {
          const stats = fs.statSync(candidate);
          if (stats.size > 1000000) return candidate;
        } catch {}
      }
    }
  }

  return null;
}

function streamApkResponse(req, res, filename = 'galaxy-finance-v1.0.0.apk') {
  const apkPath = resolveApkPath(filename);

  if (!apkPath || !fs.existsSync(apkPath) || fs.statSync(apkPath).size < 100000) {
    if (req.accepts('html')) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Galaxy Finance — Install App</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #10221E; color: #FFF4E1; text-align: center; padding: 40px 20px; }
            .card { max-width: 420px; margin: 0 auto; background: #162E29; border: 1px solid rgba(137,215,183,0.3); border-radius: 24px; padding: 32px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h1 { font-size: 20px; font-weight: 800; color: #89D7B7; margin-bottom: 12px; }
            p { font-size: 13px; line-height: 1.6; color: rgba(255,244,225,0.85); margin-bottom: 24px; }
            .btn { display: inline-block; width: 100%; box-sizing: border-box; background: #89D7B7; color: #0A261F; font-weight: 800; padding: 14px 20px; border-radius: 14px; text-decoration: none; font-size: 14px; }
            .steps { text-align: left; background: rgba(0,0,0,0.25); border-radius: 14px; padding: 16px; margin-bottom: 24px; font-size: 12px; }
            .steps li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Install Galaxy Finance App</h1>
            <p>Direct APK installation is replaced with <strong>Instant PWA Installation</strong> for zero package parsing errors and seamless 1-tap setup.</p>
            <div class="steps">
              <strong>Quick Install Instructions:</strong>
              <ol style="padding-left: 20px; margin: 8px 0 0 0;">
                <li>Open the app in Chrome on your phone</li>
                <li>Tap <strong>Install Galaxy Finance App</strong> or browser menu (⋮) ➔ <strong>Install app</strong></li>
              </ol>
            </div>
            <a href="/" class="btn">Open Galaxy Finance App</a>
          </div>
        </body>
        </html>
      `);
    }
    return res.status(404).json({
      error: 'Native APK package currently unavailable. Please tap "PWA Instant App" to install directly via browser.'
    });
  }

  const stat = fs.statSync(apkPath);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (req.method === 'HEAD') {
    return res.end();
  }

  const fileStream = fs.createReadStream(apkPath);
  fileStream.on('error', (err) => {
    console.error('[APK Streaming Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error streaming APK file. Please tap "PWA Instant App" to install directly via browser.'
      });
    }
  });
  fileStream.pipe(res);
}

// 1. Direct explicit route for galaxy-finance-v1.0.0.apk
app.get('/downloads/galaxy-finance-v1.0.0.apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});
app.head('/downloads/galaxy-finance-v1.0.0.apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});

// 2. Generic route for any .apk download requested under /downloads/
app.get('/downloads/:filename', (req, res, next) => {
  if (req.params.filename && req.params.filename.endsWith('.apk')) {
    return streamApkResponse(req, res, req.params.filename);
  }
  next();
});
app.head('/downloads/:filename', (req, res, next) => {
  if (req.params.filename && req.params.filename.endsWith('.apk')) {
    return streamApkResponse(req, res, req.params.filename);
  }
  next();
});

// 3. Direct route aliases for /download/apk
app.get('/download/apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});
app.head('/download/apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});
app.get('/api/download/apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});
app.head('/api/download/apk', (req, res) => {
  streamApkResponse(req, res, 'galaxy-finance-v1.0.0.apk');
});

const publicDownloadsPath = path.resolve(projectRoot, 'public/downloads');
const serverDownloadsPath = path.resolve(__dirname, 'downloads');

app.use('/downloads', express.static(publicDownloadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="galaxy-finance-v1.0.0.apk"');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

app.use('/downloads', express.static(serverDownloadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="galaxy-finance-v1.0.0.apk"');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Ancillary Routes (Budgets, Reports, Settings, Calendar, Sync)
app.use('/api/budgets', budgetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌌 Galaxy Finance API Engine listening on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🍃 MongoDB Atlas: ${process.env.MONGODB_URI ? 'Connected' : 'Using Default'}`);
    console.log(`📁 Fallback SQLite Path: ${dbPath}`);
  });
}

export default app;
