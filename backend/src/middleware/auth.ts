import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware: Verify custom JWT from Authorization header.
 * Extracts user ID, email, and role, attaches to request.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Prefer cookie over Authorization header
    const token = req.cookies?.access_token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      res.status(401).json({ error: 'Missing or invalid authentication token' });
      return;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware factory: Require a specific role to access a route.
 * Must be used AFTER authMiddleware.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: `Insufficient permissions. Required role: ${roles.join(' or ')}.` });
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole('admin', 'super_admin');
export const requireSuperAdmin = requireRole('super_admin');
