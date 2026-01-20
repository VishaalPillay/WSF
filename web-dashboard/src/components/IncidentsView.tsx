import React, { useState } from 'react';
import { ShieldAlert, Clock, MapPin, User, CheckCircle, AlertTriangle, XCircle, Filter, Search, Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REAL_INCIDENTS, REAL_USER_PROFILES } from '../data/velloreRealData';
import { useZones } from '../hooks/useZones';

// Add Zone Card Component (shown when no incident selected)
const AddZoneCard: React.FC = () => {
    const [zoneName, setZoneName] = useState('');
    const [zoneType, setZoneType] = useState<'HIGH' | 'MODERATE'>('HIGH');
    const [lat, setLat] = useState('12.9692');
    const [lng, setLng] = useState('79.1559');
    const [radius, setRadius] = useState('200');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addZone } = useZones();

    const handleAddZone = async () => {
        if (!zoneName.trim()) return;
        setIsSubmitting(true);
        await addZone({
            location: zoneName,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            severity: zoneType,
            type: 'Custom Zone',
            description: `Manually added zone: ${zoneName}`,
            radius: parseInt(radius),
            active_hours: '00-24'
        });
        setIsSubmitting(false);
        setZoneName('');
    };

    return (
        <div className="w-full max-w-md p-6">
            <div className="bg-[#18181b] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Target className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">Add New Zone</h3>
                        <p className="text-xs text-zinc-500">Create a risk zone on the map</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Zone Name */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Zone Name</label>
                        <input
                            type="text"
                            value={zoneName}
                            onChange={(e) => setZoneName(e.target.value)}
                            placeholder="e.g., Katpadi Station Area"
                            className="w-full px-3 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
                        />
                    </div>

                    {/* Zone Type */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-2 block">Risk Level</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setZoneType('HIGH')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${zoneType === 'HIGH'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}
                            >
                                🔴 High Risk
                            </button>
                            <button
                                onClick={() => setZoneType('MODERATE')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${zoneType === 'MODERATE'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}
                            >
                                🟡 Moderate
                            </button>
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Latitude</label>
                            <input
                                type="text"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="w-full px-3 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 font-mono focus:border-cyan-500/50 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Longitude</label>
                            <input
                                type="text"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                                className="w-full px-3 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 font-mono focus:border-cyan-500/50 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Radius Slider */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 flex justify-between">
                            <span>Radius</span>
                            <span className="text-cyan-400 font-mono">{radius}m</span>
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="500"
                            step="25"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="w-full accent-cyan-500"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleAddZone}
                        disabled={isSubmitting || !zoneName.trim()}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 uppercase tracking-wide"
                    >
                        {isSubmitting ? 'Creating...' : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Zone
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface Incident {
    id: string;
    title: string;
    location: string;
    severity: 'high' | 'medium' | 'low';
    status: 'open' | 'acknowledged' | 'resolved';
    user: string;
    time: string;
    description: string;
    coordinates: [number, number];
}

export const IncidentsView: React.FC = () => {
    const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    // Convert real incidents to display format
    const incidents: Incident[] = REAL_INCIDENTS.map(inc => {
        const user = REAL_USER_PROFILES.find(u => u.user_id === inc.user_id);
        const timeAgo = Math.floor((Date.now() - new Date(inc.created_at).getTime()) / 60000);

        return {
            id: inc.id,
            title: inc.notes || 'Incident',
            location: inc.display_name || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`,
            severity: inc.severity as 'high' | 'medium' | 'low',
            status: inc.status as 'open' | 'acknowledged' | 'resolved',
            user: user?.name || `User ${inc.user_id?.slice(0, 8) || 'Unknown'}`,
            time: timeAgo < 60 ? `${timeAgo} min ago` : `${Math.floor(timeAgo / 60)} hours ago`,
            description: `${inc.notes}. Source: ${inc.source}. Location: ${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`,
            coordinates: [inc.latitude, inc.longitude] as [number, number]
        };
    });

    const filteredIncidents = incidents.filter(inc => {
        const matchesSeverity = selectedSeverity === 'all' || inc.severity === selectedSeverity;
        const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;
        const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesStatus && matchesSearch;
    });

    const stats = {
        open: incidents.filter(i => i.status === 'open').length,
        acknowledged: incidents.filter(i => i.status === 'acknowledged').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        high: incidents.filter(i => i.severity === 'high').length
    };

    return (
        <div className="h-full w-full flex">

            {/* Left Panel - Incident List */}
            <div className="w-96 flex-none bg-[#18181b] border-r border-white/10 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">Active Incidents</h2>
                            <p className="text-xs text-zinc-500">{filteredIncidents.length} total incidents</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-red-400">{stats.open}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Open</div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-yellow-400">{stats.acknowledged}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Active</div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-emerald-400">{stats.resolved}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Resolved</div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search incidents..."
                            className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            {(['all', 'high', 'medium', 'low'] as const).map((severity) => (
                                <button
                                    key={severity}
                                    onClick={() => setSelectedSeverity(severity)}
                                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium uppercase tracking-wide transition-all ${selectedSeverity === severity
                                        ? severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : severity === 'low' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : 'bg-white/10 text-zinc-300 border border-white/20'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {severity}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {(['all', 'open', 'acknowledged', 'resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium uppercase tracking-wide transition-all ${selectedStatus === status
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status.slice(0, 4)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Incident List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredIncidents.map((incident) => (
                        <IncidentCard
                            key={incident.id}
                            incident={incident}
                            isSelected={selectedIncident?.id === incident.id}
                            onClick={() => setSelectedIncident(incident)}
                        />
                    ))}

                    {filteredIncidents.length === 0 && (
                        <div className="text-center py-12">
                            <Filter className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">No incidents match your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Incident Details */}
            <div className="flex-1 bg-[#09090b] flex items-center justify-center">
                {selectedIncident ? (
                    <div className="w-full max-w-2xl p-8">
                        <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
                    </div>
                ) : (
                    <AddZoneCard />
                )}
            </div>
        </div>
    );
};

// Incident Card Component
const IncidentCard: React.FC<{ incident: Incident; isSelected: boolean; onClick: () => void }> = ({
    incident,
    isSelected,
    onClick
}) => {
    const severityColor =
        incident.severity === 'high' ? 'red' :
            incident.severity === 'medium' ? 'yellow' : 'blue';

    const statusIcon =
        incident.status === 'open' ? <AlertTriangle className="w-3 h-3" /> :
            incident.status === 'acknowledged' ? <Clock className="w-3 h-3" /> :
                <CheckCircle className="w-3 h-3" />;

    return (
        <div
            onClick={onClick}
            className={`rounded-lg border p-3 cursor-pointer transition-all ${isSelected
                ? `border-${severityColor}-500/50 bg-${severityColor}-500/10`
                : `border-${severityColor}-500/20 bg-${severityColor}-500/5 hover:bg-${severityColor}-500/10`
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-bold ${severityColor === 'red' ? 'text-red-400' :
                            severityColor === 'yellow' ? 'text-yellow-400' : 'text-blue-400'
                            }`}>
                            {incident.id}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] ${incident.status === 'open' ? 'text-red-400' :
                            incident.status === 'acknowledged' ? 'text-yellow-400' : 'text-emerald-400'
                            }`}>
                            {statusIcon}
                            {incident.status}
                        </span>
                    </div>
                    <h4 className="font-semibold text-sm text-zinc-100">{incident.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {incident.location}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-600">
                <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {incident.user}
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {incident.time}
                </span>
            </div>
        </div>
    );
};

// Incident Details Component
const IncidentDetails: React.FC<{ incident: Incident; onClose: () => void }> = ({ incident, onClose }) => {

    // We need access to addZone. Ideally creating a context or passing it down. 
    // Since this is a sub-component, we can use the hook here too, but it might re-fetch zones.
    // Better to pass it as prop, but for quick implementation I'll use the hook inside.
    const { addZone } = useZones();
    const [isCreatingZone, setIsCreatingZone] = useState(false);

    const handleCreateZone = async () => {
        setIsCreatingZone(true);
        await addZone({
            location: `Hazard Zone - ${incident.title}`,
            lat: incident.coordinates[0],
            lng: incident.coordinates[1],
            severity: 'HIGH',
            type: 'Emergency',
            description: `Auto-generated zone from incident ${incident.id}: ${incident.description}`,
            radius: 200,
            active_hours: '00-24'
        });
        setIsCreatingZone(false);
        // Show success / Toast?
        console.log("Zone created for incident");
        onClose(); // Close details or stay?
    };

    return (
        <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${incident.severity === 'high' ? 'bg-red-500/10 border-red-500/20' :
                        incident.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                            'bg-blue-500/10 border-blue-500/20'
                        }`}>
                        <ShieldAlert className={`w-6 h-6 ${incident.severity === 'high' ? 'text-red-400' :
                            incident.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">{incident.title}</h2>
                        <p className="text-sm text-zinc-500">{incident.id}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Location</p>
                    <p className="text-sm text-zinc-100 font-medium">{incident.location}</p>
                    <p className="text-xs text-zinc-600 mt-1">{incident.coordinates[0].toFixed(4)}, {incident.coordinates[1].toFixed(4)}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">User</p>
                    <p className="text-sm text-zinc-100 font-medium">{incident.user}</p>
                    <p className="text-xs text-zinc-600 mt-1">{incident.time}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Severity</p>
                    <p className={`text-sm font-bold uppercase ${incident.severity === 'high' ? 'text-red-400' :
                        incident.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>{incident.severity}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Status</p>
                    <p className={`text-sm font-bold uppercase ${incident.status === 'open' ? 'text-red-400' :
                        incident.status === 'acknowledged' ? 'text-yellow-400' : 'text-emerald-400'
                        }`}>{incident.status}</p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                <p className="text-xs text-zinc-500 mb-2">Description</p>
                <p className="text-sm text-zinc-300">{incident.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                    <Clock className="w-4 h-4 mr-2" />
                    Acknowledge
                </Button>
                <Button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                </Button>
                <Button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20">
                    <XCircle className="w-4 h-4 mr-2" />
                    Escalate
                </Button>
            </div>

            {/* Extra Admin Actions */}
            <div className="pt-4 border-t border-white/5">
                <Button
                    onClick={handleCreateZone}
                    disabled={isCreatingZone}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold tracking-wide uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                >
                    {isCreatingZone ? 'Creating Zone...' : (
                        <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Create Hazard Zone & Broadcast
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
