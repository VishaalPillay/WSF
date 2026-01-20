# 💻 Authority Dashboard & Integration
**Lead:** Nikhil Karur (Role 3)  
**Project:** TRAVEL-MATE (formerly SENTRA)

---

## 📌 Role Overview
As the **Web Site Lead for Authorities**, my primary responsibility is building the "Command Center" that allows local authorities (Police, Forest Dept) to monitor tourists in real-time. This involves integrating the frontend with **Supabase** to visualize data from both the **Online Mobile App** and the **Offline Mesh Network**.

---

## ✅ Implemented Features

### 1. **Tactical Dashboard UI (Rebranded to TRAVEL-MATE)**
*   **Map-Centric Interface:** A full-screen tactical map using **Mapbox GL**.
*   **Branding:** Updated header and UI elements to reflect "TRAVEL-MATE" identity.
*   **Interactive Panels:**
    *   **Live Incidents:** Real-time list of active threats (SOS, Falls).
    *   **Network Health:** Status of the connectivity mesh.
    *   **Patrol Support:** Sidebar for dispatching units.

### 2. **Hybrid Connectivity Visualization (Mesh Support)**
*   **Visual Distinction:**
    *   🟢 **Green Dot:** Direct 4G/5G Connection (Online).
    *   🔵 **Blue Hollow Ring:** Mesh Packet (Offline Data hopped via Bluetooth).
*   **Schema Update:** Added `source_type` ('online' | 'mesh') and `mesh_hop_count` to Supabase `live_locations` table.

### 3. **Developer Simulation Tools**
Because it's hard to test "Danger" scenarios safely, I built a suite of Dev Tools:
*   **[DEV] Force Red Zone Entry:**
    *   *Action:* Clicking the Triangle Icon updates Supabase to move a test user (`simulated-danger-user`) directly into the **VIT Campus Red Zone**.
    *   *Purpose:* Triggers backend "Geofence Entry" alerts without physical travel.
*   **[DEV] Simulate SOS:**
    *   *Action:* Instantly creates a "Critical Event" in the database.
    *   *Purpose:* Tests dashboard reaction speed and audio alerts.

### 4. **Real-World Data Integration**
*   **Vellore Incident Dataset:** Replaced dummy data with **16 real-world high-risk locations** (e.g., Sathuvachari Burial Ground, Green Circle Bus Stand).
*   **Risk Heatmap:** The "Risk Assessment Mode" generated a heatmap based on these actual coordinates.

---

## 🚀 Next Steps

### Phase 2: Mobile App Integration (Role 2 Handoff)
*   **Task:** The Flutter app needs to start sending `source_type: 'mesh'` when uploading offline packets so the dashboard visualizes them correctly as Blue Rings.

### Phase 3: Route Scoring Visualizer (Role 1 Handoff)
*   **Task:** Visualize the "SafeNav" routes calculated by the backend.
    *   Display the **Route Safety Score** (e.g., "Safety Score: 85/100") on the dashboard when a user selects a path.
