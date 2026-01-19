# SENTRA Authority Dashboard - Development Guide

## 🎯 Project Status (Updated: 2026-01-18)

### ✅ Completed Features

1. **Dashboard Layout (Option 1 - DashboardPage)**
   - 3-column professional layout
   - Left sidebar (64px minimal rail)
   - Center Mapbox canvas
   - Right "Live Feed" panel

2. **Map Features**
   - ✅ RED zone polygons (HIGH severity) - `#FF4D4D`
   - ✅ YELLOW zone polygons (MODERATE severity) - `#FFD700`
   - ✅ User beacons with directional arrows (Google Maps style)
   - ✅ Blinking animation when users enter danger zones
   - ✅ Point-in-circle zone detection
   - ✅ Incident markers (red pulsing dots)

3. **Real-time Data Integration**
   - ✅ `useZones()` hook with mock data fallback
   - ✅ `useRealtimeLocations()` hook for user tracking
   - ✅ Automatic zone membership detection

### 🚧 In Progress

1. **Sidebar Navigation** (8 features)
   - [x] Dashboard / Command Center (Active)
   - [ ] Analytics & Reports
   - [ ] Active Incidents
   - [ ] User Management
   - [x] **Zone Management** ✅ **COMPLETED**
   - [ ] Responders / Field Units
   - [ ] System Settings
   - [ ] Audit Logs

### ✅ Recently Completed (2026-01-18)

**Zone Management Feature** - Full CRUD Operations
- ✅ Interactive zone list with categorization (RED/YELLOW/LOW)
- ✅ Real-time search functionality
- ✅ Severity-based filtering (ALL, HIGH, MODERATE, LOW)
- ✅ Add Zone modal with comprehensive form validation
- ✅ Edit Zone modal with pre-populated data
- ✅ Delete Zone confirmation modal with warnings
- ✅ Zone selection with details overlay on map
- ✅ Statistics dashboard (zone counts by severity)
- ✅ Map/List view toggle
- ✅ Responsive 2-panel layout

### 📋 Implementation Plan

#### Phase 1: Sidebar Navigation (CURRENT)
- Implement all 8 navigation items
- Create view components for each section
- Add routing/state management

#### Phase 2: Analytics & Reports
- Historical crime data visualization
- Heatmap analysis
- Zone statistics dashboard
- Trend charts

#### Phase 3: Active Incidents
- Real-time incident list
- Filter by severity
- Quick response actions
- Incident details drawer

#### Phase 4: User Management
- Connected users list
- User location tracking
- Status indicators (safe/danger)
- Panic button history

#### Phase 5: Zone Management
- Zone CRUD operations
- Boundary editing
- Historical incident overlay
- Risk level configuration

#### Phase 6: Responders
- Active patrol routes
- Field volunteer locations
- Response team status
- Dispatch management

#### Phase 7: System Settings
- Notification preferences
- Alert thresholds
- Map style configuration
- API integrations

#### Phase 8: Audit Logs
- System activity timeline
- User check-ins
- Incident history
- Export functionality

---

## 🗂️ File Structure

