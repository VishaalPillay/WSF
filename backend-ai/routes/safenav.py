import requests
import polyline
import math
from typing import List, Dict

# --- CONFIGURATION ---
# YOU MUST PUT YOUR MAPBOX TOKEN HERE
MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibmlraGlsMjEwMjA2IiwiYSI6ImNta2U0NG0zdTAzMzUzZXMwZjZwbXFzZ3kifQ.fgjpDhGp_9bUapwaLEvtsg" # Replace with the same token the mobile app uses

def get_distance(lat1, lon1, lat2, lon2):
    """
    Haversine formula to calculate distance between two points in meters.
    """
    R = 6371000  # Radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def analyze_route_safety(route_geometry: List[tuple], crime_data: Dict) -> Dict:
    """
    Scans a route path and calculates a 'Risk Score'.
    """
    risk_score = 0
    detected_zones = []
    
    # 1. Iterate through points on the route (simplified: check every 10th point to be fast)
    for i in range(0, len(route_geometry), 10):
        point_lat, point_lng = route_geometry[i]
        
        # 2. Check against every Red Zone in our Database
        for zone in crime_data.get("incidents", []):
            if "lat" not in zone: continue
            
            dist = get_distance(point_lat, point_lng, zone["lat"], zone["lng"])
            
            # 3. If route is within 300m of a High Severity Zone -> PENALTY
            if dist < 300: 
                # Avoid duplicate penalties for the same zone
                if zone["id"] not in detected_zones:
                    penalty = 50 if zone.get("severity") == "HIGH" else 20
                    risk_score += penalty
                    detected_zones.append(zone["id"])

    # 4. Calculate Final Safety Score (100 is perfect, 0 is deadly)
    # We cap the penalty at 90 so score is never below 10
    final_score = max(10, 100 - risk_score)
    
    return {
        "safety_score": final_score,
        "risk_details": len(detected_zones), # How many bad zones we hit
        "detected_ids": detected_zones
    }

def find_safest_route(start_lat, start_lng, end_lat, end_lng, crime_data):
    """
    The Main Function: Fetches routes from Mapbox, scores them, and picks the best.
    """
    # 1. Request 3 alternatives from Mapbox
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
        
        # 2. Loop through every route option Mapbox gave us
        for route in data["routes"]:
            # Decode the shape (polyline) into coordinates
            geometry = polyline.decode(route["geometry"])
            
            # Analyze Safety
            safety_analysis = analyze_route_safety(geometry, crime_data)
            
            scored_routes.append({
                "route_geometry": route["geometry"], # Keep encoded string for Mobile
                "duration": route["duration"],
                "distance": route["distance"],
                "safety_score": safety_analysis["safety_score"],
                "risk_count": safety_analysis["risk_details"]
            })
            
        # 3. Sort: We want Highest Safety Score first
        # If scores are equal, pick the shortest duration
        scored_routes.sort(key=lambda x: (-x["safety_score"], x["duration"]))
        
        return {
            "status": "success",
            "recommended_route": scored_routes[0], # The Winner
            "alternatives": scored_routes[1:]
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}