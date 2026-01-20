import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Zone } from '../hooks/useZones';

interface DeleteZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    zone: Zone | null;
}

export const DeleteZoneModal: React.FC<DeleteZoneModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    zone
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        // Simulate API call
        setTimeout(() => {
            onConfirm();
            setIsDeleting(false);
            onClose();
        }, 500);
    };

    if (!isOpen || !zone) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#18181b] border border-red-500/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-red-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">Delete Zone</h2>
                            <p className="text-xs text-zinc-500">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-zinc-300">
                        Are you sure you want to delete the zone <span className="font-bold text-white">"{zone.location}"</span>?
                    </p>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-red-300 space-y-1">
                                <p className="font-medium">This will permanently remove:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-red-400/80">
                                    <li>Zone boundary and coverage area</li>
                                    <li>Associated risk level data</li>
                                    <li>Historical incident references</li>
                                    <li>User location alerts for this zone</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Zone Info */}
                    <div className="bg-[#09090b] border border-white/5 rounded-lg p-3 space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Location:</span>
                            <span className="text-zinc-300 font-medium">{zone.location}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Risk Level:</span>
                            <span className={`font-medium ${zone.severity === 'HIGH' ? 'text-red-400' :
                                    zone.severity === 'MODERATE' ? 'text-yellow-400' :
                                        'text-emerald-400'
                                }`}>
                                {zone.severity}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Radius:</span>
                            <span className="text-zinc-300">{zone.radius || 200}m</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#09090b]">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="ghost"
                        className="text-zinc-400 hover:text-white"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Zone
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
