-- SENTRA Supabase schema for authority dashboard
-- Run in Supabase SQL editor. Adjust policies as needed for production.

create extension if not exists "uuid-ossp";
create extension if not exists cube;
create extension if not exists earthdistance;

-- Authority profiles (optional mapping for dashboard roles)
create table if not exists authority_users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid,
  email text,
  display_name text,
  role text not null default 'authority',
  phone text,
  badge_id text,
  station text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure auth_user_id exists if the table was created previously without it
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'authority_users' and column_name = 'auth_user_id'
  ) then
    alter table authority_users add column auth_user_id uuid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_indexes where tablename = 'authority_users' and indexname = 'authority_users_auth_user_id_idx'
  ) then
    create unique index authority_users_auth_user_id_idx on authority_users(auth_user_id);
  end if;
end $$;

-- App users (mobile) for tying auth uid to profile and push tokens
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid,
  email text,
  display_name text,
  phone text,
  device_platform text,
  push_token text,
  last_location_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_indexes where tablename = 'users' and indexname = 'users_auth_user_id_idx'
  ) then
    create unique index users_auth_user_id_idx on users(auth_user_id);
  end if;
end $$;

-- Incidents triggered by devices / audio model / manual SOS
create table if not exists incidents (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  status text not null default 'open', -- open | acknowledged | monitoring | resolved | escalated
  severity text not null default 'medium', -- low | medium | high
  latitude double precision not null,
  longitude double precision not null,
  notes text,
  assigned_to text,
  source text, -- audio | manual | device
  display_name text,
  zone_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz,
  resolved_at timestamptz
);
create index if not exists incidents_status_idx on incidents(status);
create index if not exists incidents_created_idx on incidents(created_at desc);
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'incidents' and column_name in ('latitude', 'longitude')
  ) then
    if not exists (
      select 1 from pg_indexes where tablename = 'incidents' and indexname = 'incidents_geo_idx'
    ) then
      execute 'create index incidents_geo_idx on incidents using gist (ll_to_earth(latitude, longitude))';
    end if;
  end if;
end $$;

-- Live location stream per user
create table if not exists live_locations (
  user_id text primary key,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  speed double precision,
  updated_at timestamptz default now()
);
create index if not exists live_locations_updated_idx on live_locations(updated_at desc);

-- Risk zones (optional; for heatmap/fill layers)
create table if not exists vit_zones (
  id uuid primary key default uuid_generate_v4(),
  name text,
  risk_level text not null default 'yellow', -- green | yellow | red
  polygon_geojson jsonb,
  created_at timestamptz default now()
);
create index if not exists vit_zones_risk_idx on vit_zones(risk_level);

-- Enable Realtime
alter publication supabase_realtime add table incidents;
alter publication supabase_realtime add table live_locations;

-- Basic RLS (demo-friendly). Tighten for production.
alter table authority_users enable row level security;
alter table incidents enable row level security;
alter table live_locations enable row level security;
alter table vit_zones enable row level security;
alter table users enable row level security;

-- Helper predicate: treat anyone with jwt claim role='authority' as an authority
create or replace function is_authority() returns boolean language sql stable as $$
  select coalesce((auth.jwt() ->> 'role') = 'authority', false);
$$;

-- Authority can read everything
drop policy if exists authority_read_incidents on incidents;
create policy authority_read_incidents on incidents for select using (is_authority());

drop policy if exists authority_read_locations on live_locations;
create policy authority_read_locations on live_locations for select using (is_authority());

drop policy if exists authority_read_zones on vit_zones;
create policy authority_read_zones on vit_zones for select using (is_authority());

drop policy if exists authority_read_self on authority_users;
create policy authority_read_self on authority_users for select using (is_authority());

drop policy if exists authority_read_users on users;
create policy authority_read_users on users for select using (is_authority());

drop policy if exists user_self_read on users;
create policy user_self_read on users for select using (auth.uid() = auth_user_id);

drop policy if exists user_self_update on users;
create policy user_self_update on users for update using (auth.uid() = auth_user_id);

-- Authority can update incident status (ack/resolve)
drop policy if exists authority_update_incidents on incidents;
create policy authority_update_incidents on incidents for update using (is_authority());

-- Devices (authenticated users) can insert incidents and upsert their own location
drop policy if exists device_insert_incidents on incidents;
create policy device_insert_incidents on incidents for insert with check (auth.role() = 'authenticated');

drop policy if exists device_upsert_location on live_locations;
create policy device_upsert_location on live_locations for insert with check (auth.uid()::text = user_id);

drop policy if exists device_update_location on live_locations;
create policy device_update_location on live_locations for update using (auth.uid()::text = user_id);

-- Public map read (optional). Comment out if not desired.
-- drop policy if exists public_incident_read on incidents;
-- create policy public_incident_read on incidents for select using (true);

-- Sample seed data (adjust coordinates to VIT campus region)
insert into incidents (id, user_id, status, severity, latitude, longitude, notes, source, display_name)
values
  (uuid_generate_v4(), 'user-101', 'open', 'high', 12.9696, 79.1589, 'Audio model detected scream near Katpadi road', 'audio', 'Student A'),
  (uuid_generate_v4(), 'user-102', 'acknowledged', 'medium', 12.9724, 79.1551, 'Manual SOS', 'device', 'Student B'),
  (uuid_generate_v4(), 'user-103', 'resolved', 'low', 12.9669, 79.1602, 'Zone patrol cleared', 'manual', 'Student C')
on conflict do nothing;

insert into live_locations (user_id, latitude, longitude, heading, speed)
values
  ('user-101', 12.9696, 79.1589, 185, 1.1),
  ('user-102', 12.9724, 79.1551, 42, 0.6)
on conflict (user_id) do update set latitude = excluded.latitude, longitude = excluded.longitude, heading = excluded.heading, speed = excluded.speed, updated_at = now();

insert into vit_zones (id, name, risk_level, polygon_geojson)
values
  (uuid_generate_v4(), 'Katpadi Junction', 'red', '{"type":"Polygon","coordinates":[[[79.155,12.968],[79.160,12.968],[79.160,12.973],[79.155,12.973],[79.155,12.968]]]}'),
  (uuid_generate_v4(), 'Main Gate', 'yellow', '{"type":"Polygon","coordinates":[[[79.160,12.970],[79.164,12.970],[79.164,12.974],[79.160,12.974],[79.160,12.970]]]}')
on conflict do nothing;
