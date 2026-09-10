import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Admin client with service role key — bypasses RLS
// Used for GPS data ingestion, admin operations, and signup
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client with anon key — respects RLS
// Used for operations that should respect row-level security
export const supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
