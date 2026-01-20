import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Clock, Save } from 'lucide-react';
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
        severity: 'MODERATE' as 'HIGH' | 'MODERATE' | 'LOW',
        type: 'crime_hotspot',
        description: '',
        radius: 200,
        active_hours: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
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
                active_hours: editingZone.active_hours || ''
            });
        } else {
            // Reset form for new zone
            setFormData({
                location: '',
                lat: 12.9692,
                lng: 79.1559,
                severity: 'MODERATE',
                type: 'crime_hotspot',
                description: '',
                radius: 200,
                active_hours: ''
            });
        }
        setErrors({});
    }, [editingZone, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.location.trim()) {
            newErrors.location = 'Location name is required';
        }

        if (formData.lat < -90 || formData.lat > 90) {
            newErrors.lat = 'Latitude must be between -90 and 90';
        }

        if (formData.lng < -180 || formData.lng > 180) {
            newErrors.lng = 'Longitude must be between -180 and 180';
        }

        if (formData.radius < 50 || formData.radius > 1000) {
            newErrors.radius = 'Radius must be between 50m and 1000m';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            const zoneData: Partial<Zone> = {
                ...formData,
                id: editingZone?.id || Date.now()
            };

            onSave(zoneData);
            setIsSaving(false);
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <MapPin className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100">
                                {mode === 'add' ? 'Add New Zone' : 'Edit Zone'}
                            </h2>
                            <p className="text-xs text-zinc-500">
                                {mode === 'add' ? 'Create a new risk zone' : 'Update zone information'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Location Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Location Name *
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="e.g., TASMAC Katpadi"
                        />
                        {errors.location && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errors.location}
                            </p>
                        )}
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.lat && (
                                <p className="text-xs text-red-400 mt-1">{errors.lat}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.lng && (
                                <p className="text-xs text-red-400 mt-1">{errors.lng}</p>
                            )}
                        </div>
                    </div>

                    {/* Severity & Radius */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Risk Level *
                            </label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                                className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            >
                                <option value="HIGH">High Risk (Red)</option>
                                <option value="MODERATE">Moderate Risk (Yellow)</option>
                                <option value="LOW">Low Risk (Green)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Radius (meters) *
                            </label>
                            <input
                                type="number"
                                min="50"
                                max="1000"
                                step="10"
                                value={formData.radius}
                                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            {errors.radius && (
                                <p className="text-xs text-red-400 mt-1">{errors.radius}</p>
                            )}
                        </div>
                    </div>

                    {/* Zone Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Zone Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        >
                            <option value="crime_hotspot">Crime Hotspot</option>
                            <option value="moderate_risk">Moderate Risk</option>
                            <option value="low_risk">Low Risk</option>
                            <option value="dark_area">Dark Area (Poor Lighting)</option>
                            <option value="isolated">Isolated Area</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Active Hours */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Active Hours (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.active_hours}
                            onChange={(e) => setFormData({ ...formData, active_hours: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="e.g., 10:00 PM - 6:00 AM"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Leave empty if zone is active 24/7
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                            placeholder="Describe the risk factors and characteristics of this zone..."
                        />
                        {errors.description && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                        <p className="text-xs text-purple-400 font-medium mb-2">Preview</p>
                        <div className="space-y-1 text-xs text-zinc-400">
                            <p><span className="text-zinc-500">Location:</span> {formData.location || 'Not set'}</p>
                            <p><span className="text-zinc-500">Coordinates:</span> {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                            <p><span className="text-zinc-500">Risk:</span> <span className={
                                formData.severity === 'HIGH' ? 'text-red-400' :
                                    formData.severity === 'MODERATE' ? 'text-yellow-400' :
                                        'text-emerald-400'
                            }>{formData.severity}</span></p>
                            <p><span className="text-zinc-500">Coverage:</span> {formData.radius}m radius</p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#09090b]">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="ghost"
                        className="text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {mode === 'add' ? 'Create Zone' : 'Update Zone'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
