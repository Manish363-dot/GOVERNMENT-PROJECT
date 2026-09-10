-- ============================================================
-- FULL ZILA PANCHAYAT SAFAI DATABASE SETUP
-- Run this single file in the Supabase SQL Editor.
-- It will safely drop existing tables/types and recreate them.
-- ============================================================

-- ============================================================
-- 0. CLEANUP (Safely remove existing to prevent 'already exists' errors)
-- ============================================================
DROP TABLE IF EXISTS complaint_updates CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS vehicle_location_history CASCADE;
DROP TABLE IF EXISTS vehicle_current_locations CASCADE;
DROP TABLE IF EXISTS vehicle_gps_assignments CASCADE;
DROP TABLE IF EXISTS gps_devices CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS vehicle_type_enum CASCADE;
DROP TYPE IF EXISTS device_status CASCADE;
DROP TYPE IF EXISTS complaint_type_enum CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;

DROP FUNCTION IF EXISTS generate_complaint_number CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

DROP SEQUENCE IF EXISTS complaint_number_seq CASCADE;


-- ============================================================
-- Zila Panchayat Safai — Database Schema
-- Smart Waste Collection Tracking & Complaint Management
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE vehicle_status AS ENUM ('moving', 'idle', 'offline');
CREATE TYPE vehicle_type_enum AS ENUM ('truck', 'mini_truck', 'auto', 'other');
CREATE TYPE device_status AS ENUM ('active', 'inactive');
CREATE TYPE complaint_type_enum AS ENUM ('vehicle_not_arrived', 'garbage_not_collected', 'other');
CREATE TYPE complaint_status AS ENUM ('new', 'in_progress', 'resolved');

