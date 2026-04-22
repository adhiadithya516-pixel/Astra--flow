"""
Geocoding via Nominatim (OSM) and routing via OSRM.
Respects Nominatim 1 req/sec rate limit.
"""

import asyncio
import math
import time
from typing import Optional

import httpx

# Rate limiter: 1 request per second for Nominatim
_last_nominatim_request = 0.0
_nominatim_lock = asyncio.Lock()

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
OSRM_URL = "https://router.project-osrm.org"
USER_AGENT = "AstraFlow/1.0 (logistics-tracking)"


async def _rate_limit_nominatim():
    """Enforce 1 request/second for Nominatim."""
    global _last_nominatim_request
    async with _nominatim_lock:
        now = time.time()
        elapsed = now - _last_nominatim_request
        if elapsed < 1.0:
            await asyncio.sleep(1.0 - elapsed)
        _last_nominatim_request = time.time()


async def geocode(query: str) -> Optional[dict]:
    """
    Geocode a place name to lat/lng using Nominatim.
    Returns: { lat, lng, display_name } or None
    """
    await _rate_limit_nominatim()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NOMINATIM_URL}/search",
            params={
                "q": query,
                "format": "json",
                "limit": 1,
                "addressdetails": 1,
            },
            headers={"User-Agent": USER_AGENT},
            timeout=10.0,
        )
        resp.raise_for_status()
        results = resp.json()
        if not results:
            return None
        r = results[0]
        return {
            "lat": float(r["lat"]),
            "lng": float(r["lon"]),
            "display_name": r["display_name"],
        }


async def geocode_autocomplete(query: str, limit: int = 5) -> list[dict]:
    """
    Autocomplete search using Nominatim.
    Returns list of { lat, lng, display_name }
    """
    if len(query) < 3:
        return []
    await _rate_limit_nominatim()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{NOMINATIM_URL}/search",
            params={
                "q": query,
                "format": "json",
                "limit": limit,
                "addressdetails": 1,
            },
            headers={"User-Agent": USER_AGENT},
            timeout=10.0,
        )
        resp.raise_for_status()
        results = resp.json()
        return [
            {
                "lat": float(r["lat"]),
                "lng": float(r["lon"]),
                "display_name": r["display_name"],
            }
            for r in results
        ]


async def get_route(
    origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float
) -> Optional[dict]:
    """
    Get route from OSRM between two points.
    Returns: { distance_km, duration_sec, geometry_coords: [[lng, lat], ...] }
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{OSRM_URL}/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}",
            params={
                "overview": "full",
                "geometries": "geojson",
                "steps": "false",
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            return None
        route = data["routes"][0]
        return {
            "distance_km": route["distance"] / 1000.0,
            "duration_sec": route["duration"],
            "geometry_coords": route["geometry"]["coordinates"],  # [[lng, lat], ...]
        }


def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two lat/lng points."""
    R = 6371.0
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def split_route_into_segments(
    geometry_coords: list[list[float]], segment_length_km: float = 30.0
) -> list[dict]:
    """
    Split a route geometry into segments of approximately segment_length_km.
    geometry_coords: [[lng, lat], ...] from OSRM
    Returns: list of { segment_index, start_lat, start_lng, end_lat, end_lng, distance_km }
    """
    if len(geometry_coords) < 2:
        return []

    segments = []
    segment_index = 0
    accumulated_km = 0.0
    segment_start = geometry_coords[0]  # [lng, lat]

    for i in range(1, len(geometry_coords)):
        prev = geometry_coords[i - 1]
        curr = geometry_coords[i]
        step_km = _haversine_distance(prev[1], prev[0], curr[1], curr[0])
        accumulated_km += step_km

        if accumulated_km >= segment_length_km:
            segments.append({
                "segment_index": segment_index,
                "start_lat": segment_start[1],
                "start_lng": segment_start[0],
                "end_lat": curr[1],
                "end_lng": curr[0],
                "distance_km": round(accumulated_km, 2),
            })
            segment_index += 1
            accumulated_km = 0.0
            segment_start = curr

    # Final partial segment
    if accumulated_km > 0:
        last = geometry_coords[-1]
        segments.append({
            "segment_index": segment_index,
            "start_lat": segment_start[1],
            "start_lng": segment_start[0],
            "end_lat": last[1],
            "end_lng": last[0],
            "distance_km": round(accumulated_km, 2),
        })

    return segments


def find_segment_for_point(
    lat: float, lng: float, segments: list[dict]
) -> int:
    """
    Find which segment index a point belongs to.
    Uses closest segment start/end midpoint.
    """
    if not segments:
        return 0

    min_dist = float("inf")
    best_idx = 0

    for seg in segments:
        mid_lat = (seg["start_lat"] + seg["end_lat"]) / 2
        mid_lng = (seg["start_lng"] + seg["end_lng"]) / 2
        dist = _haversine_distance(lat, lng, mid_lat, mid_lng)
        if dist < min_dist:
            min_dist = dist
            best_idx = seg["segment_index"]

    return best_idx
