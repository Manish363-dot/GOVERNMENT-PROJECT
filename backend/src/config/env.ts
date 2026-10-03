import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ADMIN_PASSKEY: z.string().min(8, 'ADMIN_PASSKEY must be at least 8 characters'),
  WEBHOOK_API_KEY: z.string().min(1, 'WEBHOOK_API_KEY is required'),
  TRACCAR_BASE_URL: z.string().optional(),
  TRACCAR_API_TOKEN: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5175'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  // ── SMS / OTP Gateway ──────────────────────────────────────────────────────
  MESSAGE_CENTRAL_CUSTOMER_ID: z.string().optional(),
  MESSAGE_CENTRAL_AUTH_TOKEN: z.string().optional(),
  FAST2SMS_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // ── OTP Security Tuning (all optional — secure defaults applied) ───────────
  OTP_EXPIRY_MINUTES: z.string().default('5'),           // How long OTP is valid
  OTP_RESEND_COOLDOWN_SECONDS: z.string().default('60'), // Min wait between resends
  OTP_MAX_PER_HOUR: z.string().default('5'),             // Max OTP requests per mobile per hour
  OTP_MAX_WRONG_ATTEMPTS: z.string().default('5'),       // Max wrong guesses before lockout
  OTP_RATE_WINDOW_MINUTES: z.string().default('60'),     // Rate-limit window duration
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// ── OTP Security constants (parsed from env, with safe defaults) ─────────────
export const otpConfig = {
  expiryMs: parseInt(env.OTP_EXPIRY_MINUTES) * 60 * 1000,
  resendCooldownMs: parseInt(env.OTP_RESEND_COOLDOWN_SECONDS) * 1000,
  maxPerHour: parseInt(env.OTP_MAX_PER_HOUR),
  maxWrongAttempts: parseInt(env.OTP_MAX_WRONG_ATTEMPTS),
  rateWindowMs: parseInt(env.OTP_RATE_WINDOW_MINUTES) * 60 * 1000,
};


/**
 * Parse FRONTEND_URL into an array of allowed origins.
 * Supports comma-separated values in the env var.
 * Strips trailing slashes to prevent mismatches.
 */
export function getCorsOrigins(): string[] {
  return env.FRONTEND_URL.split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/**
 * Strictly and safely validates whether an incoming origin is allowed.
 * 
 * Security Guarantees:
 * 1. Requests with no origin (mobile apps, server-to-server, curl) -> Allowed
 * 2. Explicitly configured origins in FRONTEND_URL (e.g. deployed domain) -> Allowed
 * 3. Localhost & 127.0.0.1 on any port (for local dev/testing) -> Allowed
 * 4. Any external/unauthorized website (e.g. evil.com) -> Blocked
 */
export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, '');
  const allowed = getCorsOrigins();

  // Check configured production origins
  if (allowed.includes(normalized)) {
    return true;
  }

  // Check localhost & 127.0.0.1 on any port for local development
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(normalized);
  if (isLocalhost) {
    return true;
  }

  return false;
}
