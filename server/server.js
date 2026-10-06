import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from './db.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import banksRoutes from './routes/banks.js';
import transactionsRoutes from './routes/transactions.js';
import budgetsRoutes from './routes/budgets.js';
import reportsRoutes from './routes/reports.js';
import calendarRoutes from './routes/calendar.js';
import settingsRoutes from './routes/settings.js';
import aiRoutes from './routes/ai.js';
import syncRoutes from './routes/sync.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seed Default Records
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Galaxy Finance Mobile & Web Engine',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/banks', banksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
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
    console.log(`🌌 RupeeWise API Engine listening on http://localhost:${PORT}`);
    console.log(`🔒 Security: Scrypt Password Hashing, Session Isolation, Scoped Queries Enabled`);
  });
}

export default app;
