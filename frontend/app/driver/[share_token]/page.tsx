"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface ShipmentInfo {
  tracking_id: string;
  origin: string;
  destination: string;
  driver_phone: string;
}

interface SessionInfo {
  active: boolean;
  share_token: string;
  shipment_id: string;
}

/** A buffered GPS ping waiting to be sent */
interface BufferedPing {
  lat: number;
  lng: number;
  speed_kmh: number;
  heading: number;
  timestamp: number; // ms epoch
  networkStatus: "online" | "offline";
}

const DB_NAME = "astra_tracking";
const DB_STORE = "ping_buffer";
const DB_VERSION = 1;

/** Open IndexedDB for ping buffering */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Save a ping to local buffer */
async function bufferPing(ping: BufferedPing) {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).add(ping);
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("Failed to buffer ping:", e);
  }
}

/** Read and clear all buffered pings */
async function drainBuffer(): Promise<BufferedPing[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);

    const all: BufferedPing[] = await new Promise((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });

    // Clear all after reading
    store.clear();
    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
    db.close();
    return all;
  } catch {
    return [];
  }
}

export default function DriverTrackingPage() {
  const params = useParams();
  const shareToken = params.share_token as string;

  const [shipment, setShipment] = useState<ShipmentInfo | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [tracking, setTracking] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "requesting" | "active" | "reconnecting" | "stopped" | "error" | "background" | "offline"
  >("idle");
  const [error, setError] = useState("");
  const [pingCount, setPingCount] = useState(0);
  const [bufferedCount, setBufferedCount] = useState(0);
  const [networkOnline, setNetworkOnline] = useState(true);

  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<{
    lat: number;
    lng: number;
    time: number;
  } | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const currentPosition = useRef<{
    lat: number;
    lng: number;
    speed: number;
    heading: number;
  } | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);

  // Load shipment info
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{
          shipment: ShipmentInfo;
          session: SessionInfo;
        }>(`/shipment-by-token/${shareToken}`);
        setShipment(data.shipment);
        setSession(data.session);
        if (!data.session.active) {
          setStopped(true);
          setStatus("stopped");
        }
      } catch {
        setError("Invalid or expired tracking link.");
      }
    })();
  }, [shareToken]);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setNetworkOnline(true);
      if (tracking) flushBuffer();
    };
    const handleOffline = () => {
      setNetworkOnline(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setNetworkOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [tracking]);

  // Calculate speed & heading from two positions
  const calcSpeedAndHeading = useCallback(
    (
      lat: number,
      lng: number
    ): { speed: number; heading: number } => {
      if (!lastPosition.current) {
        lastPosition.current = { lat, lng, time: Date.now() };
        return { speed: 0, heading: 0 };
      }

      const prev = lastPosition.current;
      const timeDiffSec = (Date.now() - prev.time) / 1000;
      if (timeDiffSec < 1) return { speed: 0, heading: 0 };

      // Haversine distance
      const R = 6371;
      const dLat = ((lat - prev.lat) * Math.PI) / 180;
      const dLng = ((lng - prev.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((prev.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c; // km

      const speed = (dist / timeDiffSec) * 3600; // km/h

      // Bearing
      const y =
        Math.sin(((lng - prev.lng) * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180);
      const x =
        Math.cos((prev.lat * Math.PI) / 180) *
          Math.sin((lat * Math.PI) / 180) -
        Math.sin((prev.lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.cos(((lng - prev.lng) * Math.PI) / 180);
      const heading =
        ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

      lastPosition.current = { lat, lng, time: Date.now() };
      return {
        speed: Math.round(speed * 10) / 10,
        heading: Math.round(heading),
      };
    },
    []
  );

  /** Request Screen Wake Lock to keep tracking alive in background */
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (
          navigator as Navigator & {
            wakeLock: {
              request: (
                type: string
              ) => Promise<WakeLockSentinel>;
            };
          }
        ).wakeLock.request("screen");
        console.log("[WakeLock] Acquired");
      }
    } catch (e) {
      console.warn("[WakeLock] Failed:", e);
    }
  }

  function releaseWakeLock() {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log("[WakeLock] Released");
    }
  }

  /** Flush buffered pings to server via socket */
  async function flushBuffer() {
    const buffered = await drainBuffer();
    if (buffered.length === 0) return;

    const socket = getSocket();
    if (!socket.connected || !shipment) return;

    console.log(
      `[Buffer] Flushing ${buffered.length} buffered pings`
    );

    for (const ping of buffered) {
      socket.emit("driver:ping", {
        tracking_id: shipment.tracking_id,
        share_token: shareToken,
        lat: ping.lat,
        lng: ping.lng,
        speed_kmh: ping.speed_kmh,
        heading: ping.heading,
        network_status: ping.networkStatus,
        buffered_at: new Date(ping.timestamp).toISOString(),
      });
    }

    setBufferedCount(0);
    setPingCount((p) => p + buffered.length);
  }

  function startTracking() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    if (!session || !shipment) return;

    setTracking(true);
    setStatus("active");

    // Request wake lock for background tracking
    requestWakeLock();

    const socket = getSocket();
    socket.connect();

    // Handle socket events
    socket.on("tracking:stopped", () => {
      stopTracking();
    });

    socket.on("disconnect", () => {
      if (tracking && !stopped) {
        setStatus("reconnecting");
        reconnectAttempts.current = 0;
        attemptReconnect();
      }
    });

    socket.on("connect", () => {
      if (
        status === "reconnecting" ||
        status === "background"
      ) {
        setStatus("active");
        reconnectAttempts.current = 0;
        flushBuffer();
      }
    });

    // Handle visibility change for background tracking
    const handleVisibility = () => {
      if (document.hidden) {
        setStatus("background");
        requestWakeLock();
      } else {
        if (tracking && !stopped) {
          setStatus("active");
          requestWakeLock();
          flushBuffer();
        }
      }
    };
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );
    visibilityHandlerRef.current = handleVisibility;

    // Watch position with high accuracy
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const { speed, heading } = calcSpeedAndHeading(
          latitude,
          longitude
        );
        currentPosition.current = {
          lat: latitude,
          lng: longitude,
          speed,
          heading,
        };
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Send pings every 10 seconds — buffer if offline/background
    pingInterval.current = setInterval(async () => {
      if (!currentPosition.current) return;
      const pos = currentPosition.current;
      const isOnline = navigator.onLine;

      const pingData: BufferedPing = {
        lat: pos.lat,
        lng: pos.lng,
        speed_kmh: pos.speed,
        heading: pos.heading,
        timestamp: Date.now(),
        networkStatus: isOnline ? "online" : "offline",
      };

      if (isOnline && socket.connected) {
        socket.emit("driver:ping", {
          tracking_id: shipment.tracking_id,
          share_token: shareToken,
          lat: pos.lat,
          lng: pos.lng,
          speed_kmh: pos.speed,
          heading: pos.heading,
          network_status: isOnline ? "online" : "offline",
        });
        setPingCount((p) => p + 1);
      } else {
        await bufferPing(pingData);
        setBufferedCount((c) => c + 1);
      }
    }, 10000);
  }

  function attemptReconnect() {
    const maxAttempts = 10;
    const interval = setInterval(() => {
      reconnectAttempts.current += 1;
      const socket = getSocket();

      if (socket.connected) {
        clearInterval(interval);
        setStatus("active");
        flushBuffer();
        return;
      }

      if (reconnectAttempts.current >= maxAttempts) {
        clearInterval(interval);
        setStatus("error");
        setError(
          "Could not reconnect. Please refresh the page."
        );
        return;
      }

      socket.connect();
    }, 15000);
  }

  async function stopTracking() {
    setTracking(false);
    setStopped(true);
    setStatus("stopped");

    // Release wake lock
    releaseWakeLock();

    // Remove visibility listener
    if (visibilityHandlerRef.current) {
      document.removeEventListener(
        "visibilitychange",
        visibilityHandlerRef.current
      );
      visibilityHandlerRef.current = null;
    }

    // Flush any remaining buffered pings before stopping
    await flushBuffer();

    // Stop watching position
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    // Stop ping interval
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }

    // Disconnect socket
    disconnectSocket();

    // Call API to stop tracking
    if (shipment) {
      try {
        await apiPost(
          `/shipment/${shipment.tracking_id}/stop-tracking`
        );
      } catch {
        // Best effort
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current !== null)
        navigator.geolocation.clearWatch(watchId.current);
      if (pingInterval.current)
        clearInterval(pingInterval.current);
      releaseWakeLock();
      if (visibilityHandlerRef.current) {
        document.removeEventListener(
          "visibilitychange",
          visibilityHandlerRef.current
        );
      }
      disconnectSocket();
    };
  }, []);

  if (error && !shipment) {
    return (
      <div className="track-container">
        <div className="track-header">
          <h1>Astra Flow</h1>
          <p className="subtitle">Tracking Error</p>
        </div>
        <div className="track-status" style={{ color: "var(--red)" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!shipment || !session) {
    return (
      <div className="track-container">
        <div className="loading-state">Loading…</div>
      </div>
    );
  }

  return (
    <div className="track-container">
      <div className="track-header">
        <h1>Astra Flow</h1>
        <p className="subtitle">Driver Live Tracking</p>
      </div>

      <div className="track-info">
        <div className="route">
          <span>{shipment.origin.split(",")[0]}</span>
          <span className="route-arrow">→</span>
          <span>{shipment.destination.split(",")[0]}</span>
        </div>
        <div className="tracking-id">ID: {shipment.tracking_id}</div>
      </div>

      {/* STATE BANNERS */}
      <div style={{ marginTop: "1rem" }}>
        {status === "idle" && (
          <div style={{ padding: "12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-card)", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Tap to begin sharing your GPS location</div>
            <div>GPS Status: Not started</div>
          </div>
        )}

        {status === "requesting" && (
          <div style={{ padding: "16px", borderRadius: "8px", background: "var(--bg-card)", textAlign: "center", color: "var(--text)" }}>
            <div className="spinner" style={{ display: "inline-block", marginRight: "8px" }} />
            Requesting GPS permission...
          </div>
        )}

        {status === "active" && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(45, 212, 191, 0.1)", border: "1px solid var(--cyan, #2DD4BF)", textAlign: "center" }}>
            <div style={{ color: "var(--cyan, #2DD4BF)", fontWeight: "bold", fontSize: "16px", animation: "pulse 2s infinite" }}>
              ✅ TRACKING ACTIVE
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-muted)" }}>
              GPS signal acquired — location is being shared
            </div>
          </div>
        )}

        {(status === "offline" || status === "background") && !networkOnline && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--yellow)", textAlign: "center" }}>
            <div style={{ color: "var(--yellow)", fontWeight: "bold", fontSize: "16px" }}>
              ⚠️ OFFLINE — Buffering
            </div>
            <div style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-muted)" }}>
              {bufferedCount} pings buffered, will sync when reconnected
            </div>
          </div>
        )}

        {status === "reconnecting" && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--yellow)", textAlign: "center" }}>
            <div style={{ color: "var(--yellow)", fontWeight: "bold", fontSize: "16px" }}>
              🔄 Reconnecting... Attempt {reconnectAttempts.current}
            </div>
          </div>
        )}

        {status === "stopped" && (
          <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>
            Tracking stopped. Your location is no longer shared.
          </div>
        )}
      </div>

      {tracking && currentPosition.current && (
        <div style={{ marginTop: "1rem", padding: "16px", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><span style={{ color: "var(--text-muted)" }}>Lat:</span> {currentPosition.current.lat.toFixed(4)}</div>
          <div><span style={{ color: "var(--text-muted)" }}>Lng:</span> {currentPosition.current.lng.toFixed(4)}</div>
          <div><span style={{ color: "var(--text-muted)" }}>Speed:</span> {currentPosition.current.speed} km/h</div>
          <div>
            <span style={{ color: "var(--text-muted)" }}>Heading:</span> {currentPosition.current.heading}°
          </div>
          <div><span style={{ color: "var(--text-muted)" }}>Pings:</span> {pingCount}</div>
          <div><span style={{ color: "var(--text-muted)" }}>Buffered:</span> {bufferedCount}</div>
        </div>
      )}

      {/* Controls */}
      {!stopped && (
        <div className="track-controls" style={{ marginTop: "1.5rem" }}>
          {(status === "idle" || status === "error") && (
            <button
              className="btn btn-success"
              onClick={() => {
                setStatus("requesting");
                startTracking();
              }}
              style={{ width: "100%", padding: "16px", fontSize: "18px", fontWeight: "bold" }}
            >
              ▶ Start Tracking
            </button>
          )}

          {tracking && (
            <button
              className="btn btn-danger"
              onClick={stopTracking}
              style={{ width: "100%", padding: "16px", fontSize: "18px", fontWeight: "bold" }}
            >
              ■ Stop Tracking
            </button>
          )}
        </div>
      )}

      {error && status !== "error" && (
        <p style={{ fontSize: "12px", color: "var(--red)", textAlign: "center", marginTop: "16px" }}>
          {error}
        </p>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .spinner {
          border: 2px solid rgba(255,255,255,0.2);
          border-top: 2px solid var(--text);
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
