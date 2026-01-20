import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, AlertTriangle, Clock, MapPinned, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Zone } from '../hooks/useZones';
import MapView from './MapView';
import { ZoneFormModal } from './ZoneFormModal';
import { DeleteZoneModal } from './DeleteZoneModal';

interface ZoneManagementProps {
    zones: Zone[];
    onAddZone?: () => void;
    onEditZone?: (zoneId: number) => void;
    onDeleteZone?: (zoneId: number) => void;
    onSaveZone?: (zoneData: any) => Promise<void>;
    onDeleteZoneById?: (zoneId: string | number) => Promise<void>; // Supabase delete
}

export const ZoneManagement: React.FC<ZoneManagementProps> = ({
    zones,
    onAddZone,
    onEditZone,
    onDeleteZone,
    onSaveZone,
    onDeleteZoneById
}) => {
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

    // Search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');

    // Filter zones based on search and severity
    const filteredZones = zones.filter(zone => {
        const matchesSearch = zone.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            zone.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || zone.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const redZones = filteredZones.filter(z => z.severity === 'HIGH');
    const yellowZones = filteredZones.filter(z => z.severity === 'MODERATE');
    const lowZones = filteredZones.filter(z => z.severity === 'LOW');

    // Handlers
    const handleAddZone = () => {
        setFormMode('add');
        setEditingZone(null);
        setIsFormModalOpen(true);
    };

    const handleEditZone = (zone: Zone) => {
        setFormMode('edit');
        setEditingZone(zone);
        setIsFormModalOpen(true);
    };

    const handleDeleteZone = (zone: Zone) => {
        setZoneToDelete(zone);
        setIsDeleteModalOpen(true);
    };

    const handleSaveZone = async (zoneData: Partial<Zone>) => {
        console.log('Saving zone to Supabase:', zoneData);
        if (onSaveZone) {
            await onSaveZone(zoneData);
        }
        setIsFormModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (zoneToDelete) {
            console.log('Deleting zone:', zoneToDelete.id);
            if (onDeleteZoneById) {
                // Supabase delete
                await onDeleteZoneById(zoneToDelete.id);
                // Also call the original prop to update UI state if needed
                onDeleteZone?.(zoneToDelete.id);
            } else {
                onDeleteZone?.(zoneToDelete.id);
            }
        }
        setIsDeleteModalOpen(false);
        setZoneToDelete(null);
    };

    return (
        <>
            <div className="flex h-full w-full">
                {/* LEFT PANEL - Zone List */}
                <div className="w-96 flex-none bg-[#18181b]/95 border-r border-white/10 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="p-5 border-b border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                <MapPinned className="w-5 h-5 text-purple-400" />
                                Zone Management
                            </h2>
                            <Button
                                onClick={handleAddZone}
                                size="sm"
                                className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Zone
                            </Button>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-red-400">{zones.filter(z => z.severity === 'HIGH').length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">Red Zones</div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{zones.filter(z => z.severity === 'MODERATE').length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">Yellow</div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-emerald-400">{zones.filter(z => z.severity === 'LOW').length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">Low Risk</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search zones..."
                                className="w-full pl-10 pr-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>

                        {/* Severity Filter */}
                        <div className="flex gap-1">
                            {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((severity) => (
                                <button
                                    key={severity}
                                    onClick={() => setSeverityFilter(severity)}
                                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-medium uppercase tracking-wide transition-all ${severityFilter === severity
                                        ? severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : severity === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : severity === 'LOW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                                        }`}
                                >
                                    {severity === 'ALL' ? 'All' : severity.slice(0, 3)}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${viewMode === 'map'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                Map View
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                List View
                            </button>
                        </div>
                    </div>

                    {/* Placeholder - Zone list is in right panel */}
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
                            <p className="text-sm text-zinc-400">Select zones on the map</p>
                            <p className="text-xs text-zinc-600 mt-1">Click on zone polygons to view details</p>
                            <p className="text-xs text-cyan-500/80 mt-3">Active Zones list is in the right panel →</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Map or Details */}
                <div className="flex-1 relative">
                    {viewMode === 'map' ? (
                        <MapView
                            zones={filteredZones}
                            locations={[]}
                            incidents={[]}
                            selectedIncidentId={null}
                            onSelectIncident={() => { }}
                            loading={false}
                            supabaseEnabled={false}
                            mapStyle="mapbox://styles/mapbox/dark-v11"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-[#09090b]">
                            <div className="text-center">
                                <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-zinc-100 mb-2">Detailed List View</h3>
                                <p className="text-zinc-500 text-sm">Coming soon...</p>
                            </div>
                        </div>
                    )}

                    {/* Selected Zone Details Overlay */}
                    {selectedZone && viewMode === 'map' && (
                        <div className="absolute bottom-6 right-6 w-80 bg-[#18181b]/95 border border-white/10 rounded-lg p-4 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-zinc-100">{selectedZone.location}</h3>
                                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedZone.severity === 'HIGH'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : selectedZone.severity === 'MODERATE'
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                        {selectedZone.severity}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedZone(null)}
                                    className="text-zinc-500 hover:text-white transition-colors text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>{selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <MapPinned className="w-3 h-3" />
                                    <span>Radius: {selectedZone.radius || 200}m</span>
                                </div>
                                {selectedZone.active_hours && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{selectedZone.active_hours}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-zinc-500">{selectedZone.description}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={() => handleEditZone(selectedZone)}
                                    size="sm"
                                    className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                                >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => handleDeleteZone(selectedZone)}
                                    size="sm"
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ZoneFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveZone}
                editingZone={editingZone}
                mode={formMode}
            />

            <DeleteZoneModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                zone={zoneToDelete}
            />
        </>
    );
};

// Zone Card Component
interface ZoneCardProps {
    zone: Zone;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, isSelected, onSelect, onEdit, onDelete }) => {
    const severityColor =
        zone.severity === 'HIGH' ? 'red' :
            zone.severity === 'MODERATE' ? 'yellow' :
                'emerald';

    return (
        <div
            onClick={onSelect}
            className={`rounded-lg border p-3 mb-2 cursor-pointer transition-all ${isSelected
                ? `border-${severityColor}-500/50 bg-${severityColor}-500/10`
                : `border-${severityColor}-500/20 bg-${severityColor}-500/5 hover:bg-${severityColor}-500/10`
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-zinc-100">{zone.location}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{zone.type.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {zone.radius || 200}m
                </span>
                {zone.active_hours && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {zone.active_hours}
                    </span>
                )}
            </div>
        </div>
    );
};
