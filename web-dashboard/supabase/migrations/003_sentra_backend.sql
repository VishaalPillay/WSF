-- =====================================================
-- SENTRA Backend Migration: New Tables for SOS & Zone Management
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. SOS CONTACTS TABLE (For Mobile App)
-- Users can store emergency contacts who get notified on SOS
CREATE TABLE IF NOT EXISTS sos_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- References auth.users(id)
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  notify_on_sos BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sos_contacts ENABLE ROW LEVEL SECURITY;

-- Users manage their own contacts
CREATE POLICY "users_own_sos_contacts" ON sos_contacts
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Authorities can view all contacts (for emergency response)
CREATE POLICY "auth_view_sos_contacts" ON sos_contacts
  FOR SELECT TO authenticated
  USING (is_authority());


-- 2. PATROL OFFICERS TABLE (Optional - for future dispatch feature)
-- Can be removed if dispatch feature is not needed
CREATE TABLE IF NOT EXISTS patrol_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  badge_number TEXT UNIQUE NOT NULL,
  assigned_zone_id UUID,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'on_break')),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  is_head BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patrol_officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_manage_patrol_officers" ON patrol_officers
  FOR ALL TO authenticated
  USING (is_authority());


-- 3. DISPATCH LOGS TABLE (Optional - for audit trail)
CREATE TABLE IF NOT EXISTS dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID,
  officer_id UUID REFERENCES patrol_officers(id),
  dispatch_type TEXT DEFAULT 'manual' CHECK (dispatch_type IN ('manual', 'auto', 'sos_triggered')),
  sms_sent BOOLEAN DEFAULT false,
  officer_response TEXT DEFAULT 'pending' CHECK (officer_response IN ('pending', 'acknowledged', 'en_route', 'arrived', 'resolved')),
  dispatched_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);

ALTER TABLE dispatch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_manage_dispatch_logs" ON dispatch_logs
  FOR ALL TO authenticated
  USING (is_authority());


-- 4. SMS LOGS TABLE (For tracking sent messages)
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('sos_alert', 'dispatch', 'zone_warning', 'system')),
  message_body TEXT NOT NULL,
  provider TEXT DEFAULT 'mock',
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
  related_incident_id UUID,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_view_sms_logs" ON sms_logs
  FOR SELECT TO authenticated
  USING (is_authority());


-- 5. Ensure ZONES table has all required columns
-- (Should already exist from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zones' AND column_name = 'active') THEN
    ALTER TABLE zones ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'zones' AND column_name = 'created_by') THEN
    ALTER TABLE zones ADD COLUMN created_by UUID;
  END IF;
END $$;


-- =====================================================
-- SEED DATA (Mock Patrol Officers - can be removed)
-- =====================================================
INSERT INTO patrol_officers (name, phone, badge_number, status, current_lat, current_lng, is_head) VALUES
  ('Officer Nikhil Kumar', '+91 98765 00001', 'VLR-HEAD-001', 'available', 12.9700, 79.1560, true),
  ('Officer Ravi Singh', '+91 98765 00002', 'VLR-POL-002', 'available', 12.9724, 79.1551, false),
  ('Officer Priya Menon', '+91 98765 00003', 'VLR-POL-003', 'available', 12.9680, 79.1570, false)
ON CONFLICT (badge_number) DO NOTHING;


-- =====================================================
-- DONE! Tables created successfully.
-- =====================================================
