import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { DashboardLayout } from "./DashboardLayout";
import { Sidebar } from "./Sidebar";
import { StatCard } from "./StatCard";
import { IncidentRow } from "./IncidentRow";
import MapView from "./MapView";
import { RespondersList } from "./RespondersList";
import { Incident, LiveLocation } from "../types";
import { AlertTriangle, Users, ShieldAlert, X, Menu, Sun, Moon } from "lucide-react";

// Mock data
const mockIncidents: Incident[] = [
  {
    id: "sos-1",
    user_id: "user-1",
    status: "open",
    severity: "high",
    latitude: 12.9724,
    longitude: 79.1551,
    created_at: new Date().toISOString(),
    notes: "Audio anomaly detected during transit",
    display_name: "Sarah K.",
    source: "audio",
  },
  {
    id: "sos-2",
    user_id: "user-2",
    status: "acknowledged",
    severity: "medium",
    latitude: 12.9696,
    longitude: 79.1589,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    notes: "Route deviation > 500m",
    display_name: "Priya M.",
    source: "route",
  },
];

const mockLocations: LiveLocation[] = [
  { user_id: "user-1", latitude: 12.9724, longitude: 79.1551, heading: 40, speed: 1.1, updated_at: new Date().toISOString() },
  { user_id: "user-2", latitude: 12.9696, longitude: 79.1589, heading: 110, speed: 0.5, updated_at: new Date().toISOString() },
];

export const Dashboard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showResponders, setShowResponders] = useState(false);

  const incidents = useMemo(() => mockIncidents, []);
  const locations = useMemo(() => mockLocations, []);

  const activeAlerts = incidents.filter((i) => i.status !== "resolved").length;
  const usersConnected = locations.length;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelect = (id: string) => {
    setActiveView(id);
    if (id === "heatmap") {
      setShowHeatmap((prev) => !prev);
      setShowResponders(false);
    } else if (id === "responders") {
      setShowResponders((prev) => !prev);
      setShowHeatmap(false);
    } else {
      setShowHeatmap(false);
      setShowResponders(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="absolute inset-0 z-0">
        <MapView
          incidents={incidents}
          locations={locations}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
          loading={false}
          supabaseEnabled={false}
          showHeatmap={showHeatmap}
        />
      </div>

      <Sidebar active={activeView} onSelect={handleSelect} />

      {showResponders && <RespondersList />}

      <div className="absolute top-4 left-32 z-10 flex gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <StatCard
            label="Active Alerts"
            value={activeAlerts}
            icon={AlertTriangle}
            variant={activeAlerts > 0 ? "danger" : "default"}
          />
        </div>
        <div className="pointer-events-auto">
          <StatCard
            label="Users Connected"
            value={usersConnected}
            icon={Users}
          />
        </div>
        <div className="pointer-events-auto">
          <StatCard
            label="Redzones Active"
            value="3"
            icon={ShieldAlert}
          />
        </div>
        <div className="pointer-events-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 bg-black/60 border border-white/10 text-white rounded-xl backdrop-blur-md shadow-lg"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={`absolute top-4 bottom-4 right-4 w-96 z-20 transition-transform duration-300 transform ${drawerOpen ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
      >
        <div className="h-full rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-light text-white tracking-wide">LIVE INCIDENTS</h2>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Real-time Feed</div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                id={incident.id}
                displayName={incident.display_name || "Unknown User"}
                location="Katpadi Region"
                timestamp={formatTimestamp(incident.created_at)}
                severity={incident.severity}
                description={incident.notes}
                isSelected={selectedIncidentId === incident.id}
                onClick={setSelectedIncidentId}
              />
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-white/5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Monitoring Active
            </div>
          </div>
        </div>
      </div>

      {!drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="absolute top-4 right-4 z-20 p-3 bg-black/60 border border-white/10 text-white rounded-xl backdrop-blur-md shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </DashboardLayout>
  );
};
