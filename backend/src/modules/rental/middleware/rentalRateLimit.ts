import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Rental Admin Login (Super Admin & Sub Admin)
 * Limits to 5 attempts per 15 minutes per IP to block brute-force attacks.
 */
export const rentalAdminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many admin authentication attempts. For security reasons, please wait 15 minutes before retrying.',
    retryAfterMinutes: 15,
  },
  skipSuccessfulRequests: false,
});

/**
 * Strict Rate Limiter for Registered Rental User / Tenant Login
 * Limits to 5 attempts per 15 minutes per IP.
 */
export const rentalUserLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Your access is temporarily throttled. Please try again after 15 minutes or contact the designated officer.',
    retryAfterMinutes: 15,
  },
  skipSuccessfulRequests: false,
});

/**
 * Rate Limiter for Password Reset & Sensitive Account Operations
 * Limits to 3 attempts per 15 minutes per IP.
 */
export const rentalPasswordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many password reset requests. Please wait 15 minutes before submitting another request.',
  },
});
