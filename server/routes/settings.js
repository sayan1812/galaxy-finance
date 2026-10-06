import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  try {
    let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
    if (!settings) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO user_settings (user_id, theme, currency, notifications, reduce_motion, galaxy_intensity, opening_cash, created_at, updated_at)
        VALUES (?, 'light', '₹', 1, 0, 'medium', 7000, ?, ?)
      `).run(req.userId, now, now);
      settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
    }

    return res.json({
      theme: settings.theme,
      currency: settings.currency,
      notifications: Boolean(settings.notifications),
      reduceMotion: Boolean(settings.reduce_motion),
      galaxyIntensity: settings.galaxy_intensity,
      openingCash: settings.opening_cash
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/', requireAuth, (req, res) => {
  try {
    const { theme, currency, notifications, reduceMotion, galaxyIntensity, openingCash } = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
    if (!existing) {
      db.prepare(`
        INSERT INTO user_settings (user_id, theme, currency, notifications, reduce_motion, galaxy_intensity, opening_cash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.userId,
        theme || 'light',
        currency || '₹',
        notifications !== undefined ? (notifications ? 1 : 0) : 1,
        reduceMotion !== undefined ? (reduceMotion ? 1 : 0) : 0,
        galaxyIntensity || 'medium',
        openingCash !== undefined ? Number(openingCash) : 7000,
        now,
        now
      );
    } else {
      db.prepare(`
        UPDATE user_settings SET
          theme = COALESCE(?, theme),
          currency = COALESCE(?, currency),
          notifications = CASE WHEN ? IS NOT NULL THEN ? ELSE notifications END,
          reduce_motion = CASE WHEN ? IS NOT NULL THEN ? ELSE reduce_motion END,
          galaxy_intensity = COALESCE(?, galaxy_intensity),
          opening_cash = CASE WHEN ? IS NOT NULL THEN ? ELSE opening_cash END,
          updated_at = ?
        WHERE user_id = ?
      `).run(
        theme || null,
        currency || null,
        notifications !== undefined ? (notifications ? 1 : 0) : null,
        notifications !== undefined ? (notifications ? 1 : 0) : null,
        reduceMotion !== undefined ? (reduceMotion ? 1 : 0) : null,
        reduceMotion !== undefined ? (reduceMotion ? 1 : 0) : null,
        galaxyIntensity || null,
        openingCash !== undefined ? Number(openingCash) : null,
        openingCash !== undefined ? Number(openingCash) : null,
        now,
        req.userId
      );
    }

    const updated = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);

    return res.json({
      message: 'Settings updated successfully',
      settings: {
        theme: updated.theme,
        currency: updated.currency,
        notifications: Boolean(updated.notifications),
        reduceMotion: Boolean(updated.reduce_motion),
        galaxyIntensity: updated.galaxy_intensity,
        openingCash: updated.opening_cash
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
