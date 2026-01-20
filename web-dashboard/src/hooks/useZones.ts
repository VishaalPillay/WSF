import { useState, useEffect, useCallback } from 'react';
import { CRIME_ZONES, getZonesByTimeMode, TimeMode, CrimeZone } from '../data/crimeZones';
import { getSupabaseClient } from '../lib/supabaseClient';

export interface Zone extends CrimeZone { }

export function useZones(timeMode: TimeMode = 'all') {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClient();

    // Fetch zones function - can be called to refetch
    const fetchZones = useCallback(async () => {
        setLoading(true);

        // 1. Get static zones
        const staticZones = getZonesByTimeMode(timeMode);

        // Use a Map to ensure uniqueness based on name/location
        const uniqueZonesMap = new Map<string, Zone>();

        // Add static zones first
        staticZones.forEach(z => uniqueZonesMap.set(z.location, z));

        // 2. Fetch dynamic zones from Supabase if connected
        if (supabase) {
            const { data, error } = await supabase
                .from('zones')
                .select('*');

            if (!error && data) {
                // Map Supabase zones to CrimeZone format
                data.forEach((z: any) => {
                    let lat = 12.9692;
                    let lng = 79.1559;

                    if (z.polygon_geojson?.geometry?.type === 'Polygon') {
                        const coords = z.polygon_geojson.geometry.coordinates[0];
                        if (coords && coords.length > 0) {
                            lat = coords.reduce((sum: number, p: number[]) => sum + p[1], 0) / coords.length;
                            lng = coords.reduce((sum: number, p: number[]) => sum + p[0], 0) / coords.length;
                        }
                    }

                    const dynamicZone = {
                        id: z.id,
                        location: z.name || "Custom Zone",
                        lat: lat,
                        lng: lng,
                        severity: (z.risk_level === 'red' ? 'HIGH' : z.risk_level === 'yellow' ? 'MODERATE' : 'LOW'),
                        type: z.description?.includes('Harassment') ? 'Harassment' : 'Custom',
                        description: z.description || "Added by Authority",
                        radius: 200,
                        active_hours: z.active_hours
                    } as Zone;

                    // Add or overwrite using location name as key
                    uniqueZonesMap.set(dynamicZone.location, dynamicZone);
                });
            }
        }

        setZones(Array.from(uniqueZonesMap.values()));
        setLoading(false);
    }, [timeMode, supabase]);

    // Fetch on mount and timeMode change
    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    // Function to add a new zone
    const addZone = async (newZone: Omit<Zone, 'id'>) => {
        if (!supabase) {
            console.error("Supabase not connected");
            return;
        }

        // Create circular polygon GeoJSON
        const radius = newZone.radius || 200;
        const points = 32;
        const coords: number[][] = [];
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const dx = (radius / 1000) * Math.cos(angle);
            const dy = (radius / 1000) * Math.sin(angle);
            const deltaLat = dy / 111.32;
            const deltaLng = dx / (111.32 * Math.cos(newZone.lat * Math.PI / 180));
            coords.push([newZone.lng + deltaLng, newZone.lat + deltaLat]);
        }
        coords.push(coords[0]); // Close the polygon

        console.log('Adding zone to Supabase:', newZone.location);

        const { data, error } = await supabase.from('zones' as any).insert({
            name: newZone.location,
            risk_level: newZone.severity === 'HIGH' ? 'red' : 'yellow',
            description: newZone.description || 'Added via Dashboard',
            polygon_geojson: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [coords]
                }
            },
            active_hours: newZone.active_hours || null
        }).select();

        if (error) {
            console.error("❌ Failed to save zone:", error);
            alert(`Failed to save zone: ${error.message}`);
        } else {
            console.log("✅ Zone saved:", data);
            // Refetch zones to get updated list
            await fetchZones();
        }
    };

    // Function to delete a zone
    const deleteZone = async (zoneId: string | number) => {
        if (!supabase) {
            console.error("Supabase not connected");
            return;
        }

        // Check if it's a static zone (number IDs from crimeZones.ts)
        if (typeof zoneId === 'number' && zoneId < 1000) {
            alert("Cannot delete predefined zones from the crime audit data.");
            return;
        }

        console.log('Deleting zone:', zoneId);

        const { error } = await supabase
            .from('zones' as any)
            .delete()
            .eq('id', zoneId);

        if (error) {
            console.error("❌ Failed to delete zone:", error);
            alert(`Failed to delete zone: ${error.message}`);
        } else {
            console.log("✅ Zone deleted");
            // Refetch zones
            await fetchZones();
        }
    };

    return { zones, loading, addZone, deleteZone, refetch: fetchZones };
}
