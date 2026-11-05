import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUserDocument } from '../modules/users/user.model';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check cookie
    if (req.cookies && req.cookies[config.cookie.name]) {
      token = req.cookies[config.cookie.name];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies[config.cookie.name]) {
      token = req.cookies[config.cookie.name];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    }
    next();
  } catch {
    // If token invalid in optionalAuth, simply proceed without user
    next();
  }
};