-- ============================================================
-- 1. PROFILES (linked to auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Admin user profiles linked to Supabase Auth';

-- ============================================================
-- 2. VEHICLES
-- ============================================================

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_name TEXT,
  vehicle_type vehicle_type_enum NOT NULL DEFAULT 'truck',
  status vehicle_status NOT NULL DEFAULT 'offline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vehicles IS 'Garbage collection vehicles';

-- ============================================================
-- 3. GPS DEVICES
-- ============================================================

CREATE TABLE gps_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT,
  device_identifier TEXT NOT NULL UNIQUE,
  imei TEXT,
  status device_status NOT NULL DEFAULT 'inactive',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE gps_devices IS 'Physical GPS tracker devices';

-- ============================================================
-- 4. VEHICLE GPS ASSIGNMENTS
-- ============================================================

CREATE TABLE vehicle_gps_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  gps_device_id UUID NOT NULL REFERENCES gps_devices(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE vehicle_gps_assignments IS 'Links GPS devices to vehicles with assignment history';

-- Only one active assignment per GPS device
CREATE UNIQUE INDEX idx_unique_active_device
  ON vehicle_gps_assignments(gps_device_id)
  WHERE is_active = TRUE;

-- Only one active assignment per vehicle
CREATE UNIQUE INDEX idx_unique_active_vehicle
  ON vehicle_gps_assignments(vehicle_id)
  WHERE is_active = TRUE;

-- ============================================================
-- 5. VEHICLE CURRENT LOCATIONS
-- ============================================================

CREATE TABLE vehicle_current_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE,
  gps_device_id UUID REFERENCES gps_devices(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  status vehicle_status NOT NULL DEFAULT 'idle',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vehicle_current_locations IS 'Latest known location of each vehicle (upsert pattern on vehicle_id)';

-- ============================================================
-- 6. VEHICLE LOCATION HISTORY
-- ============================================================

CREATE TABLE vehicle_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  gps_device_id UUID REFERENCES gps_devices(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vehicle_location_history IS 'GPS breadcrumb trail for daily route history';

-- ============================================================
-- 7. COMPLAINTS
-- ============================================================

CREATE SEQUENCE complaint_number_seq START 1;

CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  area TEXT NOT NULL,
  complaint_type complaint_type_enum NOT NULL,
  description TEXT,
  status complaint_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE complaints IS 'Citizen complaints about waste collection';

-- Auto-generate complaint number: ZP-YYYY-00001
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.complaint_number := 'ZP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(NEXTVAL('complaint_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_complaint_number
  BEFORE INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION generate_complaint_number();

-- ============================================================
-- 8. COMPLAINT UPDATES
-- ============================================================

CREATE TABLE complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status complaint_status NOT NULL,
  remark TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE complaint_updates IS 'Audit trail for complaint status changes';

-- ============================================================
-- UTILITY: Auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_current_locations_updated_at
  BEFORE UPDATE ON vehicle_current_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- REALTIME: Enable for live tracking and complaints
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_current_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;


-- ============================================================
-- Zila Panchayat Safai — Row Level Security Policies
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_gps_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_current_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- VEHICLES
-- ============================================================

CREATE POLICY "vehicles_select_authenticated"
  ON vehicles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "vehicles_insert_authenticated"
  ON vehicles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "vehicles_update_authenticated"
  ON vehicles FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "vehicles_delete_authenticated"
  ON vehicles FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- GPS DEVICES
-- ============================================================

CREATE POLICY "gps_devices_select_authenticated"
  ON gps_devices FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "gps_devices_insert_authenticated"
  ON gps_devices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gps_devices_update_authenticated"
  ON gps_devices FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gps_devices_delete_authenticated"
  ON gps_devices FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- VEHICLE GPS ASSIGNMENTS
-- ============================================================

CREATE POLICY "assignments_select_authenticated"
  ON vehicle_gps_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "assignments_insert_authenticated"
  ON vehicle_gps_assignments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "assignments_update_authenticated"
  ON vehicle_gps_assignments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "assignments_delete_authenticated"
  ON vehicle_gps_assignments FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- VEHICLE CURRENT LOCATIONS
-- ============================================================

CREATE POLICY "current_locations_select_authenticated"
  ON vehicle_current_locations FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- VEHICLE LOCATION HISTORY
-- ============================================================

CREATE POLICY "location_history_select_authenticated"
  ON vehicle_location_history FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- COMPLAINTS
-- ============================================================

CREATE POLICY "complaints_insert_public"
  ON complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "complaints_select_authenticated"
  ON complaints FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "complaints_update_authenticated"
  ON complaints FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- COMPLAINT UPDATES
-- ============================================================

CREATE POLICY "complaint_updates_select_authenticated"
  ON complaint_updates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "complaint_updates_insert_authenticated"
  ON complaint_updates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- Zila Panchayat Safai — Database Indexes
-- Optimized for real-time tracking, daily history, and complaints
-- ============================================================

CREATE INDEX idx_vehicles_number ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);

CREATE INDEX idx_gps_devices_identifier ON gps_devices(device_identifier);
CREATE INDEX idx_gps_devices_imei ON gps_devices(imei) WHERE imei IS NOT NULL;
CREATE INDEX idx_gps_devices_status ON gps_devices(status);

CREATE INDEX idx_assignments_vehicle ON vehicle_gps_assignments(vehicle_id);
CREATE INDEX idx_assignments_device ON vehicle_gps_assignments(gps_device_id);

CREATE INDEX idx_current_locations_vehicle ON vehicle_current_locations(vehicle_id);
CREATE INDEX idx_current_locations_updated ON vehicle_current_locations(updated_at DESC);

CREATE INDEX idx_location_history_vehicle_time
  ON vehicle_location_history(vehicle_id, recorded_at DESC);

CREATE INDEX idx_location_history_device_time
  ON vehicle_location_history(gps_device_id, recorded_at DESC);

CREATE INDEX idx_location_history_recorded_at
  ON vehicle_location_history(recorded_at DESC);

CREATE INDEX idx_complaints_number ON complaints(complaint_number);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaints_type ON complaints(complaint_type);
CREATE INDEX idx_complaints_status_created ON complaints(status, created_at DESC);

CREATE INDEX idx_complaint_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX idx_complaint_updates_updated_at ON complaint_updates(updated_at DESC);
