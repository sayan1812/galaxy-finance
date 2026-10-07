import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'galaxy_finance_secure_secret_key_change_in_production';

/**
 * Authentication middleware that extracts user from JWT or supplies the default demo user
 */
export async function authenticateOrDemo(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id || decoded.userId || decoded.sub);
        if (user) {
          req.user = user;
          req.userId = user._id;
          return next();
        }
      } catch {
        // Fall back to demo user if token is expired or invalid
      }
    }

    // Default to / find or seed demo user
    let demoUser = await User.findOne({ email: 'demo@rupeewise.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Executive Demo',
        email: 'demo@rupeewise.com',
        password: 'Password123!',
      });
    }

    req.user = demoUser;
    req.userId = demoUser._id;
    next();
  } catch (error) {
    console.error('[Auth Error]:', error);
    next(error);
  }
}

export default authenticateOrDemo;
