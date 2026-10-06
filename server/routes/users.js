import express from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, phone, email_verified, phone_verified, created_at, last_login_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId) || {
      theme: 'light',
      currency: '₹',
      notifications: 1,
      reduce_motion: 0,
      galaxy_intensity: 'medium',
      opening_cash: 7000
    };

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: Boolean(user.email_verified),
        phoneVerified: Boolean(user.phone_verified),
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      },
      settings: {
        theme: settings.theme,
        currency: settings.currency,
        notifications: Boolean(settings.notifications),
        reduceMotion: Boolean(settings.reduce_motion),
        galaxyIntensity: settings.galaxy_intensity,
        openingCash: settings.opening_cash
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/me', requireAuth, (req, res) => {
  try {
    const { name, phone } = req.body;
    const now = new Date().toISOString();

    if (name) {
      db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(name.trim(), now, req.userId);
    }
    if (phone !== undefined) {
      db.prepare('UPDATE users SET phone = ?, phone_verified = 0, updated_at = ? WHERE id = ?').run(phone?.trim() || null, now, req.userId);
    }

    const updated = db.prepare('SELECT id, name, email, phone, email_verified, phone_verified FROM users WHERE id = ?').get(req.userId);
    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        emailVerified: Boolean(updated.email_verified),
        phoneVerified: Boolean(updated.phone_verified)
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
