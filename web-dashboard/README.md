# SENTRA Authority Dashboard (web-dashboard)

## Setup
1) Install deps: `npm install`
2) Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` (your project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key)
   - `NEXT_PUBLIC_MAPBOX_TOKEN` (public Mapbox token)
3) Run dev server: `npm run dev`

## Supabase schema
Use `supabase/schema.sql` in the SQL editor to create tables, RLS, and seed demo data (incidents, live locations, zones). Realtime is enabled for `incidents` and `live_locations`.

## Key folders
- `app/`: Next.js app shell, map/overlay/sidebar layout
- `src/components/`: UI components (map, alerts, stats, drawer)
- `src/hooks/`: Supabase auth + realtime streams
- `src/lib/`: Supabase client factory
- `supabase/`: SQL schema and seeds

## Notes
- Map needs `NEXT_PUBLIC_MAPBOX_TOKEN` to render.
- Dashboard uses anon key with RLS to gate access; adjust policies in `supabase/schema.sql` for production.
