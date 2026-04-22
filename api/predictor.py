"""
Location Prediction Engine for Astra Flow.
Uses haversine-based projection from last known position, speed, and heading.
This is real physics: distance = speed * time, projected via bearing.
"""

import math


def predict_location(
    last_lat: float,
    last_lng: float,
    last_heading: float,
    avg_speed_kmh: float,
    seconds_offline: float,
) -> dict:
    """
    Predict driver's current location based on last known position,
    heading, speed, and time elapsed.

    Args:
        last_lat: Last known latitude
        last_lng: Last known longitude
        last_heading: Last known heading in degrees (0-360, 0=North)
        avg_speed_kmh: Average speed from recent pings/segments
        seconds_offline: Seconds since last real ping

    Returns:
        {
            predicted_lat: float,
            predicted_lng: float,
            confidence_pct: float (0-100),
            distance_traveled_km: float,
            method: str
        }
    """
    if avg_speed_kmh <= 0 or seconds_offline <= 0:
        return {
            "predicted_lat": last_lat,
            "predicted_lng": last_lng,
            "confidence_pct": 100.0,
            "distance_traveled_km": 0.0,
            "method": "stationary",
        }

    # Calculate distance traveled
    hours_offline = seconds_offline / 3600.0
    distance_km = avg_speed_kmh * hours_offline

    # Cap maximum prediction distance (don't predict beyond 200km)
    distance_km = min(distance_km, 200.0)

    # Convert heading to radians
    heading_rad = math.radians(last_heading)

    # Project new position using flat-earth approximation
    # (accurate enough for distances < 200km)
    lat1_rad = math.radians(last_lat)

    # 1 degree latitude ≈ 111.32 km
    # 1 degree longitude ≈ 111.32 * cos(latitude) km
    delta_lat = (distance_km * math.cos(heading_rad)) / 111.32
    delta_lng = (distance_km * math.sin(heading_rad)) / (111.32 * math.cos(lat1_rad))

    predicted_lat = last_lat + delta_lat
    predicted_lng = last_lng + delta_lng

    # Confidence drops 10% every 10 minutes offline
    minutes_offline = seconds_offline / 60.0
    confidence_pct = max(0.0, 100.0 - (minutes_offline / 10.0) * 10.0)

    return {
        "predicted_lat": round(predicted_lat, 6),
        "predicted_lng": round(predicted_lng, 6),
        "confidence_pct": round(confidence_pct, 1),
        "distance_traveled_km": round(distance_km, 2),
        "method": "haversine_projection",
    }


def calculate_avg_speed(speeds: list[float]) -> float:
    """
    Calculate average speed from a list of speed values.
    Filters out zeros and None values.
    Uses last 5 values for recency.
    """
    valid = [s for s in speeds if s and s > 0]
    if not valid:
        return 0.0
    # Use last 5 for recency weighting
    recent = valid[-5:]
    return sum(recent) / len(recent)


def calculate_bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate bearing (heading) in degrees from point 1 to point 2.
    Returns: 0-360 degrees, 0 = North.
    """
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    dlng_r = math.radians(lng2 - lng1)

    x = math.sin(dlng_r) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlng_r)

    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two lat/lng points using haversine formula."""
    R = 6371.0
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
