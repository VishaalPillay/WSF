
import { createClient } from '@supabase/supabase-js';
import { CRIME_ZONES } from '../data/crimeZones';
import 'dotenv/config'; // Load env vars

// Helper to get client with env vars from process (for script execution)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function resetAndSeedZones() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("❌ Missing Supabase env variables. Make sure .env.local exists.");
        return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('🔄 Starting full zone reset...');

    // 1. Delete ALL existing zones
    console.log('📍 Step 1: Deleting ALL existing zones from Supabase...');
    const { error: deleteError } = await supabase
        .from('zones')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('❌ Error deleting zones:', deleteError);
        return;
    }
    console.log('✅ All zones deleted.');

    // 2. Insert 12 default zones
    console.log('📍 Step 2: Seeding 12 default zones...');

    const zonesToInsert = CRIME_ZONES.map(zone => ({
        name: zone.location,
        risk_level: zone.severity === 'HIGH' ? 'red' : zone.severity === 'MODERATE' ? 'yellow' : 'green',
        description: zone.description,
        polygon_geojson: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [zone.lng, zone.lat]
            }
        },
        active_hours: zone.active_hours || null
    }));

    const { error: insertError } = await supabase
        .from('zones')
        .insert(zonesToInsert);

    if (insertError) {
        console.error('❌ Error inserting zones:', insertError);
    } else {
        console.log(`✅ Successfully seeded ${zonesToInsert.length} zones!`);
    }

    console.log('🎉 Reset complete! You should now have exactly 12 zones.');
}

resetAndSeedZones();
