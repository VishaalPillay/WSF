-- TRAVEL-MATE Database Schema Updates

-- 1. Update Live Locations for Mesh Support
-- Add fields to distinguish between direct 4G connections and offline BLE mesh packets
ALTER TABLE live_locations 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'online', -- 'online' | 'mesh'
ADD COLUMN IF NOT EXISTS mesh_hop_count INTEGER DEFAULT 0, -- Number of hops (0 = direct)
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update Incidents for Detailed Analyitics
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS trigger_source TEXT DEFAULT 'manual'; -- 'manual', 'fall_detection', 'audio_analytics'

-- 3. (Optional) Create a specific table for raw mesh packets if high volume
-- CREATE TABLE mesh_packets (...);
