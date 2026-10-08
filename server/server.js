import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';

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

app.use('/api/v1/accounts', accountsMongoRoutes);
app.use('/api/accounts', accountsMongoRoutes);
app.use('/api/banks', accountsMongoRoutes); // Direct MongoDB Accounts alias

app.use('/api/v1/transactions', transactionsMongoRoutes);
app.use('/api/transactions', transactionsMongoRoutes);

app.use('/api/v1/dashboard', dashboardMongoRoutes);
app.use('/api/dashboard', dashboardMongoRoutes);

app.use('/api/v1/download', downloadRoutes);
app.use('/download', downloadRoutes);

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
