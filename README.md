# WSF — AI-Powered Women's Safety System

> **Proactive. Autonomous. Edge-First.**
> WSF does not wait for a button press. It watches, learns, routes, listens, and acts.

---

## What Is SENTRA?

WSF is an enterprise-grade, AI-driven safety ecosystem built for urban environments where conventional safety apps fall flat. Instead of a passive SOS button, WSF continuously monitors the user's surroundings, routes them through safer streets, and autonomously escalates threats — without requiring any manual interaction.

The system is purpose-built for institutions (universities, corporate campuses, police departments) and scales to any city by plugging into local incident data.

---

## System Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| **Mobile App** | Flutter + Dart | UI, sensor data, TFLite inference, native OS geofencing |
| **Backend API** | Python (FastAPI) | Safe routing, zone scoring, ML pipeline |
| **Database** | Supabase (PostgreSQL + PostGIS) | Auth, real-time location sync, geospatial zone storage |
| **ML Engine** | scikit-learn (DBSCAN) + TFLite (YAMNet) | Cluster-based zone generation + on-device audio threat detection |
| **Authority Dashboard** | Next.js + Mapbox GL | Real-time tactical command center for dispatchers |

---

## Core Feature Engineering

### 1. Dynamic Threat Intelligence Engine

The map autonomously learns where crimes happen and draws dynamic risk zones that shift based on time of day and incident severity — zero manual input required.

**How it works:**
- **Database:** PostgreSQL + PostGIS on Supabase stores all incident coordinates as native geometry types
- **ML Pipeline (`zone_generator.py`):** scikit-learn's DBSCAN clusters raw incident points with a 250m epsilon (macro-zone scale)
- **Geometry Engine:** `shapely` draws Concave Hulls around clusters, buffers them 50m outward to cover adjacent streets, and stores them as WKT polygons directly in the database
- **Investor Signal:** Scales to any city by ingesting local police FIR data — no manual zone drawing ever needed

---

### 2. Session-Based Tactical Routing (SafeNav)

When a user starts a trip, the backend calculates paths that physically bypass known threat zones and penalizes dangerous streets in real time.

**How it works:**
- **Routing API (`safenav.py`):** Fetches the top 3 fastest routes via Mapbox Directions API
- **Spatial Intersection:** Loads PostGIS Red Zones into memory and runs `shapely` geometry math — `route_line.distance(zone_geom)` — flagging any route that comes within 50m of a threat zone
- **UI Feedback:** Backend returns `is_route_safe: false` if no clean route exists; Flutter immediately renders the polyline in red warning colors
- **Investor Signal:** Proves the system prevents incidents rather than only recording them

---

### 3. The Drift Protocol (Autonomous Geofencing)

If a user deviates more than 50 meters from their designated safe route for more than 30 seconds, the app silently checks on them. No response triggers an automated SOS dispatch.

**How it works:**
- **Battery-First Architecture (`geofence_service.dart`):** Continuous GPS polling is replaced with `flutter_background_geolocation`, handing location tracking to the native iOS/Android OS tier — CPU wakes only every 10 meters
- **Cross-Track Error Math:** Perpendicular drift distance is calculated locally using equirectangular projection. Drift > 50m starts a 30-second silent timer, filtering out false positives (e.g., stopping at a shop)
- **Escalation UX:** On second 31, a 95% opacity full-screen overlay triggers with 15 seconds of rhythmic heavy haptic feedback, followed by an automated `status: 'sos'` write to Supabase
- **Investor Signal:** Protects users even if their phone is snatched — no button press required

---

### 4. Edge-Audio Sentinel

The phone listens to ambient audio. Screaming, shouting, or physical impact sounds instantly trigger the SOS sequence — all processed on-device with zero cloud dependency.

**How it works:**
- **Edge AI (`audio_sentinel_service.dart`):** `tflite_flutter` runs YAMNet audio classification directly on the device — audio never leaves the phone, guaranteeing privacy and zero-latency
- **Optimized Inference:** Raw PCM16 audio is buffered into 0.975-second chunks and passed to the model every 900ms
- **Threat Vocabulary:** Detects screaming, shouting, bellowing, gunshots, breaking glass, smashing, and physical impact sounds
- **Threshold:** Confidence score > 0.15 on any danger class interrupts all active flows and triggers the Drift overlay
- **Investor Signal:** Unmatched physical safety — the system activates during an ambush when touching the screen is impossible

---

### 5. The Hardware Override (3× Volume Down)

Pressing the Volume Down button 3 times rapidly in a pocket instantly bypasses all countdown timers and dispatches emergency services — no screen interaction needed.

**How it works:**
- **Native Event Bridge (`MainActivity.kt`):** An `EventChannel` is wired directly into the Android Kotlin layer to intercept the hardware Volume-Down interrupt at the OS level
- **Killswitch Logic:** 3 presses within 2 seconds cancels the 15-second haptic timer, hides all UI, and fires `status: 'sos'` to Supabase with live WKT coordinates
- **Investor Signal:** Muscle-memory activation. Attackers watch the screen — they cannot stop a concealed hardware button press

---

### 6. Enterprise Identity & Tactical Dashboard

A full command center for security guards and dispatchers, paired with a strict Uber-inspired UI for users.

