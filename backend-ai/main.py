import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Sentra AI Backend", version="1.0")

# --- 1. CONFIGURATION & CORS ---
# Allow the Mobile App and Web Dashboard to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For Hackathon, allow all. In prod, specify IPs.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATA LOADING ---
# We load the "Truth" (crimes.json) into memory when the server starts.
CRIME_DATA = {"incidents": []}
ASSETS_PATH = os.path.join(os.path.dirname(__file__), "../assets/crimes.json")

try:
    if os.path.exists(ASSETS_PATH):
        with open(ASSETS_PATH, "r") as f:
            CRIME_DATA = json.load(f)
        print(f"✅ Loaded {len(CRIME_DATA['incidents'])} incidents from assets.")
    else:
        print(f"⚠️ WARNING: crimes.json not found at {ASSETS_PATH}. Run generate_data.py first!")
except Exception as e:
    print(f"❌ Error loading data: {e}")

# --- 3. DATA MODELS (Pydantic) ---
# This defines what the Mobile App MUST send us for a route request.
class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    user_id: Optional[str] = "guest"

# --- 4. API ENDPOINTS ---

@app.get("/")
def health_check():
    """Simple check to see if server is running."""
    return {"status": "online", "system": "Sentra AI Backend"}

@app.get("/zones")
def get_danger_zones():
    """
    Returns the list of High-Risk Zones.
    """
    # 1. Extract the list from the "incidents" key
    # We use .get() to be safe: if "incidents" is missing, it returns an empty list []
    incidents_list = CRIME_DATA.get("incidents", [])

    # 2. Filter: Only return incidents that have valid coordinates
    # This prevents the app from crashing if you accidentally added a bad point
    valid_zones = [
        point for point in incidents_list
        if "lat" in point and "lng" in point
    ]
    
    # 3. Return the clean list to the mobile app
    return {
        "count": len(valid_zones),
        "zones": valid_zones
    }

@app.post("/get-safe-route")
def calculate_safe_route(request: RouteRequest):
    """
    Receives Start/End coordinates from Mobile App.
    Returns a 'Safety Score' and eventually the list of waypoints.
    """
    print(f"📍 Route Request: {request.start_lat},{request.start_lng} -> {request.end_lat},{request.end_lng}")
    
    # --- STUB LOGIC (Day 1) ---
    # In Phase 2, we will call Mapbox API here.
    # For now, we return a dummy success to prove connection works.
    
    return {
        "status": "success",
        "route_id": "route_123",
        "safety_score": 85,  # Dummy score
        "risk_level": "MODERATE",
        "message": "Route calculation stub active. Mapbox integration pending."
    }