-- =====================================================
-- SENTRA/TRAVEL-MATE Web Dashboard
-- Complete Supabase Schema Migration
-- =====================================================
-- This script creates all tables needed for the web dashboard
-- to track users, locations, incidents, zones, and responders
-- =====================================================

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
-- Stores user registration data from mobile app
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- =====================================================
-- 2. LIVE LOCATIONS TABLE
-- =====================================================
-- Real-time user location tracking with mesh network support
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  battery_level INTEGER,
  is_sos_active BOOLEAN DEFAULT FALSE,
  zone_status TEXT CHECK (zone_status IN ('safe', 'warning', 'danger')),
  source_type TEXT DEFAULT 'online' CHECK (source_type IN ('online', 'mesh')),
  mesh_hop_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast location queries
CREATE INDEX IF NOT EXISTS idx_live_locations_user_id ON live_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_live_locations_updated_at ON live_locations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_locations_sos ON live_locations(is_sos_active) WHERE is_sos_active = TRUE;

-- =====================================================
-- 3. INCIDENTS TABLE
-- =====================================================
-- SOS alerts, audio detections, and zone violations
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'monitoring', 'resolved', 'escalated')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  zone_id UUID,
  notes TEXT,
  source TEXT CHECK (source IN ('audio', 'manual', 'device', 'route')),
  trigger_source TEXT DEFAULT 'manual',
  display_name TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes for incident queries
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_open ON incidents(status) WHERE status IN ('open', 'acknowledged');

-- =====================================================
-- 4. ZONES TABLE
-- =====================================================
-- Danger zones with polygon boundaries (RED/YELLOW/GREEN)
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

-- Indexes for zone queries
CREATE INDEX IF NOT EXISTS idx_zones_risk_level ON zones(risk_level);
CREATE INDEX IF NOT EXISTS idx_zones_name ON zones(name);

-- =====================================================
-- 5. RESPONDERS TABLE
-- =====================================================
-- Police, volunteers, and medical personnel tracking
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

-- Indexes for responder queries
CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_type ON responders(type);
CREATE INDEX IF NOT EXISTS idx_responders_active ON responders(status) WHERE status IN ('active', 'responding');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE responders ENABLE ROW LEVEL SECURITY;

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
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample zones

/*
INSERT INTO zones (name, risk_level, polygon_geojson, description, active_hours) VALUES
('Katpadi Railway Station', 'red', '{"type":"Polygon","coordinates":[[[79.1541,12.9714],[79.1561,12.9714],[79.1561,12.9734],[79.1541,12.9734],[79.1541,12.9714]]]}', 'High crime area near TASMAC and railway station', '8:00 PM - 6:00 AM'),
('VIT Main Gate', 'yellow', '{"type":"Polygon","coordinates":[[[79.1549,12.9682],[79.1569,12.9682],[79.1569,12.9702],[79.1549,12.9702],[79.1549,12.9682]]]}', 'Moderate risk zone with harassment incidents', '9:00 PM - 5:00 AM'),
('Green Circle Area', 'red', '{"type":"Polygon","coordinates":[[[79.1560,12.9670],[79.1580,12.9670],[79.1580,12.9690],[79.1560,12.9690],[79.1560,12.9670]]]}', 'Critical high-risk zone', '7:00 PM - 6:00 AM');
*/
