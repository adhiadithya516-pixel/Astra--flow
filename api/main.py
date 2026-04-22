"""
Astra Flow — FastAPI Backend
Shipment management, geocoding, weather, traffic, and rule engine.
"""

import asyncio
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

from geocode import geocode, geocode_autocomplete, get_route, split_route_into_segments
from predictor import predict_location, calculate_avg_speed
from rules import RuleEngine
from weather import get_weather, check_traffic

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("astra.api")

# Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_KEY else None

# Rule engine instance
rule_engine: RuleEngine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start rule engine on startup, stop on shutdown."""
    global rule_engine
    if sb:
        rule_engine = RuleEngine(sb)
        asyncio.create_task(rule_engine.start())
        logger.info("Rule engine background task started")
    yield
    if rule_engine:
        rule_engine.stop()


app = FastAPI(title="Astra Flow API", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Pydantic Models
# ============================================

class ShipmentCreateRequest(BaseModel):
    driver_phone: str
    driver_name: str = ""
    origin: str
    destination: str


class ShipmentCreateResponse(BaseModel):
    tracking_id: str
    share_token: str
    segment_count: int
    total_distance_km: float
    estimated_arrival: str


# ============================================
# Endpoints
# ============================================

@app.get("/health")
async def health():
    return {"status": "ok", "service": "astra-flow-api"}


@app.post("/shipment/create", response_model=ShipmentCreateResponse)
async def create_shipment(req: ShipmentCreateRequest):
    """Create a new shipment with geocoded origin/destination and route segments."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    # Geocode origin
    origin_geo = await geocode(req.origin)
    if not origin_geo:
        raise HTTPException(status_code=400, detail=f"Could not geocode origin: {req.origin}")

    # Geocode destination
    dest_geo = await geocode(req.destination)
    if not dest_geo:
        raise HTTPException(status_code=400, detail=f"Could not geocode destination: {req.destination}")

    # Get route from OSRM
    route = await get_route(
        origin_geo["lat"], origin_geo["lng"],
        dest_geo["lat"], dest_geo["lng"]
    )
    if not route:
        raise HTTPException(status_code=400, detail="Could not calculate route between origin and destination")

    # Generate IDs
    tracking_id = f"AF-{uuid.uuid4().hex[:8].upper()}"
    share_token = uuid.uuid4().hex

    # Calculate ETA (route duration + buffer)
    now = datetime.now(timezone.utc)
    eta = now + timedelta(seconds=route["duration_sec"] * 1.15)  # 15% buffer

    # Insert shipment
    shipment_data = {
        "tracking_id": tracking_id,
        "driver_phone": req.driver_phone,
        "driver_name": req.driver_name,
        "origin": origin_geo["display_name"],
        "origin_lat": origin_geo["lat"],
        "origin_lng": origin_geo["lng"],
        "destination": dest_geo["display_name"],
        "dest_lat": dest_geo["lat"],
        "dest_lng": dest_geo["lng"],
        "status": "pending",
        "total_distance_km": round(route["distance_km"], 2),
        "estimated_arrival": eta.isoformat(),
    }

    result = sb.table("shipments").insert(shipment_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create shipment")

    shipment_id = result.data[0]["id"]

    # Split route into 30km segments
    segments = split_route_into_segments(route["geometry_coords"], segment_length_km=30.0)

    for seg in segments:
        sb.table("route_segments").insert({
            "shipment_id": shipment_id,
            "segment_index": seg["segment_index"],
            "start_lat": seg["start_lat"],
            "start_lng": seg["start_lng"],
            "end_lat": seg["end_lat"],
            "end_lng": seg["end_lng"],
            "distance_km": seg["distance_km"],
        }).execute()

    # Create tracking session
    sb.table("tracking_sessions").insert({
        "shipment_id": shipment_id,
        "driver_phone": req.driver_phone,
        "share_token": share_token,
    }).execute()

    return ShipmentCreateResponse(
        tracking_id=tracking_id,
        share_token=share_token,
        segment_count=len(segments),
        total_distance_km=round(route["distance_km"], 2),
        estimated_arrival=eta.isoformat(),
    )


@app.get("/shipment/{tracking_id}")
async def get_shipment(tracking_id: str):
    """Get full shipment details including last location and segments."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    # Get shipment
    result = sb.table("shipments").select("*").eq("tracking_id", tracking_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment = result.data[0]
    shipment_id = shipment["id"]

    # Get last location (real ping preferred)
    last_ping = sb.table("location_pings").select("*").eq(
        "shipment_id", shipment_id
    ).order("recorded_at", desc=True).limit(1).execute()

    # Get location history for plotting actual driven route
    history_pings = sb.table("location_pings").select("lat,lng,is_predicted,network_status,recorded_at").eq(
        "shipment_id", shipment_id
    ).order("recorded_at", desc=False).limit(500).execute()

    # Get segments
    segments = sb.table("route_segments").select("*").eq(
        "shipment_id", shipment_id
    ).order("segment_index").execute()

    # Get tracking session
    session = sb.table("tracking_sessions").select("*").eq(
        "shipment_id", shipment_id
    ).order("started_at", desc=True).limit(1).execute()

    # Get route geometry from OSRM
    route = await get_route(
        shipment["origin_lat"], shipment["origin_lng"],
        shipment["dest_lat"], shipment["dest_lng"]
    )

    return {
        "shipment": shipment,
        "last_location": last_ping.data[0] if last_ping.data else None,
        "segments": segments.data or [],
        "tracking_session": session.data[0] if session.data else None,
        "route_geometry": route["geometry_coords"] if route else None,
        "location_history": history_pings.data or [],
    }


@app.post("/shipment/{tracking_id}/stop-tracking")
async def stop_tracking(tracking_id: str):
    """Stop tracking session for privacy."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    # Get shipment
    result = sb.table("shipments").select("id").eq("tracking_id", tracking_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment_id = result.data[0]["id"]
    now = datetime.now(timezone.utc).isoformat()

    # Deactivate tracking session
    sb.table("tracking_sessions").update({
        "active": False,
        "stopped_at": now,
    }).eq("shipment_id", shipment_id).eq("active", True).execute()

    # Update shipment status
    sb.table("shipments").update({"status": "stopped"}).eq("id", shipment_id).execute()

    # Log
    sb.table("driver_status_log").insert({
        "shipment_id": shipment_id,
        "status": "stopped",
        "note": "Tracking stopped by driver",
    }).execute()

    return {"status": "stopped", "tracking_id": tracking_id}


@app.get("/shipment/{tracking_id}/segments")
async def get_segments(tracking_id: str):
    """Get all route segments for a shipment."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    result = sb.table("shipments").select("id").eq("tracking_id", tracking_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment_id = result.data[0]["id"]
    segments = sb.table("route_segments").select("*").eq(
        "shipment_id", shipment_id
    ).order("segment_index").execute()

    return {"segments": segments.data or []}


@app.get("/shipment/{tracking_id}/alerts")
async def get_alerts(tracking_id: str):
    """Get all alerts for a shipment, unresolved first."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    result = sb.table("shipments").select("id").eq("tracking_id", tracking_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment_id = result.data[0]["id"]
    alerts = sb.table("alerts").select("*").eq(
        "shipment_id", shipment_id
    ).order("resolved").order("created_at", desc=True).execute()

    return {"alerts": alerts.data or []}


@app.post("/alert/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    sb.table("alerts").update({"resolved": True}).eq("id", alert_id).execute()
    return {"status": "resolved", "alert_id": alert_id}


@app.get("/weather")
async def weather_endpoint(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    """Get current weather for a location."""
    try:
        weather = await get_weather(lat, lng)
        return weather
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather API error: {str(e)}")


@app.get("/traffic-check")
async def traffic_endpoint(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_m: int = Query(2000, description="Search radius in meters"),
):
    """Check for road incidents near coordinates."""
    try:
        traffic = await check_traffic(lat, lng, radius_m)
        return traffic
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Traffic API error: {str(e)}")


@app.get("/geocode/autocomplete")
async def geocode_autocomplete_endpoint(
    q: str = Query(..., description="Search query"),
    limit: int = Query(5, description="Max results"),
):
    """Geocode autocomplete using Nominatim."""
    try:
        results = await geocode_autocomplete(q, limit)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocode error: {str(e)}")


@app.get("/dashboard/stats")
async def dashboard_stats():
    """Get dashboard statistics."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    # Active shipments
    active = sb.table("shipments").select("id", count="exact").in_(
        "status", ["active", "pending"]
    ).execute()

    # Offline drivers
    offline = sb.table("shipments").select("id", count="exact").eq(
        "status", "offline"
    ).execute()

    # Alerts today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()
    alerts_today = sb.table("alerts").select("id", count="exact").gte(
        "created_at", today_start
    ).execute()

    # All shipments for on-time rate
    all_shipments = sb.table("shipments").select("id,status,estimated_arrival").not_.eq(
        "status", "pending"
    ).execute()

    total = len(all_shipments.data) if all_shipments.data else 0
    on_time = 0
    if all_shipments.data:
        for s in all_shipments.data:
            if s["status"] == "delivered":
                on_time += 1
            elif s["status"] in ("active",) and s.get("estimated_arrival"):
                eta = datetime.fromisoformat(s["estimated_arrival"].replace("Z", "+00:00"))
                if eta > datetime.now(timezone.utc):
                    on_time += 1

    on_time_rate = round((on_time / total * 100), 1) if total > 0 else 100.0

    return {
        "active_shipments": active.count or 0,
        "offline_drivers": offline.count or 0,
        "alerts_today": alerts_today.count or 0,
        "on_time_rate": on_time_rate,
    }


@app.get("/dashboard/shipments")
async def dashboard_shipments():
    """Get all shipments for dashboard table."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    result = sb.table("shipments").select("*").order("created_at", desc=True).execute()
    shipments = result.data or []

    # Enrich with delay risk
    enriched = []
    for s in shipments:
        delay_risk = "LOW"
        if s.get("estimated_arrival") and s["status"] in ("active", "offline"):
            eta = datetime.fromisoformat(s["estimated_arrival"].replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            if s["status"] == "offline":
                delay_risk = "MEDIUM"
            if eta < now:
                delay_risk = "HIGH"
            elif eta < now + timedelta(hours=1):
                delay_risk = "MEDIUM"

        enriched.append({**s, "delay_risk": delay_risk})

    return {"shipments": enriched}


@app.get("/dashboard/alerts")
async def dashboard_alerts(
    severity: str = Query(None, description="Filter by severity: info, warning, critical"),
):
    """Get all recent alerts across all shipments."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    query = sb.table("alerts").select("*, shipments(tracking_id)").order(
        "created_at", desc=True
    ).limit(50)

    if severity:
        query = query.eq("severity", severity)

    result = query.execute()
    return {"alerts": result.data or []}


@app.get("/shipment-by-token/{share_token}")
async def get_shipment_by_token(share_token: str):
    """Get shipment details by share token (for driver page)."""
    if not sb:
        raise HTTPException(status_code=500, detail="Database not configured")

    session = sb.table("tracking_sessions").select("*").eq("share_token", share_token).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Invalid share token")

    session_data = session.data[0]
    shipment = sb.table("shipments").select("*").eq("id", session_data["shipment_id"]).execute()
    if not shipment.data:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return {
        "shipment": shipment.data[0],
        "session": session_data,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
