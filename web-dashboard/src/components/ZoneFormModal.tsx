import React, { useState, useEffect } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Zone } from '../hooks/useZones';

interface ZoneFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (zone: Partial<Zone>) => void;
    editingZone?: Zone | null;
    mode: 'add' | 'edit';
}

export const ZoneFormModal: React.FC<ZoneFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingZone,
    mode
}) => {
    const [formData, setFormData] = useState({
        location: '',
        lat: 12.9692,
        lng: 79.1559,
        severity: 'HIGH' as 'HIGH' | 'MODERATE' | 'LOW',
        type: 'crime_hotspot',
        description: '',
        radius: 200,
        time_mode: 'ALL' as 'DAY' | 'NIGHT' | 'ALL'
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingZone) {
            setFormData({
                location: editingZone.location,
                lat: editingZone.lat,
                lng: editingZone.lng,
                severity: editingZone.severity,
                type: editingZone.type,
                description: editingZone.description,
                radius: editingZone.radius || 200,
                time_mode: (editingZone as any).time_mode || 'ALL'
            });
        } else {
            setFormData({
                location: '',
                lat: 12.9692,
                lng: 79.1559,
                severity: 'HIGH',
                type: 'crime_hotspot',
                description: '',
                radius: 200,
                time_mode: 'ALL'
            });
        }
    }, [editingZone, isOpen]);

    const handleSubmit = async () => {
        if (!formData.location.trim()) return;

        setIsSaving(true);
        const zoneData: Partial<Zone> = {
            ...formData,
            id: editingZone?.id || Date.now(),
            active_hours: formData.time_mode === 'DAY' ? '06-18' : formData.time_mode === 'NIGHT' ? '18-06' : undefined
        };

        onSave(zoneData);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />

            {/* Modal - Compact Design */}
            <div className="relative w-full max-w-md bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden">

                {/* Header - Minimal */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white">
                            {mode === 'add' ? 'Add Zone' : 'Edit Zone'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body - Compact Grid */}
                <div className="p-5 space-y-4">
                    {/* Zone Name */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Zone Name</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., TASMAC Katpadi"
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none"
                        />
                    </div>

                    {/* Coordinates - Inline */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Risk Level - Button Toggle */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-2 block">Risk Level</label>
                        <div className="flex gap-2">
                            {(['HIGH', 'MODERATE'] as const).map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, severity: level })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${formData.severity === level
                                        ? level === 'HIGH'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                                        : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {level === 'HIGH' ? '🔴 Red' : '🟡 Yellow'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Mode - Button Toggle */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-2 block">Active Time</label>
                        <div className="flex gap-2">
                            {(['DAY', 'NIGHT', 'ALL'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time_mode: mode })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${formData.time_mode === mode
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                                        : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {mode === 'DAY' ? '☀️ Day' : mode === 'NIGHT' ? '🌙 Night' : '⏰ All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Radius Slider */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-2 flex justify-between">
                            <span>Radius</span>
                            <span className="text-purple-400 font-mono">{formData.radius}m</span>
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={formData.radius}
                            onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                            className="w-full accent-purple-500"
                        />
                    </div>

                    {/* Description - Optional */}
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">Description (optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief risk description..."
                            rows={2}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-white/10 bg-black/20">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1 text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.location.trim()}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {mode === 'add' ? 'Create' : 'Save'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
