"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiGet, apiPost } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Shipment {
  id: string;
  tracking_id: string;
  driver_name: string;
  driver_phone: string;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  status: string;
  total_distance_km: number;
  estimated_arrival: string;
  started_at: string;
  created_at: string;
}

interface Segment {
  id: string;
  segment_index: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  avg_speed_kmh: number | null;
  entered_at: string | null;
  exited_at: string | null;
}

interface LocationPing {
  lat: number;
  lng: number;
  speed_kmh: number;
  heading: number;
  is_predicted: boolean;
  recorded_at: string;
  network_status?: "online" | "offline";
}

interface AlertItem {
  id: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

interface Weather {
  description: string;
  wind_kmh: number;
  precipitation_mm: number;
  rain_chance_next_2hr: number;
  weather_code: number;
  is_severe: boolean;
  fetchTime?: string;
}

interface ShipmentResponse {
  shipment: Shipment;
  last_location: LocationPing | null;
  segments: Segment[];
  route_geometry: number[][] | null;
  location_history: LocationPing[];
}

export default function TrackingPage() {
  const params = useParams();
  const trackingId = params.tracking_id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<number[][] | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [lastPing, setLastPing] = useState<LocationPing | null>(null);
  const [predictionTrail, setPredictionTrail] = useState<LocationPing[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [now, setNow] = useState(new Date());
  const [locationHistory, setLocationHistory] = useState<LocationPing[]>([]);
  const [banner, setBanner] = useState<{
    type: "offline" | "online";
    time: string;
  } | null>(null);
  const prevStatus = useRef<string>("");

  const loadData = useCallback(async () => {
    try {
      const data = await apiGet<ShipmentResponse>(
        `/shipment/${trackingId}`
      );

      setShipment(data.shipment);
      setSegments(data.segments);
      setRouteGeometry(data.route_geometry);
      if (data.last_location) setLastPing(data.last_location);
      if (data.location_history) setLocationHistory(data.location_history);

      // Load alerts
      const alertsData = await apiGet<{ alerts: AlertItem[] }>(
        `/shipment/${trackingId}/alerts`
      );
      setAlerts(alertsData.alerts);

      // Detect status transition for banner
      const newStatus = data.shipment.status;
      if (prevStatus.current === "offline" && newStatus === "active") {
        setBanner({
          type: "online",
          time: new Date().toLocaleTimeString(),
        });
        setTimeout(() => setBanner(null), 8000);
      } else if (
        prevStatus.current !== "offline" &&
        newStatus === "offline"
      ) {
        setBanner({
          type: "offline",
          time: new Date().toLocaleTimeString(),
        });
      } else if (newStatus !== "offline" && banner?.type === "offline") {
        setBanner(null);
      }
      prevStatus.current = newStatus;

      // Load weather for last known position
      const lat = data.last_location?.lat || data.shipment.origin_lat;
      const lng = data.last_location?.lng || data.shipment.origin_lng;
      try {
        const w = await apiGet<Weather>(
          `/weather?lat=${lat}&lng=${lng}`
        );
        setWeather({ ...w, fetchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      } catch {
        /* weather is optional */
      }
    } catch (err) {
      console.error("Failed to load shipment:", err);
    }
  }, [trackingId]);

  useEffect(() => {
    loadData();

    // Clock
    const clock = setInterval(() => setNow(new Date()), 1000);

    // Socket.IO subscription
    const socket = getSocket();
    socket.connect();
    socket.emit("dashboard:subscribe", { tracking_id: trackingId });
    socket.on("location:update", (data: LocationPing) => {
      if (data.is_predicted) {
        setPredictionTrail((prev) => [...prev, data]);
      } else {
        setLastPing(data);
        setLocationHistory((prev) => [...prev, data]);
      }
      loadData();
    });

    // Supabase Realtime
    const pingChannel = supabase
      .channel(`pings-${trackingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "location_pings",
        },
        (payload) => {
          const ping = payload.new as LocationPing & {
            shipment_id: string;
          };
          if (ping.is_predicted) {
            setPredictionTrail((prev) => [...prev, ping]);
          } else {
            setLastPing(ping);
          }
        }
      )
      .subscribe();

    const alertChannel = supabase
      .channel(`alerts-${trackingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          setAlerts((prev) => [payload.new as AlertItem, ...prev]);
        }
      )
      .subscribe();

    // Refresh weather every 5 min
    const weatherInterval = setInterval(async () => {
      if (lastPing) {
        try {
          const w = await apiGet<Weather>(
            `/weather?lat=${lastPing.lat}&lng=${lastPing.lng}`
          );
          setWeather({ ...w, fetchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        } catch {
          /* optional */
        }
      }
    }, 300000);

    return () => {
      clearInterval(clock);
      clearInterval(weatherInterval);
      socket.off("location:update");
      socket.disconnect();
      supabase.removeChannel(pingChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [trackingId, loadData]);

  async function handleStopTracking() {
    if (!shipment) return;
    try {
      await apiPost(`/shipment/${shipment.tracking_id}/stop-tracking`);
      loadData();
    } catch (err) {
      console.error("Failed to stop tracking:", err);
    }
  }

  function formatTimeAgo(ts: string) {
    if (!ts) return "—";
    const secs = (now.getTime() - new Date(ts).getTime()) / 1000;
    if (secs < 60) return `${Math.floor(secs)}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  }

  function getWeatherEmoji(code: number) {
    if (code === 0 || code === 1) return "☀️";
    if (code === 2 || code === 3) return "☁️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "🌤️";
  }

  function getSegmentStatus(seg: Segment): string {
    if (seg.exited_at) return "completed";
    if (seg.entered_at) return "in-progress";
    return "not-reached";
  }

  function getSegmentStatusLabel(seg: Segment): string {
    if (seg.exited_at) return "Completed";
    if (seg.entered_at) return "In Progress";
    return "Not Reached";
  }

  const currentSegmentIdx = segments.findIndex(
    (s) => s.entered_at && !s.exited_at
  );

  if (!shipment) {
    return <div className="loading-state">Loading shipment…</div>;
  }

  const isOnline = shipment.status === "active";
  const isOffline = shipment.status === "offline";

  return (
    <>
      {/* Status Banner */}
      {banner && (
        <div className={`status-banner ${banner.type}`}>
          {banner.type === "offline"
            ? `⚠ Driver offline since ${banner.time}. Location is being predicted.`
            : `✓ Driver reconnected at ${banner.time}.`}
        </div>
      )}

      <div
        className="shipment-layout"
        style={{ marginTop: banner ? "36px" : 0 }}
      >
        {/* Left Panel */}
        <div className="shipment-panel">
          {/* Shipment Info */}
          <div className="shipment-panel-section">
            <h3>Shipment Info</h3>
            <div className="info-row">
              <span className="label">Tracking ID</span>
              <span className="value">{shipment.tracking_id}</span>
            </div>
            <div className="info-row">
              <span className="label">Driver</span>
              <span className="value">
                {shipment.driver_name || "—"} ·{" "}
                {shipment.driver_phone}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Route</span>
              <span
                style={{
                  fontSize: "12px",
                  textAlign: "right",
                  maxWidth: "180px",
                }}
              >
                {shipment.origin.split(",")[0]} →{" "}
                {shipment.destination.split(",")[0]}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Status</span>
              <span className={`badge badge-${shipment.status}`}>
                {shipment.status}
              </span>
            </div>
            <div className="info-row">
              <span className="label">ETA</span>
              <span className="value">
                {shipment.estimated_arrival
                  ? new Date(
                      shipment.estimated_arrival
                    ).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Last Updated</span>
              <span className="value">
                {lastPing
                  ? formatTimeAgo(lastPing.recorded_at)
                  : "—"}
              </span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="shipment-panel-section">
            <div className="status-indicator">
              <span
                className={`status-dot ${
                  isOnline ? "online" : "offline"
                }`}
              />
              {isOnline && "Online — Live tracking active"}
              {isOffline && "Offline — Predicting location"}
              {!isOnline && !isOffline && shipment.status}
            </div>
            {shipment.status !== "stopped" &&
              shipment.status !== "delivered" && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleStopTracking}
                  style={{ marginTop: "10px" }}
                >
                  Stop Tracking
                </button>
              )}
          </div>

          {/* Route Segments */}
          <div
            className="shipment-panel-section"
            style={{ flex: 1, overflow: "auto" }}
          >
            <h3>Route Segments</h3>
            <table
              className="data-table"
              style={{ fontSize: "12px" }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "6px 8px" }}>Seg</th>
                  <th style={{ padding: "6px 8px" }}>Dist</th>
                  <th style={{ padding: "6px 8px" }}>Speed</th>
                  <th style={{ padding: "6px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg) => (
                  <tr
                    key={seg.id}
                    className={
                      seg.segment_index === currentSegmentIdx
                        ? "segment-row current"
                        : ""
                    }
                  >
                    <td
                      style={{
                        padding: "6px 8px",
                        fontFamily: "var(--font-data)",
                      }}
                    >
                      {seg.segment_index + 1}
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        fontFamily: "var(--font-data)",
                      }}
                    >
                      {seg.distance_km} km
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        fontFamily: "var(--font-data)",
                      }}
                    >
                      {seg.avg_speed_kmh
                        ? `${seg.avg_speed_kmh} km/h`
                        : "—"}
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <span
                        className={`segment-status ${getSegmentStatus(
                          seg
                        )}`}
                      >
                        {getSegmentStatusLabel(seg)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts Feed */}
          <div
            className="shipment-panel-section"
            style={{ maxHeight: "250px", overflow: "auto" }}
          >
            <h3>Alerts</h3>
            {alerts.length === 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                No alerts
              </p>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`alert-item ${
                  !a.resolved ? "alert-unresolved" : ""
                }`}
              >
                <div className={`alert-dot ${a.severity}`} />
                <div className="alert-content">
                  <div
                    className="alert-message"
                    style={{ fontSize: "12px" }}
                  >
                    {a.message}
                  </div>
                  <div className="alert-meta">
                    {formatTimeAgo(a.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="shipment-map">
          <TrackingMap
            shipment={shipment}
            routeGeometry={routeGeometry}
            segments={segments}
            lastPing={lastPing}
            predictionTrail={predictionTrail}
            locationHistory={locationHistory}
            isOnline={isOnline}
          />

          {/* Weather Widget */}
          {weather && (
            <div className="weather-widget" style={{ position: "absolute", bottom: "20px", left: "20px", zIndex: 1000, background: "rgba(11, 15, 25, 0.9)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", backdropFilter: "blur(8px)", minWidth: "250px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "32px", lineHeight: 1 }}>
                    {getWeatherEmoji(weather.weather_code)}
                  </span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "16px", color: "var(--text)" }}>{weather.description}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Weather as of {weather.fetchTime}</div>
                  </div>
                </div>
              </div>
              
              {weather.is_severe && (
                <div style={{ display: "inline-block", background: "rgba(248, 81, 73, 0.15)", border: "1px solid #f85149", color: "#f85149", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", marginBottom: "12px", animation: "pulse 2s infinite", letterSpacing: "0.5px" }}>
                  ⚠ SEVERE WEATHER WARNING
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                <div><span style={{ color: "var(--text)" }}>Wind:</span> {weather.wind_kmh} km/h</div>
                <div><span style={{ color: "var(--text)" }}>Precip:</span> {weather.precipitation_mm} mm</div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--text)" }}>Rain chance (next 2h):</span> {weather.rain_chance_next_2hr}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
