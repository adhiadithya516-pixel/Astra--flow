"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Shipment {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  origin: string;
  destination: string;
}

interface Segment {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  segment_index: number;
}

interface LocationPing {
  lat: number;
  lng: number;
  is_predicted: boolean;
  recorded_at: string;
  network_status?: "online" | "offline";
}

interface MapViewProps {
  shipment: Shipment;
  routeGeometry: number[][] | null; // [[lng, lat], ...]
  segments: Segment[];
  lastPing: LocationPing | null;
  predictionTrail: LocationPing[];
  locationHistory: LocationPing[];
  isOnline: boolean;
}

/**
 * Calculate perpendicular distance from a point to the nearest point on a polyline.
 * Returns distance in km.
 */
function distanceToPolyline(
  lat: number,
  lng: number,
  polyline: [number, number][] // [[lat, lng], ...]
): number {
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = distToSegment(lat, lng, polyline[i], polyline[i + 1]);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/** Distance from point P to line segment AB (all lat/lng), returns km */
function distToSegment(
  pLat: number,
  pLng: number,
  a: [number, number],
  b: [number, number]
): number {
  const R = 6371;
  const pLatR = (pLat * Math.PI) / 180;
  const pLngR = (pLng * Math.PI) / 180;
  const aLatR = (a[0] * Math.PI) / 180;
  const aLngR = (a[1] * Math.PI) / 180;
  const bLatR = (b[0] * Math.PI) / 180;
  const bLngR = (b[1] * Math.PI) / 180;

  const dx = (bLngR - aLngR) * Math.cos((aLatR + bLatR) / 2);
  const dy = bLatR - aLatR;
  const px = (pLngR - aLngR) * Math.cos((aLatR + pLatR) / 2);
  const py = pLatR - aLatR;

  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return haversine(pLat, pLng, a[0], a[1]);
  }

  let t = (px * dx + py * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projLat = a[0] + t * (b[0] - a[0]);
  const projLng = a[1] + t * (b[1] - a[1]);

  return haversine(pLat, pLng, projLat, projLng);
}

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Deviation threshold in km — anything beyond this is considered a deviated route */
const DEVIATION_THRESHOLD_KM = 0.5; // 500 meters

export default function MapView({
  shipment,
  routeGeometry,
  segments,
  lastPing,
  predictionTrail,
  locationHistory,
  isOnline,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const predictionMarkersRef = useRef<L.CircleMarker[]>([]);
  const drivenLineRef = useRef<L.Polyline | null>(null);
  const deviationLineRef = useRef<L.Polyline | null>(null);
  const networkDownMarkersRef = useRef<L.CircleMarker[]>([]);
  const networkGapLinesRef = useRef<L.Polyline[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-compute route polyline in [lat, lng] format for deviation detection
  const routeLatLngs = useMemo<[number, number][]>(() => {
    if (!routeGeometry) return [];
    return routeGeometry.map(
      (coord) => [coord[1], coord[0]] as [number, number]
    );
  }, [routeGeometry]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [shipment.origin_lat, shipment.origin_lng],
      zoom: 7,
      zoomControl: true,
    });

    // OpenStreetMap tiles
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeGeometry) return;

    // Route geometry from OSRM is [[lng, lat], ...]
    const routePoints = routeGeometry.map(
      ([lng, lat]) => [lat, lng] as L.LatLngTuple
    );

    const polyline = L.polyline(routePoints, {
      color: "#8b949e",
      weight: 3,
      dashArray: "8, 6",
      opacity: 0.7,
    }).addTo(map);

    // Fit bounds to include origin, destination and current pos
    const originPoint = [shipment.origin_lat, shipment.origin_lng] as L.LatLngTuple;
    const destPoint = [shipment.dest_lat, shipment.dest_lng] as L.LatLngTuple;
    const currentPoint = lastPing ? [lastPing.lat, lastPing.lng] as L.LatLngTuple : originPoint;
    map.fitBounds([originPoint, destPoint, currentPoint], { padding: [50, 50] });

    // Origin marker (A)
    L.circleMarker([shipment.origin_lat, shipment.origin_lng], {
      radius: 8,
      fillColor: "#e6edf3",
      fillOpacity: 1,
      color: "#21262d",
      weight: 2,
    })
      .bindTooltip("A · Origin", { permanent: false })
      .addTo(map);

    // Destination marker (B)
    L.circleMarker([shipment.dest_lat, shipment.dest_lng], {
      radius: 8,
      fillColor: "#e6edf3",
      fillOpacity: 1,
      color: "#21262d",
      weight: 2,
    })
      .bindTooltip("B · Destination", { permanent: false })
      .addTo(map);

    // Segment boundary markers
    segments.forEach((seg) => {
      L.circleMarker([seg.start_lat, seg.start_lng], {
        radius: 3,
        fillColor: "#8b949e",
        fillOpacity: 0.6,
        color: "transparent",
        weight: 0,
      }).addTo(map);
    });

    return () => {
      map.removeLayer(polyline);
    };
  }, [routeGeometry, segments, shipment]);

  // Update driver marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lastPing) return;

    if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
    }

    const color = isOnline ? "#3fb950" : "#f85149";
    const tooltipText = isOnline
      ? `Last seen: ${new Date(lastPing.recorded_at).toLocaleTimeString()}`
      : "PREDICTED";

    const customIcon = L.divIcon({
      className: "driver-custom-icon",
      html: `<div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        animation: pulseMap 1.5s infinite;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    driverMarkerRef.current = L.marker([lastPing.lat, lastPing.lng], {
      icon: customIcon,
      zIndexOffset: 1000
    })
      .bindTooltip(tooltipText, { permanent: false })
      .addTo(map);

    // Smooth pan to new position
    map.panTo([lastPing.lat, lastPing.lng], { animate: true, duration: 0.5 });
  }, [lastPing, isOnline]);

  // Update actual driven historical path + deviation detection + network-down dots
  useEffect(() => {
    const map = mapRef.current;
    if (!map || locationHistory.length === 0) return;

    // Cleanup old layers
    if (drivenLineRef.current) map.removeLayer(drivenLineRef.current);
    if (deviationLineRef.current) map.removeLayer(deviationLineRef.current);
    networkDownMarkersRef.current.forEach((m) => map.removeLayer(m));
    networkDownMarkersRef.current = [];
    networkGapLinesRef.current.forEach((l) => map.removeLayer(l));
    networkGapLinesRef.current = [];

    // Separate pings into on-route vs deviated
    const realHistory = locationHistory.filter((p) => !p.is_predicted);
    const onRoutePoints: L.LatLngExpression[] = [];
    const deviatedPoints: L.LatLngExpression[] = [];

    // Track consecutive network-offline stretches
    let prevIsNetworkDown = false;

    for (let i = 0; i < realHistory.length; i++) {
      const p = realHistory[i];
      const pos: L.LatLngExpression = [p.lat, p.lng];
      const isNetworkDown = p.network_status === "offline";

      // Check if this point deviates from planned route
      if (routeLatLngs.length > 1) {
        const dist = distanceToPolyline(p.lat, p.lng, routeLatLngs);
        if (dist > DEVIATION_THRESHOLD_KM) {
          deviatedPoints.push(pos);
        }
        onRoutePoints.push(pos);
      } else {
        onRoutePoints.push(pos);
      }

      // Network-down red dots
      if (isNetworkDown) {
        const redDot = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          fillColor: "#f85149",
          fillOpacity: 0.9,
          color: "#ff6b6b",
          weight: 1.5,
        })
          .bindTooltip(
            `⚠ Network offline at ${new Date(p.recorded_at).toLocaleTimeString()}`,
            { permanent: false }
          )
          .addTo(map);
        networkDownMarkersRef.current.push(redDot);
      }

      // Draw red dashed connecting lines between consecutive offline pings
      if (isNetworkDown && prevIsNetworkDown && i > 0) {
        const prev = realHistory[i - 1];
        const gapLine = L.polyline(
          [
            [prev.lat, prev.lng],
            [p.lat, p.lng],
          ],
          {
            color: "#f85149",
            weight: 2,
            dashArray: "4, 4",
            opacity: 0.6,
          }
        ).addTo(map);
        networkGapLinesRef.current.push(gapLine);
      }

      prevIsNetworkDown = isNetworkDown;
    }

    // Draw the actual path taken by the driver in bright cyan/teal
    if (onRoutePoints.length > 0) {
      drivenLineRef.current = L.polyline(onRoutePoints, {
        color: "#2DD4BF", // Teal-400
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
    }

    // Draw deviated segments in grey
    if (deviatedPoints.length > 1) {
      const deviationSegments: L.LatLngExpression[][] = [];
      let currentSegment: L.LatLngExpression[] = [];

      for (let i = 0; i < realHistory.length; i++) {
        const p = realHistory[i];
        if (routeLatLngs.length > 1) {
          const dist = distanceToPolyline(p.lat, p.lng, routeLatLngs);
          if (dist > DEVIATION_THRESHOLD_KM) {
            if (currentSegment.length === 0 && i > 0) {
              currentSegment.push([
                realHistory[i - 1].lat,
                realHistory[i - 1].lng,
              ]);
            }
            currentSegment.push([p.lat, p.lng]);
          } else {
            if (currentSegment.length > 0) {
              currentSegment.push([p.lat, p.lng]);
              deviationSegments.push([...currentSegment]);
              currentSegment = [];
            }
          }
        }
      }
      if (currentSegment.length > 0)
        deviationSegments.push(currentSegment);

      for (const seg of deviationSegments) {
        const line = L.polyline(seg, {
          color: "#6e7681",
          weight: 5,
          opacity: 0.85,
          dashArray: "6, 4",
        })
          .bindTooltip("⤴ Route deviation (alternate path)", {
            permanent: false,
            sticky: true,
          })
          .addTo(map);
        networkGapLinesRef.current.push(line);
      }
    }
  }, [locationHistory, routeLatLngs]);

  // Update prediction trail
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    predictionTrail.forEach((ping, idx) => {
      if (idx < predictionMarkersRef.current.length) return;

      const marker = L.circleMarker([ping.lat, ping.lng], {
        radius: 4,
        fillColor: "#f85149",
        fillOpacity: 0.6,
        color: "#e6edf3",
        weight: 1,
      })
        .bindTooltip("Predicted position", { permanent: false })
        .addTo(map);

      predictionMarkersRef.current.push(marker);
    });
  }, [predictionTrail]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "400px" }}
      />
      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-title">Route Legend</div>
        <div className="legend-item">
          <span
            className="legend-line"
            style={{ backgroundColor: "#2DD4BF" }}
          />
          <span>Actual driven path</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-line"
            style={{
              backgroundColor: "#8b949e",
              backgroundImage:
                "repeating-linear-gradient(90deg, #8b949e 0px, #8b949e 6px, transparent 6px, transparent 12px)",
            }}
          />
          <span>Planned route</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-line"
            style={{ backgroundColor: "#6e7681" }}
          />
          <span>Route deviation</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: "#f85149" }}
          />
          <span>Network offline</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: "#3fb950" }}
          />
          <span>Driver online</span>
        </div>
      </div>
      <style>{`
        @keyframes pulseMap {
          0% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(63, 185, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0); }
        }
      `}</style>
    </>
  );
}
