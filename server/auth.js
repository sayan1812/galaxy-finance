import crypto from 'node:crypto';
import db, { verifyPassword } from './db.js';

const SESSION_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MINUTES = 5;
const EMAIL_TOKEN_EXPIRY_HOURS = 24;

// Password hashing
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' };
  }
  return { valid: true };
}

// Token hashing for security (never store plain tokens/OTPs)
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

// Session Management
export function createSession(userId) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const sessionId = 'ses_' + crypto.randomUUID();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userId, tokenHash, expiresAt, new Date().toISOString());

  return { token: rawToken, expiresAt };
}

export function invalidateSession(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function invalidateAllUserSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

// Authentication Middleware
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.rupeewise_session;
  
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No session token provided.' });
  }

  const tokenHash = hashToken(token);
  const session = db.prepare(`
    SELECT s.id as session_id, s.user_id, s.expires_at, u.name, u.email, u.phone, u.email_verified, u.phone_verified
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ?
  `).get(tokenHash);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or revoked session token.' });
  }

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(session.session_id);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  req.userId = session.user_id;
  req.user = {
    id: session.user_id,
    name: session.name,
    email: session.email,
    phone: session.phone,
    emailVerified: Boolean(session.email_verified),
    phoneVerified: Boolean(session.phone_verified)
  };
  req.rawToken = token;

  next();
}

// OTP and Verification Tokens
export function generateOtp() {
  // 6 digit secure numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

export function createVerificationToken(userId, type, target) {
  // Rate-limiting: Check if token was requested within the last 60 seconds
  const recent = db.prepare(`
    SELECT created_at FROM verification_tokens
    WHERE user_id = ? AND type = ? AND used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(userId, type);

  if (recent) {
    const elapsed = Date.now() - new Date(recent.created_at).getTime();
    if (elapsed < 60000) {
      const waitSeconds = Math.ceil((60000 - elapsed) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
    }
  }

  const rawToken = type === 'email' 
    ? crypto.randomBytes(24).toString('hex') 
    : generateOtp();

  const tokenHash = hashToken(rawToken);
  const id = 'tok_' + crypto.randomUUID();
  const now = new Date().toISOString();
  
  const expiryDuration = type === 'email' 
    ? EMAIL_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000 
    : OTP_EXPIRY_MINUTES * 60 * 1000;

  const expiresAt = Date.now() + expiryDuration;

  // Invalidate previous unconsumed tokens of same type
  db.prepare(`
    UPDATE verification_tokens SET used = 1
    WHERE user_id = ? AND type = ? AND used = 0
  `).run(userId, type);

  db.prepare(`
    INSERT INTO verification_tokens (id, user_id, type, token_hash, target, expires_at, attempts, max_attempts, used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, 5, 0, ?)
  `).run(id, userId, type, tokenHash, target, expiresAt, now);

  return { rawToken, expiresAt };
}

export function verifyVerificationToken(userId, type, rawToken) {
  const tokenRecord = db.prepare(`
    SELECT * FROM verification_tokens
    WHERE user_id = ? AND type = ? AND used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(userId, type);

  if (!tokenRecord) {
    return { success: false, error: 'No active verification token found. Please request a new code.' };
  }

  if (Date.now() > tokenRecord.expires_at) {
    db.prepare('UPDATE verification_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (tokenRecord.attempts >= tokenRecord.max_attempts) {
    db.prepare('UPDATE verification_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);
    return { success: false, error: 'Too many incorrect attempts. Code invalidated. Please request a new one.' };
  }

  const inputHash = hashToken(rawToken);
  if (inputHash !== tokenRecord.token_hash) {
    db.prepare('UPDATE verification_tokens SET attempts = attempts + 1 WHERE id = ?').run(tokenRecord.id);
    const remaining = tokenRecord.max_attempts - (tokenRecord.attempts + 1);
    return { 
      success: false, 
      error: `Incorrect code. ${remaining > 0 ? remaining + ' attempts remaining.' : 'Code invalidated.'}` 
    };
  }

  // Mark token as used
  db.prepare('UPDATE verification_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);
  return { success: true };
}