```
web-dashboard/
├── app/
│   ├── page.tsx                    # Main entry (uses DashboardPage)
│   └── demo/                       # Comparison demos
│       ├── option1/page.tsx        # DashboardPage demo
│       ├── option2/page.tsx        # Dashboard demo
│       └── current/page.tsx        # TacticalDashboard demo
├── src/
│   ├── components/
│   │   ├── DashboardPage.tsx       # ✅ MAIN DASHBOARD (Option 1)
│   │   ├── MapView.tsx             # ✅ Map with zones & beacons
│   │   ├── ZoneManagement.tsx      # ✅ Zone CRUD interface
│   │   ├── ZoneFormModal.tsx       # ✅ Add/Edit zone modal
│   │   ├── DeleteZoneModal.tsx     # ✅ Delete confirmation modal
│   │   ├── MapViewBeacon.tsx       # Beacon-style map (old)
│   │   ├── TacticalDashboard.tsx   # Minimal command beacon UI
│   │   ├── Dashboard.tsx           # Interactive stats overlay
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── ui/                     # Shadcn components
│   ├── hooks/
│   │   ├── useZones.ts             # ✅ Zone data hook (with fallback)
│   │   └── useRealtimeLocations.ts # ✅ User location tracking
│   ├── types.ts                    # TypeScript interfaces
│   └── lib/
│       └── supabaseClient.ts       # Supabase integration
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Development Server
```bash
cd c:\Users\nkk77\Desktop\SENTRA\WSF\web-dashboard
npm run dev
```

Dashboard: http://localhost:3000

### Backend (Optional)
If you want real zone data instead of mock data:
```bash
cd c:\Users\nkk77\Desktop\SENTRA\WSF
python backend/main.py  # or wherever your Python backend is
```

---

## 🔧 Key Components

### MapView.tsx
**Purpose**: Renders Mapbox map with zones and user beacons

**Features**:
- RED/YELLOW zone polygons
- User beacons with directional arrows
- Blinking animation for danger zones
- Incident markers

**Props**:
```typescript
{
  incidents?: Incident[];
  locations?: LiveLocation[];
  zones?: Zone[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  loading?: boolean;
  supabaseEnabled?: boolean;
  showHeatmap?: boolean;
  mapStyle?: string;
}
```

### DashboardPage.tsx
**Purpose**: Main 3-column dashboard layout

**Structure**:
- Left: 64px sidebar with navigation
- Center: Mapbox canvas
- Right: Live Feed panel (alerts, status, audit log)

### useZones.ts
**Purpose**: Fetch zone data from backend

**Fallback Data**:
```typescript
[
  {
    id: 1,
    location: "TASMAC Katpadi",
    lat: 12.9716,
    lng: 79.1594,
    severity: 'HIGH',
    radius: 200
  },
  {
    id: 2,
    location: "VIT Main Gate",
    lat: 12.9692,
    lng: 79.1559,
    severity: 'MODERATE',
    radius: 150
  }
]
```

---

## 🎨 Design System

### Colors
- **Background**: `#09090b` (deepest black)
- **Surface**: `#18181b` (dark gray)
- **RED Zone**: `#FF4D4D`
- **YELLOW Zone**: `#FFD700`
- **Accent**: `#00F0FF` (cyan)
- **Text**: `#EDEDED` (light gray)

### Animations
- **Beacon Blink (Red)**: 1s infinite pulse
- **Beacon Blink (Yellow)**: 1.5s infinite pulse
- **Incident Pulse**: 2s infinite

---

## 🐛 Known Issues

1. **Zones not visible**: Backend at `http://localhost:8000/zones` must be running OR use mock data fallback (already implemented)
2. **User beacons**: Currently using mock data from `useRealtimeLocations`
3. **Sidebar navigation**: Only Dashboard tab is functional (others to be implemented)

---

## 📝 Next Session TODO

1. **Implement Sidebar Navigation**
   - Create view components for each section
   - Add state management for active view
   - Implement routing or tab switching

2. **Analytics View**
   - Historical crime data charts
   - Heatmap toggle
   - Zone statistics

3. **Active Incidents View**
   - List view with filters
   - Incident details drawer
   - Quick actions (acknowledge, resolve, escalate)

4. **User Management View**
   - Connected users table
   - Location tracking
   - Status indicators

5. **Zone Management View**
   - Zone CRUD operations
   - Boundary editor
   - Risk level configuration

---

## 🔑 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibmlraGlsMjEwMjA2IiwiYSI6ImNta2U0NG0zdTAzMzUzZXMwZjZwbXFzZ3kifQ.fgjpDhGp_9bUapwaLEvtsg
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 📞 Support

For questions or issues, refer to:
- Mobile app code: `c:\Users\nkk77\Desktop\SENTRA\mobile-app` (for zone logic reference)
- Backend API: `http://localhost:8000/zones`
- Conversation history: Check previous sessions for context

---

**Last Updated**: 2026-01-18 10:49 AM
**Status**: Phase 1 (Sidebar Navigation) in progress
**Next Milestone**: Complete all 8 sidebar features
