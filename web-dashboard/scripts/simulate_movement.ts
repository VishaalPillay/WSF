
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Simulation Config
const USER_ID = 'user-101' // ID from our seed data
const START_LAT = 12.9692  // Near VIT
const START_LNG = 79.1559
const SPEED = 0.0001 // ~10 meters per step

console.log(`🚀 Starting simulation for user: ${USER_ID}`)
console.log(`📍 Starting at: ${START_LAT}, ${START_LNG}`)

let currentLat = START_LAT
let currentLng = START_LNG
let step = 0

async function updateLocation() {
    step++

    // Simulate movement (zigzag north-east)
    currentLat += SPEED + (Math.random() * 0.00005)
    currentLng += SPEED + (Math.random() * 0.00005)

    // Random heading between 0-360
    const heading = Math.floor(Math.random() * 360)

    const payload = {
        user_id: USER_ID,
        latitude: currentLat,
        longitude: currentLng,
        heading: heading,
        speed: 5.5, // km/h
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from('live_locations')
        .upsert(payload)

    if (error) {
        console.error(`❌ Error updating location:`, error.message)
    } else {
        console.log(`✅ [Step ${step}] Updated position: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`)
    }
}

// Run every 3 seconds
setInterval(updateLocation, 3000)
