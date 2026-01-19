import { useState, useEffect } from 'react';
import { CRIME_ZONES, getZonesByTimeMode, TimeMode } from '../data/crimeZones';

export interface Zone {
    id: number;
    location: string;
    lat: number;
    lng: number;
    severity: 'HIGH' | 'MODERATE' | 'LOW';
    type: string;
    description: string;
    radius?: number;
    active_hours?: string;
}

export function useZones(timeMode: TimeMode = 'all') {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get zones filtered by time mode
        const filteredZones = getZonesByTimeMode(timeMode);
        setZones(filteredZones);
        setLoading(false);
    }, [timeMode]);

    return { zones, loading };
}
