import React, { useState } from 'react';
import { Radio, MapPin, User, Clock, Navigation, Phone, Shield, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REAL_RESPONDERS } from '../data/velloreRealData';

interface Responder {
    id: string;
    name: string;
    type: 'police' | 'volunteer' | 'medical';
    status: 'active' | 'responding' | 'offline';
    location: [number, number];
    assignedZone?: string;
    lastActive: string;
    phone: string;
    currentTask?: string;
}

export const RespondersView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'responding' | 'offline'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'police' | 'volunteer' | 'medical'>('all');
    const [selectedResponder, setSelectedResponder] = useState<Responder | null>(null);

    // Use real responders data
    const responders: Responder[] = REAL_RESPONDERS;

    const filteredResponders = responders.filter(resp => {
        const matchesSearch = resp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resp.assignedZone?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || resp.status === statusFilter;
        const matchesType = typeFilter === 'all' || resp.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        total: responders.length,
        active: responders.filter(r => r.status === 'active').length,
        responding: responders.filter(r => r.status === 'responding').length,
        offline: responders.filter(r => r.status === 'offline').length
    };

    return (
        <div className="h-full w-full flex">

            {/* Left Panel - Responders List */}
            <div className="w-96 flex-none bg-[#18181b] border-r border-white/10 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <Radio className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">Responders & Field Units</h2>
                            <p className="text-xs text-zinc-500">{filteredResponders.length} total responders</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-green-400">{stats.active}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Active</div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-yellow-400">{stats.responding}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Responding</div>
                        </div>
                        <div className="bg-zinc-500/10 border border-zinc-500/30 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-zinc-400">{stats.offline}</div>
                            <div className="text-[9px] text-zinc-500 uppercase tracking-wide">Offline</div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search responders..."
                            className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            {(['all', 'active', 'responding', 'offline'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium uppercase tracking-wide transition-all ${statusFilter === status
                                        ? status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : status === 'responding' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : status === 'offline' ? 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                                                    : 'bg-white/10 text-zinc-300 border border-white/20'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {(['all', 'police', 'volunteer', 'medical'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium uppercase tracking-wide transition-all ${typeFilter === type
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {type === 'all' ? 'All' : type.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Responders List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredResponders.map((responder) => (
                        <ResponderCard
                            key={responder.id}
                            responder={responder}
                            isSelected={selectedResponder?.id === responder.id}
                            onClick={() => setSelectedResponder(responder)}
                        />
                    ))}

                    {filteredResponders.length === 0 && (
                        <div className="text-center py-12">
                            <Filter className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">No responders match your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Responder Details / Map */}
            <div className="flex-1 bg-[#09090b] flex items-center justify-center">
                {selectedResponder ? (
                    <div className="w-full max-w-2xl p-8">
                        <ResponderDetails responder={selectedResponder} onClose={() => setSelectedResponder(null)} />
                    </div>
                ) : (
                    <div className="text-center">
                        <Radio className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-100 mb-2">Select a Responder</h3>
                        <p className="text-zinc-500 text-sm">Click on a responder to view details and patrol routes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Responder Card Component
const ResponderCard: React.FC<{ responder: Responder; isSelected: boolean; onClick: () => void }> = ({
    responder,
    isSelected,
    onClick
}) => {
    const typeColor =
        responder.type === 'police' ? 'blue' :
            responder.type === 'volunteer' ? 'purple' : 'red';

    const statusColor =
        responder.status === 'active' ? 'green' :
            responder.status === 'responding' ? 'yellow' : 'zinc';

    return (
        <div
            onClick={onClick}
            className={`rounded-lg border p-3 cursor-pointer transition-all ${isSelected
                ? `border-${typeColor}-500/50 bg-${typeColor}-500/10`
                : `border-${typeColor}-500/20 bg-${typeColor}-500/5 hover:bg-${typeColor}-500/10`
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-bold ${typeColor === 'blue' ? 'text-blue-400' :
                            typeColor === 'purple' ? 'text-purple-400' : 'text-red-400'
                            }`}>
                            {responder.id}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] ${responder.status === 'active' ? 'text-green-400' :
                            responder.status === 'responding' ? 'text-yellow-400' : 'text-zinc-400'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${responder.status === 'active' ? 'bg-green-400 animate-pulse' :
                                responder.status === 'responding' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-400'
                                }`} />
                            {responder.status}
                        </span>
                    </div>
                    <h4 className="font-semibold text-sm text-zinc-100">{responder.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {responder.type.charAt(0).toUpperCase() + responder.type.slice(1)}
                    </p>
                </div>
            </div>
            <div className="space-y-1">
                {responder.assignedZone && (
                    <p className="text-xs text-zinc-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {responder.assignedZone}
                    </p>
                )}
                {responder.currentTask && (
                    <p className="text-xs text-zinc-600 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {responder.currentTask}
                    </p>
                )}
                <p className="text-[10px] text-zinc-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {responder.lastActive}
                </p>
            </div>
        </div>
    );
};

// Responder Details Component
const ResponderDetails: React.FC<{ responder: Responder; onClose: () => void }> = ({ responder, onClose }) => {
    const typeColor =
        responder.type === 'police' ? 'blue' :
            responder.type === 'volunteer' ? 'purple' : 'red';

    return (
        <div className="bg-[#18181b] border border-white/10 rounded-xl p-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${typeColor === 'blue' ? 'bg-blue-500/10 border-blue-500/20' :
                        typeColor === 'purple' ? 'bg-purple-500/10 border-purple-500/20' :
                            'bg-red-500/10 border-red-500/20'
                        }`}>
                        <Shield className={`w-6 h-6 ${typeColor === 'blue' ? 'text-blue-400' :
                            typeColor === 'purple' ? 'text-purple-400' : 'text-red-400'
                            }`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">{responder.name}</h2>
                        <p className="text-sm text-zinc-500">{responder.id} • {responder.type.charAt(0).toUpperCase() + responder.type.slice(1)}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${responder.status === 'active' ? 'bg-green-500/20 border border-green-500/30' :
                responder.status === 'responding' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                    'bg-zinc-500/20 border border-zinc-500/30'
                }`}>
                <div className={`w-2 h-2 rounded-full ${responder.status === 'active' ? 'bg-green-400 animate-pulse' :
                    responder.status === 'responding' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-400'
                    }`} />
                <span className={`text-sm font-bold uppercase ${responder.status === 'active' ? 'text-green-400' :
                    responder.status === 'responding' ? 'text-yellow-400' : 'text-zinc-400'
                    }`}>
                    {responder.status}
                </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Assigned Zone</p>
                    <p className="text-sm text-zinc-100 font-medium">{responder.assignedZone || 'Not assigned'}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Location</p>
                    <p className="text-sm text-zinc-100 font-medium">{responder.location[0].toFixed(4)}, {responder.location[1].toFixed(4)}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Phone</p>
                    <p className="text-sm text-zinc-100 font-medium">{responder.phone}</p>
                </div>
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Last Active</p>
                    <p className="text-sm text-zinc-100 font-medium">{responder.lastActive}</p>
                </div>
            </div>

            {/* Current Task */}
            {responder.currentTask && (
                <div className="bg-[#09090b] rounded-lg p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-2">Current Task</p>
                    <p className="text-sm text-zinc-300">{responder.currentTask}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Responder
                </Button>
                <Button className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20">
                    <Navigation className="w-4 h-4 mr-2" />
                    View Route
                </Button>
                <Button className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20">
                    <MapPin className="w-4 h-4 mr-2" />
                    Assign Zone
                </Button>
            </div>
        </div>
    );
};
