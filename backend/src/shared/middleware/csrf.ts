import { Request, Response, NextFunction } from 'express';
import { isOriginAllowed } from '../config/env';

/**
 * CSRF Protection Middleware via Origin/Referer Validation.
 * 
 * Protects state-changing requests (POST, PUT, PATCH, DELETE) by enforcing
 * strict verification of the request's Origin or Referer header against
 * the configured FRONTEND_URL.
 * 
 * Works in tandem with:
 * - SameSite=Lax cookies
 * - Strict CORS configuration
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Only apply to state-changing methods
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  if (!isStateChanging) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // 1. Identify the source of the request
  let requestSource = origin;
  if (!requestSource && referer) {
    try {
      // Parse the origin from the Referer URL
      const url = new URL(referer);
      requestSource = url.origin;
    } catch (e) {
      // Ignore invalid URL
    }
  }

  // 2. If no source can be identified, and it's a browser request (implied by cookie presence),
  // we could block it. However, to support mobile apps/curl, we allow requests 
  // without Origin/Referer, because CSRF only applies to browser environments 
  // where cookies are automatically attached cross-site.
  // Modern browsers ALWAYS send Origin for cross-origin POSTs.
  if (!requestSource) {
    return next();
  }

  // 3. Strict validation against allowed origins
  if (!isOriginAllowed(requestSource)) {
    console.warn(`[CSRF Blocked] Invalid request source: ${requestSource}`);
    res.status(403).json({ error: 'CSRF validation failed: Invalid Origin/Referer' });
    return;
  }

  next();
}
