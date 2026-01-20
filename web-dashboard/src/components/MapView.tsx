import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Incident, LiveLocation } from '../types';
import { Zone } from '../hooks/useZones';
import { REAL_USER_PROFILES } from '../data/velloreRealData';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibmlraGlsMjEwMjA2IiwiYSI6ImNta2U0NG0zdTAzMzUzZXMwZjZwbXFzZ3kifQ.fgjpDhGp_9bUapwaLEvtsg';

interface MapViewProps {
  incidents?: Incident[];
  locations?: LiveLocation[];
  zones?: Zone[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  loading?: boolean;
  supabaseEnabled?: boolean;
  showHeatmap?: boolean;
  mapStyle?: string;
}

// Helper: Check if point is inside a circle (for zone detection)
function isPointInZone(lat: number, lng: number, zone: Zone): boolean {
  const R = 6371; // Earth radius in km
  const dLat = (zone.lat - lat) * Math.PI / 180;
  const dLon = (zone.lng - lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * Math.PI / 180) * Math.cos(zone.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters

  return distance <= (zone.radius || 200);
}

const MapView: React.FC<MapViewProps> = ({
  incidents = [],
  locations = [],
  zones = [],
  selectedIncidentId,
  onSelectIncident,
  loading = false,
  supabaseEnabled = false,
  showHeatmap = false,
  mapStyle = 'mapbox://styles/mapbox/dark-v11'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [79.1559, 12.9692], // VIT Vellore
      zoom: 13.5,
      pitch: 0,
      attributionControl: false,
      renderWorldCopies: false // Prevent coordinate confusion
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapStyle]);

  // Render Zones as Circles with proper geographic radius
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing zone layers
    zones.forEach((_, idx) => {
      const circleId = `zone-circle-${idx}`;
      const borderId = `zone-circle-border-${idx}`;
      if (map.current!.getLayer(circleId)) map.current!.removeLayer(circleId);
      if (map.current!.getLayer(borderId)) map.current!.removeLayer(borderId);
      if (map.current!.getSource(circleId)) map.current!.removeSource(circleId);
    });

    // Add new zone circles with proper geographic radius
    zones.forEach((zone, idx) => {
      const color = zone.severity === 'HIGH' ? '#FF4D4D' : '#FFD700';
      const radiusInMeters = zone.radius || 200;

      // Create a circle polygon using geographic coordinates
      const center = [zone.lng, zone.lat];
      const radiusInKm = radiusInMeters / 1000;
      const points = 64;
      const coords: number[][] = [];

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = radiusInKm * Math.cos(angle);
        const dy = radiusInKm * Math.sin(angle);

        // Convert km offset to degrees (approximate)
        const deltaLat = dy / 111.32;
        const deltaLng = dx / (111.32 * Math.cos(zone.lat * Math.PI / 180));

        coords.push([
          center[0] + deltaLng,
          center[1] + deltaLat
        ]);
      }
      coords.push(coords[0]); // Close the polygon

      map.current!.addSource(`zone-circle-${idx}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          },
          properties: {}
        }
      });

      // Fill layer
      map.current!.addLayer({
        id: `zone-circle-${idx}`,
        type: 'fill',
        source: `zone-circle-${idx}`,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.15
        }
      });

      // Border layer
      map.current!.addLayer({
        id: `zone-circle-border-${idx}`,
        type: 'line',
        source: `zone-circle-${idx}`,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': 0.6
        }
      });
    });
  }, [zones, mapLoaded]);

  // Update User Beacons using GeoJSON (like zones - this ensures proper anchoring)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('Updating beacons using GeoJSON, locations count:', locations.length);

    // Remove existing beacon layers
    locations.forEach((_, idx) => {
      const beaconId = `user-beacon-${idx}`;
      const beaconBorderId = `user-beacon-border-${idx}`;
      if (map.current!.getLayer(beaconId)) map.current!.removeLayer(beaconId);
      if (map.current!.getLayer(beaconBorderId)) map.current!.removeLayer(beaconBorderId);
      if (map.current!.getSource(beaconId)) map.current!.removeSource(beaconId);
    });

    // Add new beacon layers using GeoJSON
    locations.forEach((location, idx) => {
      // Check if user is in a danger zone
      let inRedZone = false;
      let inYellowZone = false;

      zones.forEach(zone => {
        if (isPointInZone(location.latitude, location.longitude, zone)) {
          if (zone.severity === 'HIGH') inRedZone = true;
          if (zone.severity === 'MODERATE') inYellowZone = true;
        }
      });

      // Create beacon as a circle layer
      map.current!.addSource(`user-beacon-${idx}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          properties: {
            userId: location.user_id,
            inRedZone,
            inYellowZone
          }
        }
      });

      // Beacon fill layer
      map.current!.addLayer({
        id: `user-beacon-${idx}`,
        type: 'circle',
        source: `user-beacon-${idx}`,
        paint: {
          'circle-radius': 8,
          'circle-color': '#3B82F6', // Always blue
          'circle-opacity': 1
        }
      });

      // Beacon border layer
      map.current!.addLayer({
        id: `user-beacon-border-${idx}`,
        type: 'circle',
        source: `user-beacon-${idx}`,
        paint: {
          'circle-radius': 8,
          'circle-color': 'transparent',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 3
        }
      });

      console.log(`✓ Beacon anchored at [${location.longitude}, ${location.latitude}] using GeoJSON`);
    });

    console.log(`✓ Total beacons on map: ${locations.length}`);
  }, [locations, mapLoaded]);

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <style jsx>{`
        @keyframes beacon-blink-red {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes beacon-blink-yellow {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
        }
        .beacon-blink-red {
          animation: beacon-blink-red 1s infinite;
        }
        .beacon-blink-yellow {
          animation: beacon-blink-yellow 1.5s infinite;
        }
      `}</style>
    </>
  );
};

export default MapView;
