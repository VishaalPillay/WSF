# 🛡️ SENTRA: AI-Driven Women's Safety Framework

**Target Event:** VIT Hackathon (AI/ML Track)  
**Status:** Pre-Development / Architecture Phase  
**Demo Scope:** VIT Vellore Campus + 20km Radius (Katpadi, Chittoor Stop, Green Circle)

---

## 1. The Core Vision
SENTRA is a **Proactive** safety system, not just a **Reactive** panic button. While traditional apps wait for a user to press SOS, SENTRA actively monitors risk and routes women through safer paths using "SafeNav," while preserving battery life and privacy through "Adaptive Polling."

**The Winning Demo Scenario:** A female student travels from **Katpadi Station** to **VIT Main Gate** at night. The app routes her through safe business streets (avoiding dark alleys), monitors for aggression automatically in dark zones via Audio ML, and alerts the "Authority Dashboard" instantly upon threat confirmation.

---

## 2. System Architecture

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Mobile App (Edge)** | Flutter / React Native | User Interface, Sensor Data, TFLite Inference, Map Display. |
| **The "Brain" (Backend)** | Python (FastAPI/Flask) | Route Scoring Logic, Zone Management, API handling. |
| **Database** | Firebase / Supabase | Real-time user location syncing, User Auth, Zone storage. |
| **ML Engine** | TensorFlow Lite (On-Device) | Audio Event Detection (Screaming, Glass Breaking). |
| **Dashboard** | React.js / Next.js | Police/Authority view, SOS Alerts, Heatmaps. |

---

## 3. Key Features & Technical Logic

### Feature 1: SafeNav (Predictive Routing)
*The app doesn't just show the shortest route; it shows the safest.*

* **The Problem:** Google Maps only optimizes for time/distance.
* **Our Solution:** A wrapper around standard maps that weights routes based on safety data.
* **The Algorithm:**
    1.  Fetch 3 distinct routes from **Mapbox/Google Directions API**.
    2.  Break routes into 500m coordinate segments.
    3.  **Calculate Score:**
        * `Base Score` = Distance (Lower is better).
        * `Safety Bonus` = **+10 points** if segment is near an "Open Business" (Proxy: Google Places "Open Now").
        * `Risk Penalty` = **-50 points** if segment intersects a "Red Zone" (Historical Crime/Darkness).
    4.  **Output:** Highlight the route with the highest Safety Score in Green.

### Feature 2: Adaptive Polling (Battery Optimization)
*We maximize safety without killing the phone battery.*

* **Logic:** A State Machine controls the sensors based on the user's current zone risk level.
* **State A: Green Zone (Safe - e.g., Inside VIT Hostels)**
    * **GPS:** Polling every 5 minutes.
    * **Audio ML:** OFF.
    * **Battery Impact:** Minimal.
* **State B: Yellow Zone (Caution - e.g., Katpadi Station)**
    * **GPS:** Polling every 1 minute.
    * **Audio ML:** STANDBY (Mic initialized but not processing).
* **State C: Red Zone (Danger - e.g., Dark road near Green Circle)**
    * **GPS:** Real-time streaming (WebSocket).
    * **Audio ML:** ACTIVE (Continuous listening).

### Feature 3: Sentinel Audio (Edge AI)
*Detects threats without the user touching the phone.*

* **Model:** Lightweight **TFLite** model (MobileNet/YAMNet based).
* **Triggers:** `Screaming`, `Glass Breaking`, `Aggressive Male Speech`.
* **False Positive Check (Multimodal Verification):**
    ```python
    IF Audio_Detects_Scream(Confidence > 0.85):
        Check_Accelerometer()
        IF Motion == "Running" OR Motion == "Violent Shaking":
            TRIGGER_SOS()
        ELSE:
            Vibrate_Phone_Check() # Haptic Warning
    ```
* **Privacy:** All processing happens **on-device**. Audio is strictly local unless SOS is confirmed.

### Feature 4: Algorithmic Geofencing
*Instead of manually drawing zones, we simulate AI clustering.*

* **Input Data:** JSON dataset of ~50 "Incident Points" around Vellore (simulating past harassment reports).
* **The Algorithm:** **DBSCAN** (Density-Based Spatial Clustering) running on the Python backend.
* **Output:** Automatically generated polygons (Red Zones) around high-density incident areas.

---

## 📅 4. Hackathon Roadmap (10-Day Sprint)

### Phase 1: Data Preparation (Days 1-3)
- [ ] **Map Data:** Coordinate mapping for VIT Gate, Katpadi Station, Green Circle, major shops, and police stations.
- [ ] **Crime Data:** Generate `crimes.json` with synthetic incident data clustered around "Dark Spots" in Vellore.
- [ ] **Audio Data:** Acquire ESC-50 or AudioSet datasets for training.

### Phase 2: Core Engines (Days 4-7)
- [ ] **ML:** Train TFLite model for specific sound classes (Scream vs. Background Noise).
- [ ] **Backend:** Build the Route Scoring API.
- [ ] **Mobile:** UI Skeleton (Login -> Map -> SOS).

### Phase 3: Integration & Demo Prep (Days 8-10)
- [ ] Connect TFLite model to Mobile App.
- [ ] **CRITICAL:** Build the **"Developer Simulation Menu"**:
    -   `[DEV] Force Enter Red Zone`
    -   `[DEV] Simulate SOS Trigger`

---

## 👥 5. Development Roles

### 🧑‍💻 Role 1: ML & Backend Architect
* **Stack:** Python, TensorFlow, FastAPI.
* **Focus:** Training the audio model, writing the SafeNav routing logic, and setting up the Zone database.

### 🧑‍💻 Role 2: Mobile Lead
* **Stack:** Flutter / React Native, Mapbox SDK.
* **Focus:** Building the UI, handling background services (Adaptive Polling), and integrating sensors.

### 🧑‍💻 Role 3: Integration & Dashboard
* **Stack:** React.js, Firebase/Supabase.
* **Focus:** Building the Authority Dashboard, real-time alerts, and gathering the "Vellore Simulation Data."

---

## 🛠️ Resources

* **Maps:** [Mapbox Studio](https://www.mapbox.com/)
* **Audio Dataset:** [ESC-50 (GitHub)](https://github.com/karolpiczak/ESC-50)
* **Design System:** Material Design 3

> **Note:** This project is designed for the VIT Hackathon 2026. All data used is for simulation/demonstration purposes within the Vellore region.
