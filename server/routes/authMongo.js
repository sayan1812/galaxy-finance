import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import User from '../models/User.js';
import Account from '../models/Account.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'galaxy-finance-secure-jwt-secret-2026';

function signUserToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. REGISTER (POST /api/v1/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
    });

    // Create default bank and cash accounts for initial solvency
    await Account.create([
      {
        userId: user._id,
        accountName: 'HDFC Corporate Vault',
        accountType: 'bank',
        balance: 245000,
        accountNumberMask: 'XXXX XXXX 4192',
      },
      {
        userId: user._id,
        accountName: 'Cash Reserve Wallet',
        accountType: 'cash',
        balance: 15400,
        accountNumberMask: 'PHYSICAL CASH',
      },
    ]);

    const token = signUserToken(user);

    res.cookie('rupeewise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 2. LOGIN (POST /api/v1/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginEmail = (identifier || email || '').trim().toLowerCase();

    if (!loginEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: loginEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signUserToken(user);

    res.cookie('rupeewise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// 3. GOOGLE SIGN-IN SYNC (POST /api/v1/auth/google-sync)
router.post('/google-sync', async (req, res) => {
  try {
    const { email, name, photoURL, uid } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google email is required for sync.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create user record with secure random fallback password
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'G!9';
      user = await User.create({
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: randomPassword,
      });

      // Seed initial accounts
      await Account.create([
        {
          userId: user._id,
          accountName: 'Primary Bank Vault',
          accountType: 'bank',
          balance: 100000,
          accountNumberMask: 'XXXX XXXX 1001',
        },
        {
          userId: user._id,
          accountName: 'Physical Cash Wallet',
          accountType: 'cash',
          balance: 10000,
          accountNumberMask: 'PHYSICAL CASH',
        },
      ]);
    }

    const token = signUserToken(user);

    res.cookie('rupeewise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Google account linked and synchronized with MongoDB.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: photoURL || undefined,
        googleUid: uid,
      },
    });
  } catch (err) {
    console.error('[Google Sync Error]:', err);
    res.status(500).json({ error: err.message || 'Google synchronization failed' });
  }
});

// 4. GET CURRENT AUTH USER (GET /api/v1/auth/me)
router.get('/me', authenticateOrDemo, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. LOGOUT (POST /api/v1/auth/logout)
router.post('/logout', (req, res) => {
  res.clearCookie('rupeewise_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
