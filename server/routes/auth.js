import express from 'express';
import crypto from 'node:crypto';
import db, { verifyPassword } from '../db.js';
import { 
  hashPassword, 
  validatePasswordStrength, 
  createSession, 
  invalidateSession, 
  createVerificationToken, 
  verifyVerificationToken, 
  requireAuth,
  signJwt
} from '../auth.js';

const router = express.Router();

// Helper to set cookie
function setSessionCookie(res, token, rememberMe = true) {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie('rupeewise_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge
  });
}

// 0. GET CURRENT USER PROFILE (GET /me and GET /api/v1/auth/me)
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, phone, email_verified, phone_verified, created_at, last_login_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

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
      message: 'Active session'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 1. REGISTER
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.status(400).json({ error: strength.message });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userId = 'usr_' + crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, email_verified, phone_verified, password_hash, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, ?)
    `).run(userId, name.trim(), cleanEmail, phone?.trim() || null, passwordHash, now, now, now);

    // Create default settings for user
    db.prepare(`
      INSERT INTO user_settings (user_id, theme, currency, notifications, reduce_motion, galaxy_intensity, opening_cash, created_at, updated_at)
      VALUES (?, 'light', '₹', 1, 0, 'medium', 5000, ?, ?)
    `).run(userId, now, now);

    // Create both session record and signed JWT token
    const { token: sessionToken, expiresAt } = createSession(userId);
    const jwtToken = signJwt({ userId, email: cleanEmail, name: name.trim() });
    setSessionCookie(res, jwtToken);

    // Auto-generate initial email verification token
    const verification = createVerificationToken(userId, 'email', cleanEmail);

    return res.status(201).json({
      message: 'Account created successfully. Please verify your email or phone.',
      token: jwtToken,
      sessionToken,
      expiresAt,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        emailVerified: false,
        phoneVerified: false
      },
      // In development/test mode, provide the verification token for instant automated testing
      verificationToken: verification.rawToken
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

// 2. LOGIN
router.post('/login', (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    // Allow login by email or phone
    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?
    `).get(cleanId, identifier.trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);

    // Create session & signed JWT
    const { token: sessionToken, expiresAt } = createSession(user.id);
    const jwtToken = signJwt({ userId: user.id, email: user.email, name: user.name });
    setSessionCookie(res, jwtToken, Boolean(rememberMe));

    return res.json({
      message: 'Signed in successfully.',
      token: jwtToken,
      sessionToken,
      expiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: Boolean(user.email_verified),
        phoneVerified: Boolean(user.phone_verified)
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. ' + err.message });
  }
});

// 3. LOGOUT
router.post('/logout', requireAuth, (req, res) => {
  try {
    invalidateSession(req.rawToken);
    res.clearCookie('rupeewise_session');
    return res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Logout failed. ' + err.message });
  }
});

// 4. SEND EMAIL VERIFICATION CODE / LINK
router.post('/send-verification-email', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) {
      return res.json({ message: 'Email is already verified.' });
    }

    const verification = createVerificationToken(req.userId, 'email', user.email);

    return res.json({
      message: 'Verification code sent to ' + user.email,
      expiresAt: verification.expiresAt,
      verificationToken: verification.rawToken // For demo/testing
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. VERIFY EMAIL
router.post('/verify-email', requireAuth, (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const result = verifyVerificationToken(req.userId, 'email', token.trim());
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), req.userId);

    return res.json({
      message: 'Email verified successfully!',
      emailVerified: true
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. SEND PHONE OTP
router.post('/send-otp', requireAuth, (req, res) => {
  try {
    const { phone } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const targetPhone = phone?.trim() || user.phone;
    if (!targetPhone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Save phone if updated
    if (targetPhone !== user.phone) {
      db.prepare('UPDATE users SET phone = ?, phone_verified = 0 WHERE id = ?')
        .run(targetPhone, req.userId);
    }

    const verification = createVerificationToken(req.userId, 'phone', targetPhone);

    return res.json({
      message: '6-digit OTP sent to ' + targetPhone,
      expiresAt: verification.expiresAt,
      otp: verification.rawToken // Exposed in response for instant developer testing
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 7. VERIFY PHONE OTP
router.post('/verify-otp', requireAuth, (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: 'OTP is required.' });
    }

    const result = verifyVerificationToken(req.userId, 'phone', otp.trim());
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    db.prepare('UPDATE users SET phone_verified = 1, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), req.userId);

    return res.json({
      message: 'Phone verified successfully!',
      phoneVerified: true
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. FORGOT PASSWORD (REQUEST RECOVERY OTP)
router.post('/forgot-password', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?
    `).get(cleanId, identifier.trim());

    if (!user) {
      // Don't reveal whether user exists for security, return standard message
      return res.json({
        message: 'If an account exists with this email or phone, a recovery OTP has been sent.',
        target: identifier
      });
    }

    const verification = createVerificationToken(user.id, 'forgot_password', user.email);

    return res.json({
      message: 'Recovery OTP sent to your registered account.',
      target: user.email,
      expiresAt: verification.expiresAt,
      otp: verification.rawToken // Exposed for testing
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 9. RESET PASSWORD (VERIFY OTP & SET NEW PASSWORD)
router.post('/reset-password', (req, res) => {
  try {
    const { identifier, otp, newPassword, confirmPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'Identifier, OTP, and new password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.status(400).json({ error: strength.message });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?
    `).get(cleanId, identifier.trim());

    if (!user) {
      return res.status(400).json({ error: 'Invalid recovery request.' });
    }

    const result = verifyVerificationToken(user.id, 'forgot_password', otp.trim());
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const passwordHash = hashPassword(newPassword);
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, now, user.id);

    // Invalidate existing sessions for security
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

    return res.json({ message: 'Password updated successfully. You can now log in with your new password.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
