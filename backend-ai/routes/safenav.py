import os
import requests
import polyline
from typing import List, Dict
from shapely.geometry import LineString, shape
from shapely.errors import GEOSException

# --- CONFIGURATION ---
MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_ACCESS_TOKEN")
if not MAPBOX_ACCESS_TOKEN:
    raise RuntimeError("Missing MAPBOX_ACCESS_TOKEN in environment.")


def _extract_zone_geometry(zone: Dict) -> Dict | None:
    boundary = zone.get("boundary")
    if isinstance(boundary, dict) and boundary.get("type"):
        return boundary
    geometry = zone.get("geometry")
    if isinstance(geometry, dict) and geometry.get("type"):
        return geometry
    return None


def _zone_penalty(zone: Dict) -> int:
    risk_level = str(zone.get("risk_level", "")).lower()
    if risk_level in {"high", "red", "critical"}:
        return 50
    if risk_level in {"moderate", "yellow", "medium"}:
        return 20
    return 30


def analyze_route_safety(route_geometry: List[tuple], dynamic_zones: List[Dict]) -> Dict:
    """
    Scores a route by checking shapely LineString intersections
    against dynamic zone polygons fetched from Supabase.
    """
    route_line = LineString([(lng, lat) for lat, lng in route_geometry])
    risk_score = 0
    detected_zones = []

    for zone in dynamic_zones:
        zone_id = zone.get("id")
        zone_geojson = _extract_zone_geometry(zone)
        if not zone_geojson or zone_id in detected_zones:
            continue

        try:
            zone_geom = shape(zone_geojson)
        except (TypeError, ValueError, GEOSException):
            continue

        if route_line.intersects(zone_geom):
            risk_score += _zone_penalty(zone)
            detected_zones.append(zone_id)

    final_score = max(10, 100 - risk_score)

    return {
        "safety_score": final_score,
        "risk_details": len(detected_zones),
        "detected_ids": detected_zones,
    }


def find_safest_route(start_lat, start_lng, end_lat, end_lng, dynamic_zones):
    """
    The Main Function: Fetches routes from Mapbox, scores them, and picks the best.
    """
    url = f"https://api.mapbox.com/directions/v5/mapbox/walking/{start_lng},{start_lat};{end_lng},{end_lat}"
    params = {
        "alternatives": "true",
        "geometries": "polyline",
        "access_token": MAPBOX_ACCESS_TOKEN
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if "routes" not in data:
            return {"error": "No routes found", "raw": data}
            
        scored_routes = []
        
        for route in data["routes"]:
            geometry = polyline.decode(route["geometry"])
            safety_analysis = analyze_route_safety(geometry, dynamic_zones)
            
            scored_routes.append({
                "route_geometry": route["geometry"],
                "duration": route["duration"],
                "distance": route["distance"],
                "safety_score": safety_analysis["safety_score"],
                "risk_count": safety_analysis["risk_details"],
            })
            
        scored_routes.sort(key=lambda x: (-x["safety_score"], x["duration"]))
        
        return {
            "status": "success",
            "recommended_route": scored_routes[0],
            "alternatives": scored_routes[1:],
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}