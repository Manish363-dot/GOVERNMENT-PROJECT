import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';

interface CachedToken {
  user: any;
  expiresAt: number;
}

// In-memory cache for verified tokens (2 minute TTL)
const tokenCache = new Map<string, CachedToken>();
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * Middleware: Verify Supabase JWT from Authorization header.
 * Extracts user ID and email, attaches to request.
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

    // Check memory cache first to avoid remote network latency on every request
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expiresAt) {
      req.userId = cached.user.id;
      req.userEmail = cached.user.email;
      req.user = cached.user;
      next();
      return;
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      tokenCache.delete(token);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Save to cache
    tokenCache.set(token, {
      user: data.user,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    req.userId = data.user.id;
    req.userEmail = data.user.email;
    req.user = data.user;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

