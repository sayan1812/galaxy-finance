import express from 'express';
import crypto from 'node:crypto';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

/**
 * Helper to dispatch notification in DB & simulate push
 */
export function dispatchNotification(userId, { title, body, type = 'general', data = {} }) {
  try {
    const id = 'notif_' + crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Check if user has notifications enabled
    const userSettings = db.prepare('SELECT notifications FROM user_settings WHERE user_id = ?').get(userId);
    if (userSettings && userSettings.notifications === 0) {
      return null;
    }

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, body, type, data, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, userId, title, body, type, JSON.stringify(data), now);

    return { id, title, body, type, createdAt: now };
  } catch (err) {
    console.error('[Notification Dispatch Error]:', err);
    return null;
  }
}

/**
 * GET /api/notifications
 * Lists recent notifications for current authenticated user
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const notifs = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(id) as count FROM notifications 
      WHERE user_id = ? AND read = 0
    `).get(req.userId)?.count || 0;

    const formatted = notifs.map(n => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      data: n.data ? JSON.parse(n.data) : {},
      read: Boolean(n.read),
      createdAt: n.created_at
    }));

    res.json({
      notifications: formatted,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/register-token
 * Registers an Expo push token for the device
 */
router.post('/register-token', requireAuth, (req, res) => {
  try {
    const { token, platform = 'mobile' } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const now = new Date().toISOString();
    const existing = db.prepare('SELECT id FROM push_subscriptions WHERE user_id = ? AND token = ?').get(req.userId, token);

    if (existing) {
      db.prepare('UPDATE push_subscriptions SET updated_at = ?, enabled = 1 WHERE id = ?').run(now, existing.id);
    } else {
      const id = 'sub_' + crypto.randomUUID();
      db.prepare(`
        INSERT INTO push_subscriptions (id, user_id, token, platform, enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `).run(id, req.userId, token, platform, now, now);
    }

    res.json({ success: true, message: 'Push token registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/mark-read
 * Marks all or specific notifications as read
 */
router.post('/mark-read', requireAuth, (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(id, req.userId);
    } else {
      db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.userId);
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/trigger-test
 * Sends a test push notification to verify the mobile device integration
 */
router.post('/trigger-test', requireAuth, (req, res) => {
  try {
    const { type = 'budget' } = req.body;
    let title = '🌌 Galaxy Finance Alert';
    let body = 'Welcome to Galaxy Finance Mobile! Real-time alerts are connected.';

    if (type === 'transaction') {
      title = '💳 New Transaction Detected';
      body = '₹450 spent at Swiggy via UPI (HDFC Bank).';
    } else if (type === 'budget') {
      title = '⚠️ Budget Warning (80% Used)';
      body = 'You have used 80% of your Food & Dining budget for this month.';
    } else if (type === 'security') {
      title = '🔒 New Sign-In Verification';
      body = 'A new session was authenticated on Galaxy Mobile App.';
    }

    const notif = dispatchNotification(req.userId, {
      title,
      body,
      type,
      data: { timestamp: Date.now(), test: true }
    });

    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
