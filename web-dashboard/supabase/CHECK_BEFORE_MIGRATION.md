# Supabase Migration Guide

## Before Running the Migration

### Step 1: Check Existing Tables
Go to your Supabase dashboard → SQL Editor and run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

This will show you what tables already exist.

### Step 2: Backup Existing Data (if any tables exist)
If you have any of these tables with data:
- `live_locations`
- `incidents`
- `zones`
- `user_profiles`
- `responders`

**IMPORTANT**: Backup your data first! The migration uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing tables, but it's always safe to backup.

### Step 3: Run the Migration

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `001_complete_schema.sql`
3. Paste into the SQL Editor
4. Click "Run"

**Option B: Via Supabase CLI (if installed)**
```bash
supabase db push
```

### Step 4: Verify Migration Success

After running, check that all tables were created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Step 5: Test the Connection

After migration, test that the dashboard can connect:
```bash
npm run dev
```

Then check the browser console for any Supabase connection errors.

## Expected Result

You should have these tables:
- ✅ `user_profiles` - User registration data
- ✅ `live_locations` - Real-time location tracking
- ✅ `incidents` - SOS alerts and incidents
- ✅ `zones` - Danger zones with polygons
- ✅ `responders` - Police/volunteers tracking

All with proper:
- Indexes for performance
- RLS policies for security
- Triggers for `updated_at` timestamps

## Troubleshooting

**Error: "relation already exists"**
- This is OK if using `CREATE TABLE IF NOT EXISTS`
- The migration won't overwrite existing tables

**Error: "permission denied"**
- Make sure you're using the service role key or are logged in as admin
- Check that you have proper permissions in Supabase

**Error: "syntax error"**
- Make sure you copied the entire SQL file
- Check that no characters were corrupted during copy/paste

## Next Steps After Migration

1. Update dashboard hooks to use real Supabase data instead of mock data
2. Test real-time subscriptions
3. Integrate with mobile app for user registration
4. Test end-to-end data flow
