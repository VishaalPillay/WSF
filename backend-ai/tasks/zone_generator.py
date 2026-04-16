import os
import binascii
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client
from sklearn.cluster import DBSCAN
from shapely.geometry import MultiPoint, Polygon
from shapely import wkt, wkb, concave_hull

# Load environment variables from backend-ai/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def parse_geometry(loc):
    """
    Parses a PostGIS geometry response into (lon, lat).
    Handles GeoJSON dicts, WKT strings, and EWKB hex strings.
    """
    if not loc:
        return None
        
    # Check if GeoJSON
    if isinstance(loc, dict):
        coords = loc.get("coordinates")
        if coords and len(coords) >= 2:
            return coords[0], coords[1]  # lon, lat
            
    # Check if String (WKT or EWKB)
    elif isinstance(loc, str):
        # Try WKT
        if "POINT" in loc.upper() or "SRID" in loc.upper():
            try:
                # wkt.loads doesn't natively ignore the SRID prefix, so strip it if present
                clean_wkt = loc.split(";")[-1] if ";" in loc else loc
                geom = wkt.loads(clean_wkt)
                return geom.x, geom.y
            except Exception:
                pass
                
        # Try WKB / EWKB Hex
        try:
            # hex string to bytes
            geom = wkb.loads(binascii.unhexlify(loc))
            return geom.x, geom.y
        except Exception:
            pass
            
    return None

def generate_dynamic_zones():
    """
    Fetches coordinates from the 'incidents' table, clusters them using DBSCAN
    (with Haversine distance), computes concave hulls, buffers them for street
    width, and inserts them into the 'dynamic_zones' table.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        return

    supabase: Client = create_client(url, key)

    print("Fetching incidents from database...")
    # Select the PostGIS 'location' column
    # Ensure to only query what we need to minimize overhead
    res = supabase.table("incidents").select("location").execute()
    data = res.data

    points = []
    for row in data:
        pt = parse_geometry(row.get("location"))
        if pt:
            # We store as (lat, lon) for sklearn's haversine metric
            points.append((pt[1], pt[0]))

    if len(points) < 3:
        print("⚠️ Not enough points to cluster (minimum 3 required). Exiting.")
        return

    print(f"✅ Found {len(points)} valid incident coordinates. Running DBSCAN clustering...")
    
    # Haversine distance requires coordinates in radians
    pts_rad = np.radians(points)
    
    # 50 meters epsilon, converted to radians based on Earth's radius in meters
    eps_rad = 50.0 / 6371000.0
    
    # min_samples=3 as per strict requirement
    db = DBSCAN(eps=eps_rad, min_samples=3, metric='haversine')
    labels = db.fit_predict(pts_rad)
    
    # Group points by cluster label
    clusters = {}
    for i, label in enumerate(labels):
        if label != -1:  # -1 represents noise points
            # Convert back to (lon, lat) for Shapely operations
            lat, lon = points[i]
            clusters.setdefault(label, []).append((lon, lat))

    if not clusters:
        print("ℹ️ No clusters formed with the current incidents and epsilon.")
        return

    print(f"✅ Formed {len(clusters)} valid cluster(s). Generating hulls...")
    
    insert_payload = []
    
    # Approx 15 meters in degrees (valid near equator, adequate for SRM Chennai at 12.8°N)
    # 1 degree is roughly 111,320 meters.
    buffer_degrees = 15.0 / 111320.0 
    
    for label, cluster_pts in clusters.items():
        mp = MultiPoint(cluster_pts)
        
        # Geometrically encapsulate points using a concave hull
        hull = concave_hull(mp, ratio=0.3)
        
        # Buffer the hull to account for street width (prevent razor-thin polygons)
        buffered_hull = hull.buffer(buffer_degrees)
        
        # Ensure the output is castable to a PostGIS Polygon (can be Polygon or MultiPolygon)
        if buffered_hull.geom_type in ['Polygon', 'MultiPolygon']:
            # We'll use EWKT for Supabase/PostgREST boundary insertion
            wkt_poly = wkt.dumps(buffered_hull)
            ewkt = f"SRID=4326;{wkt_poly}"
            
            insert_payload.append({
                "risk_level": "red",
                "source": "dbscan",
                "boundary": ewkt
            })

    # Clear old dbscan-generated zones
    print("🧹 Deleting prior machine-generated risk zones...")
    try:
        supabase.table("dynamic_zones").delete().eq("source", "dbscan").execute()
    except Exception as e:
        print(f"❌ Error deleting old zones: {e}")

    if insert_payload:
        print(f"📥 Inserting {len(insert_payload)} new dynamic zone(s) into database...")
        try:
            supabase.table("dynamic_zones").insert(insert_payload).execute()
            print("✅ Success! Dynamic Risk Zones updated.")
        except Exception as e:
            print(f"❌ Error inserting new zones: {e}")

if __name__ == "__main__":
    generate_dynamic_zones()
