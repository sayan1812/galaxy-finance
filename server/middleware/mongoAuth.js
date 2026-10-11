import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'galaxy-finance-secure-jwt-secret-2026';

/**
 * Authentication middleware that extracts user from JWT Bearer header or cookie
 */
export async function authenticateOrDemo(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies.token || req.cookies.rupeewise_session)) {
      token = req.cookies.token || req.cookies.rupeewise_session;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id || decoded.userId || decoded.sub);
        if (user) {
          req.user = user;
          req.user.id = user._id.toString();
          req.userId = user._id;
          return next();
        }
      } catch {
        // Token invalid or expired
      }
    }

    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  } catch (error) {
    console.error('[Auth Error]:', error);
    next(error);
  }
}

export default authenticateOrDemo;
