
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SIMULATION DATA: Charlie Kirk
const VICTIM = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID
    name: "Charlie Kirk",
    reg_no: "21BCE2045",
    phone: "+91 98765 43210",
    location: { lat: 12.9692, lng: 79.1559 } // VIT Main Gate
};

async function startSimulation() {
    console.log(`\n🚨 INITIALIZING SENTRA AI SIMULATION...`);
    console.log(`----------------------------------------`);
    console.log(`SUBJECT: ${VICTIM.name} (${VICTIM.reg_no})`);
    console.log(`STATUS:  Safe -> DANGER`);
    console.log(`OFFICER: Jeff Epstine (Authority Dashboard)`);
    console.log(`----------------------------------------\n`);

    // 1. Simulate "AI Trigger" (Audio detected)
    console.log(`>>> [AI-CORE] Microphone Buffer Analysis...`);
    await new Promise(r => setTimeout(r, 1000));
    console.log(`>>> [AI-CORE] Pattern Match: "SCREAM" (Confidence: 98.4%)`);

    console.log(`>>> [CLOUD] Uploading last 10s audio clip...`);
    await new Promise(r => setTimeout(r, 800));

    console.log(`>>> [SENTRA] DISPATCHING CRITICAL ALERT TO DASHBOARD...`);

    const { error } = await supabase.from('incidents').insert({
        user_id: VICTIM.id, // In real app, this links to auth.users
        type: 'AI_AUDIO_THREAT',
        severity: 'high', // High triggers red pulse
        latitude: VICTIM.location.lat,
        longitude: VICTIM.location.lng,
        status: 'pending', // Pending alerts authority
        description: 'AI System detected distress sounds (Screaming/Help).',
        notes: 'Audio Clip: /secure/rec_charlie_10s.wav', // Simulated path
        display_name: `${VICTIM.name} (${VICTIM.reg_no})`,
        created_at: new Date().toISOString()
    });

    if (error) {
        console.error("❌ CRTICIAL FAILURE:", error);
    } else {
        console.log(`✅ ALERT SENT! Check the Dashboard immediately.`);
        console.log(`   Authority (Jeff Epstine) should see a RED PULSING ALERT.`);
    }

}

startSimulation();
