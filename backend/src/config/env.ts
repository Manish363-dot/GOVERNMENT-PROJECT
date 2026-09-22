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
  CORS_ORIGIN: z.string().default('http://localhost:5175'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/**
 * Parse CORS_ORIGIN into an array of allowed origins.
 * Supports comma-separated values in the env var.
 */
export function getCorsOrigins(): string[] {
  return env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
}
