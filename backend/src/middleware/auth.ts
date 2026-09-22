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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
