# Supabase — Zila Panchayat Safai

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Keys** (anon key + service role key)

### 2. Run Database Migrations

Execute the SQL migration files **in order** in the Supabase SQL Editor:

1. `migrations/001_initial_schema.sql` — Creates all tables, enums, sequences, and triggers
2. `migrations/002_rls_policies.sql` — Enables Row Level Security on all tables
3. `migrations/003_indexes.sql` — Creates performance indexes

### 3. Configure Environment Variables

Copy the Supabase credentials to your `.env` files:

**backend/.env**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

**frontend/.env**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Realtime

Realtime is automatically enabled for:
- `vehicle_current_locations` — Live vehicle tracking
- `complaints` — New complaint notifications

This is configured in `001_initial_schema.sql` via `ALTER PUBLICATION`.

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Admin user profiles (linked to auth.users) |
| `vehicles` | Garbage collection vehicles |
| `gps_devices` | Physical GPS tracker devices |
| `vehicle_gps_assignments` | Device ↔ Vehicle assignment history |
| `vehicle_current_locations` | Latest vehicle position (upsert) |
| `vehicle_location_history` | GPS breadcrumb trail for route history |
| `complaints` | Citizen complaints (auto-generated ZP-YYYY-NNNNN) |
| `complaint_updates` | Complaint status change audit trail |

## Security

- **Row Level Security** is enabled on all tables
- **Public users** can only INSERT complaints
- **Authenticated admins** have full access to all data
- **GPS data ingestion** uses the service role key (bypasses RLS)
- **Service role key** is stored only in the backend, never exposed to frontend
