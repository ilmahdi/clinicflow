import { UnauthorizedError } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req, _res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie first (best practice for web browsers)
    if (req.cookies && req.cookies.clinicflow_token) {
      token = req.cookies.clinicflow_token;
    }
    // 2. Fall back to Authorization Bearer header (for API clients, tests)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        throw new UnauthorizedError('Invalid token format');
      }
    }

    if (!token) {
      throw new UnauthorizedError('Authorization token required');
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    } else {
      next(error);
    }
  }
};
