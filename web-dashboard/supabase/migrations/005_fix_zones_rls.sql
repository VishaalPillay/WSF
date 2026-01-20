-- Enable Row Level Security (if not already enabled)
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON zones;
DROP POLICY IF EXISTS "Allow public insert access" ON zones;
DROP POLICY IF EXISTS "Allow public update access" ON zones;
DROP POLICY IF EXISTS "Allow public delete access" ON zones;

-- Create permissive policies for testing/demo
-- 1. Allow everyone to READ zones
CREATE POLICY "Allow public read access"
ON zones FOR SELECT
TO public
USING (true);

-- 2. Allow everyone to INSERT zones
CREATE POLICY "Allow public insert access"
ON zones FOR INSERT
TO public
WITH CHECK (true);

-- 3. Allow everyone to UPDATE zones
CREATE POLICY "Allow public update access"
ON zones FOR UPDATE
TO public
USING (true);

-- 4. Allow everyone to DELETE zones
CREATE POLICY "Allow public delete access"
ON zones FOR DELETE
TO public
USING (true);
