import React from 'react';
import { Radio, MapPin, Clock, Phone, Shield } from 'lucide-react';
import { PATROL_ROUTES } from '../data/velloreRealData';
import MapView from './MapView';

// Mock patrol officers data (matches SQL seed data)
const PATROL_OFFICERS = [
    {
        id: 'patrol-001',
        name: 'Officer Nikhil Kumar',
        phone: '+91 98765 00001',
        badge: 'VLR-HEAD-001',
        status: 'available' as const,
        isHead: true,
        route: 'Katpadi Station Patrol',
        routeColor: '#06B6D4'
    },
    {
        id: 'patrol-002',
        name: 'Officer Ravi Singh',
        phone: '+91 98765 00002',
        badge: 'VLR-POL-002',
        status: 'available' as const,
        isHead: false,
        route: 'VIT Campus Patrol',
        routeColor: '#8B5CF6'
    },
    {
        id: 'patrol-003',
        name: 'Officer Priya Menon',
        phone: '+91 98765 00003',
        badge: 'VLR-POL-003',
        status: 'busy' as const,
        isHead: false,
        route: 'Green Circle Patrol',
        routeColor: '#F59E0B'
    }
];

export const PatrolView: React.FC = () => {
    return (
        <div className="h-full w-full flex">
            {/* Left Panel - Officer List */}
            <div className="w-96 flex-none bg-[#18181b] border-r border-white/10 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Radio className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">Patrol Units</h2>
                            <p className="text-xs text-zinc-500">{PATROL_OFFICERS.length} officers on duty</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-emerald-400">
                                {PATROL_OFFICERS.filter(o => o.status === 'available').length}
                            </div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Available</div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-yellow-400">
                                {PATROL_OFFICERS.filter(o => o.status === 'busy').length}
                            </div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Busy</div>
                        </div>
                        <div className="bg-zinc-500/10 border border-zinc-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-zinc-400">
                                {PATROL_ROUTES.length}
                            </div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Routes</div>
                        </div>
                    </div>
                </div>

                {/* Officer List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {PATROL_OFFICERS.map((officer) => (
                        <div
                            key={officer.id}
                            className="bg-[#09090b] border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                {/* Status Indicator */}
                                <div className={`w-3 h-3 rounded-full mt-1 ${officer.status === 'available' ? 'bg-emerald-500' :
                                    officer.status === 'busy' ? 'bg-yellow-500' : 'bg-zinc-500'
                                    }`} />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm text-zinc-100">{officer.name}</h4>
                                        {officer.isHead && (
                                            <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                                                Head
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 space-y-1 text-xs text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3" />
                                            <span className="font-mono">{officer.badge}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3" />
                                            <span>{officer.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            <span className="flex items-center gap-1">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: officer.routeColor }}
                                                />
                                                {officer.route}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${officer.status === 'available'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {officer.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#18181b]">
                    <div className="text-[10px] text-zinc-500 text-center">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Last updated: Just now
                    </div>
                </div>
            </div>

            {/* Right Panel - Map with patrol routes */}
            <div className="flex-1 relative">
                <MapView
                    zones={[]}
                    locations={[]}
                    incidents={[]}
                    selectedIncidentId={null}
                    onSelectIncident={() => { }}
                    loading={false}
                    supabaseEnabled={false}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    showPatrolRoutes={true}
                />
            </div>
        </div>
    );
};