**How it works:**
- **Design System (`sentra_design.dart`):** Monochrome `#000000` / `#FFFFFF` palette, Inter typography, pill-shaped CTAs — no consumer-grade gradients
- **Authentication:** Supabase OTP SMS login with E.164 phone number formatting; PostgreSQL triggers mirror new accounts into a `profiles` table automatically
- **Real-Time Tracking:** The mobile app continuously writes WKT coordinate pings to `trip_pings`; the Next.js dashboard subscribes via Supabase Realtime WebSockets and renders live "Ghost Tracks" on a Mapbox tactical map
- **Ghost Tracking:** If a user's connection drops mid-trip inside a risk zone, the dashboard projects a dashed track based on their last known velocity vector and destination
- **Investor Signal:** Fully institutionalized — ready to be deployed for universities or police departments out of the box

---

## Project Structure

```
WSF/
│
├── mobile-app/                  # Flutter application
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── home_screen.dart        # Map, routing, SOS UI
│   │   │   └── login_screen.dart       # OTP authentication
│   │   ├── services/
│   │   │   ├── api_service.dart        # Backend + Supabase calls
│   │   │   ├── audio_sentinel_service.dart  # YAMNet TFLite inference
│   │   │   ├── geofence_service.dart   # Drift protocol + OS geofencing
│   │   │   └── mapbox_service.dart     # Geocoding + suggestions
│   │   └── theme/
│   │       └── sentra_design.dart      # Uber-style design system
│   ├── android/
│   │   └── app/src/main/kotlin/
│   │       └── MainActivity.kt         # Hardware volume-down bridge
│   └── assets/
│       ├── sentinel_audio.tflite       # YAMNet on-device model
│       └── labels.txt                  # 521-class audio taxonomy
│
├── backend-ai/                  # Python FastAPI backend
│   ├── main.py                        # API entrypoints
│   ├── routes/
│   │   └── safenav.py                 # Route safety scoring engine
│   ├── tasks/
│   │   └── zone_generator.py          # DBSCAN ML zone pipeline
│   └── requirements.txt
│
├── web-dashboard/               # Next.js authority dashboard
│   └── src/
│       ├── components/
│       │   ├── MapView.tsx             # Mapbox tactical map
│       │   ├── DashboardPage.tsx       # Main command center layout
│       │   ├── ZoneManagement.tsx      # Zone CRUD interface
│       │   ├── IncidentsView.tsx       # Live incident feed
│       │   └── PatrolView.tsx          # Patrol unit tracking
│       ├── hooks/
│       │   ├── useRealtimeIncidents.ts # Supabase realtime incidents
│       │   ├── useRealtimeLocations.ts # Supabase realtime locations
│       │   └── useZones.ts             # Zone state + Supabase sync
│       └── lib/
│           └── supabaseClient.ts
│
└── docker-compose.yml           # Backend service orchestration
```

---

## Installation

### Prerequisites

- Flutter SDK ≥ 3.0
- Python 3.12+
- Node.js ≥ 20
- Supabase CLI
- Mapbox account (access token required)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sentra.git
cd sentra
```

### 2. Backend Setup

```bash
cd backend-ai
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MAPBOX_ACCESS_TOKEN

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or with Docker:

```bash
docker-compose up --build
```

To generate ML risk zones from incident data:

```bash
python tasks/zone_generator.py
```

### 3. Mobile App Setup

```bash
cd mobile-app
cp .env.example .env
# Fill in MAPBOX_ACCESS_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, BACKEND_API_BASE_URL

flutter pub get
flutter run
```

### 4. Web Dashboard Setup

```bash
cd web-dashboard
cp .env.example .env.local
# Fill in NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

---

## Key Design Decisions

**Why DBSCAN over K-Means for zone generation?**
DBSCAN does not require specifying the number of clusters in advance and natively handles noise points (isolated incidents that do not form a pattern). This is critical for sparse, real-world crime data.

**Why on-device audio inference over cloud?**
Cloud audio processing introduces 300–800ms of network latency — unacceptable for an emergency system. On-device TFLite inference runs in under 50ms and never exposes sensitive audio recordings to external servers.

**Why native OS geofencing over continuous GPS polling?**
Continuous `Geolocator.getPositionStream` keeps the CPU awake and kills battery in under 3 hours. Native OS geofencing hands location authority to the hardware, reducing battery consumption by approximately 85%.

**Why a hardware button override?**
Screen-based SOS buttons require looking at the phone. During a physical altercation, this is often impossible. A 3-press volume sequence is executable blind, in a pocket, under duress.

---

## Privacy & Security

- All audio classification runs locally on-device — no audio is ever transmitted to any server
- Location data is encrypted in transit and only written to Supabase during an active trip session
- User authentication uses OTP-based SMS login — no passwords are stored
- The backend uses Supabase Service Role keys exclusively for ML pipeline writes, bypassing RLS only where architecturally necessary

---

## Roadmap

- Real-time police FIR data integration for automated zone seeding
- Crowd-sourced incident reporting with community validation
- Smart wearable integration (haptic-only SOS via smartwatch)
- Predictive safety scoring using time-weighted KDE decay on historical incident data
- AI-based video anomaly detection for campus CCTV integration
- iOS Volume Button hardware bridge (currently Android-only)
