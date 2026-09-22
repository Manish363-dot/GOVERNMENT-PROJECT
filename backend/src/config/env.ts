import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  ADMIN_PASSKEY: z.string().min(1, 'ADMIN_PASSKEY is required'),
  TRACCAR_BASE_URL: z.string().optional(),
  TRACCAR_API_TOKEN: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
