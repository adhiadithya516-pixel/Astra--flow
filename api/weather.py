"""
Weather data from Open-Meteo API (free, no key).
Traffic data from Overpass API (OpenStreetMap, free).
"""

import httpx

# WMO Weather interpretation codes
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

# Severe weather codes
SEVERE_CODES = {65, 66, 67, 75, 82, 86, 95, 96, 99}


async def get_weather(lat: float, lng: float) -> dict:
    """
    Get current weather from Open-Meteo.
    Returns: {
        weather_code, description, wind_kmh, precipitation_mm,
        rain_chance_next_2hr, is_severe
    }
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lng,
                "current": "weathercode,windspeed_10m,precipitation",
                "hourly": "precipitation_probability",
                "timezone": "auto",
                "forecast_days": 1,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    weather_code = current.get("weathercode", 0)
    description = WMO_CODES.get(weather_code, "Unknown")
    wind_kmh = current.get("windspeed_10m", 0)
    precipitation = current.get("precipitation", 0)

    # Get rain chance for next 2 hours
    hourly = data.get("hourly", {})
    precip_probs = hourly.get("precipitation_probability", [])
    rain_chance = max(precip_probs[:2]) if len(precip_probs) >= 2 else (precip_probs[0] if precip_probs else 0)

    return {
        "weather_code": weather_code,
        "description": description,
        "wind_kmh": wind_kmh,
        "precipitation_mm": precipitation,
        "rain_chance_next_2hr": rain_chance,
        "is_severe": weather_code in SEVERE_CODES,
    }


async def check_traffic(lat: float, lng: float, radius_m: int = 2000) -> dict:
    """
    Check for road incidents near coordinates using Overpass API.
    Looks for highway=construction, road closures, and traffic incidents.
    Returns: { has_incident, incident_type, description, count }
    """
    # Overpass QL query for road incidents within radius
    overpass_query = f"""
    [out:json][timeout:10];
    (
      way["highway"="construction"](around:{radius_m},{lat},{lng});
      node["barrier"](around:{radius_m},{lat},{lng});
      way["access"="no"]["highway"](around:{radius_m},{lat},{lng});
      node["highway"="traffic_signals"]["traffic_signals"="signal"](around:{radius_m},{lat},{lng});
    );
    out count;
    """

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": overpass_query},
                timeout=15.0,
            )
            resp.raise_for_status()
            data = resp.json()

            elements = data.get("elements", [])
            total_count = 0
            if elements:
                # Count response
                for el in elements:
                    if el.get("type") == "count":
                        total_count = el.get("tags", {}).get("total", 0)
                        if isinstance(total_count, str):
                            total_count = int(total_count)

            has_incident = total_count > 0
            incident_type = "construction" if has_incident else "none"
            description = (
                f"Found {total_count} road incidents within {radius_m}m radius"
                if has_incident
                else "No road incidents detected nearby"
            )

            return {
                "has_incident": has_incident,
                "incident_type": incident_type,
                "description": description,
                "count": total_count,
            }
        except Exception as e:
            return {
                "has_incident": False,
                "incident_type": "error",
                "description": f"Could not check traffic: {str(e)}",
                "count": 0,
            }
