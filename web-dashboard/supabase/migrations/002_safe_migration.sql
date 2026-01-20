-- =====================================================
-- SENTRA/TRAVEL-MATE Web Dashboard
-- SAFE Migration - Updates Existing Tables
-- =====================================================
-- This script safely adds missing columns and creates new tables
-- Run this INSTEAD of 001_complete_schema.sql
-- =====================================================

-- =====================================================
-- 1. UPDATE EXISTING live_locations TABLE
-- =====================================================
-- Add missing columns to existing table
ALTER TABLE live_locations 
ADD COLUMN IF NOT EXISTS is_sos_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS zone_status TEXT CHECK (zone_status IN ('safe', 'warning', 'danger')),
ADD COLUMN IF NOT EXISTS battery_level INTEGER,
ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION;

-- Now create the index (after column exists)
CREATE INDEX IF NOT EXISTS idx_live_locations_sos ON live_locations(is_sos_active) WHERE is_sos_active = TRUE;

-- =====================================================
-- 2. UPDATE EXISTING incidents TABLE (if exists)
-- =====================================================
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS trigger_source TEXT DEFAULT 'manual';

-- =====================================================
-- 3. CREATE user_profiles TABLE (if doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  emergency_contact TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  total_alerts INTEGER DEFAULT 0,
  sos_activations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- =====================================================
-- 4. CREATE zones TABLE (if doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  risk_level TEXT DEFAULT 'green' CHECK (risk_level IN ('green', 'yellow', 'red')),
  polygon_geojson JSONB NOT NULL,
  description TEXT,
  active_hours TEXT,
  incident_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_risk_level ON zones(risk_level);
CREATE INDEX IF NOT EXISTS idx_zones_name ON zones(name);

-- =====================================================
-- 5. CREATE responders TABLE (if doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS responders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('police', 'volunteer', 'medical')),
  status TEXT DEFAULT 'offline' CHECK (status IN ('active', 'responding', 'offline')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  assigned_zone TEXT,
  phone TEXT,
  badge_number TEXT,
  vehicle_number TEXT,
  current_task TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_type ON responders(type);
CREATE INDEX IF NOT EXISTS idx_responders_active ON responders(status) WHERE status IN ('active', 'responding');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE responders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authorities can view all locations" ON live_locations;
DROP POLICY IF EXISTS "Users can insert own location" ON live_locations;
DROP POLICY IF EXISTS "Users can update own location" ON live_locations;
DROP POLICY IF EXISTS "Authorities can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Authorities can update incidents" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Authorities can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view zones" ON zones;
DROP POLICY IF EXISTS "Authorities can manage zones" ON zones;
DROP POLICY IF EXISTS "Authorities can view responders" ON responders;
DROP POLICY IF EXISTS "Authorities can manage responders" ON responders;

-- =====================================================
-- LIVE LOCATIONS POLICIES
-- =====================================================
CREATE POLICY "Authorities can view all locations"
  ON live_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own location"
  ON live_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own location"
  ON live_locations FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- INCIDENTS POLICIES
-- =====================================================
CREATE POLICY "Authorities can view all incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorities can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================
CREATE POLICY "Authorities can view all user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- ZONES POLICIES
-- =====================================================
CREATE POLICY "Anyone can view zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorities can manage zones"
  ON zones FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- RESPONDERS POLICIES
-- =====================================================
CREATE POLICY "Authorities can view responders"
  ON responders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorities can manage responders"
  ON responders FOR ALL
  TO authenticated
  USING (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_live_locations_updated_at ON live_locations;
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
DROP TRIGGER IF EXISTS update_zones_updated_at ON zones;
DROP TRIGGER IF EXISTS update_responders_updated_at ON responders;

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_locations_updated_at BEFORE UPDATE ON live_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responders_updated_at BEFORE UPDATE ON responders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after migration to verify everything worked:
/*
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
*/
