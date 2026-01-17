import json
import os
from routes.safenav import find_safest_route
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Sentra AI Backend", version="1.0")

# --- 1. CONFIGURATION & CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATA LOADING ---
CRIME_DATA = {"incidents": []}
ASSETS_PATH = os.path.join(os.path.dirname(__file__), "../assets/crimes.json")

try:
    if os.path.exists(ASSETS_PATH):
        with open(ASSETS_PATH, "r") as f:
            CRIME_DATA = json.load(f)
        print(f"✅ Loaded {len(CRIME_DATA.get('incidents', []))} incidents from assets.")
    else:
        print(f"⚠️ WARNING: crimes.json not found at {ASSETS_PATH}. Run generate_data.py first!")
except Exception as e:
    print(f"❌ Error loading data: {e}")

# --- 3. HELPER FUNCTIONS ---
def is_time_in_range(start: int, end: int, current: int) -> bool:
    """
    Checks if 'current' hour is between start and end.
    Handles overnight ranges like 19-05 (7 PM to 5 AM).
    """
    if start < end:
        return start <= current < end
    else:
        # Range crosses midnight (e.g., 19 to 5)
        return current >= start or current < end

# --- 4. DATA MODELS ---
class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    user_id: Optional[str] = "guest"

# --- 5. API ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "online", "system": "Sentra AI Backend"}

@app.get("/zones")
def get_danger_zones(simulated_hour: Optional[int] = None):
    """
    Returns High-Risk Zones filtered by TIME.
    Usage: GET /zones?simulated_hour=22 (To test 'Night Mode')
    """
    # 1. Determine Time
    if simulated_hour is not None:
        current_hour = simulated_hour
    else:
        current_hour = datetime.now().hour

    # 2. Extract Data
    incidents_list = CRIME_DATA.get("incidents", [])
    active_zones = []

    # 3. Filter Loop
    for point in incidents_list:
        # Validate coordinates
        if "lat" not in point or "lng" not in point:
            continue

        # Check Active Hours
        if "active_hours" in point:
            try:
                # Format "19-05" -> start=19, end=5
                start_str, end_str = point["active_hours"].split("-")
                start, end = int(start_str), int(end_str)
                
                # Only add if currently in danger window
                if is_time_in_range(start, end, current_hour):
                    active_zones.append(point)
            except ValueError:
                # If format is wrong, fail safe (include it)
                active_zones.append(point)
        else:
            # No specific hours = Always Dangerous (e.g., Construction zones)
            active_zones.append(point)
    
    return {
        "server_time": f"{current_hour}:00",
        "count": len(active_zones),
        "zones": active_zones
    }

@app.post("/get-safe-route")
def calculate_safe_route(request: RouteRequest):
    """
    Phase 2 Logic: Real AI Routing
    """
    print(f"📍 Calculating Safe Route: {request.start_lat},{request.start_lng} -> {request.end_lat},{request.end_lng}")
    
    # 1. Pass the request + Our Crime Database to the Engine
    result = find_safest_route(
        request.start_lat, 
        request.start_lng, 
        request.end_lat, 
        request.end_lng, 
        CRIME_DATA # We pass the loaded JSON data here
    )
    
    return result