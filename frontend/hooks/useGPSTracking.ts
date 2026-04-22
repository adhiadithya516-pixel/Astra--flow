import { useState, useEffect, useRef } from "react";
import { bufferPing, flushBuffer, BufferedPing } from "../lib/offlineBuffer";

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
}

interface GPSTrackingState {
  position: LocationData | null;
  isOnline: boolean;
  isPredicted: boolean;
  accuracy: number | null;
  error: string | null;
}

/**
 * Custom hook to manage GPS tracking using Browser Geolocation API.
 * Handles interval pings, offline buffering, and network recovery.
 */
export function useGPSTracking(driverId: string, sessionId: string) {
  const [state, setState] = useState<GPSTrackingState>({
    position: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isPredicted: false,
    accuracy: null,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastPingRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Handle online/offline network changes
  useEffect(() => {
    const handleOnline = () => {
      setState((s) => ({ ...s, isOnline: true }));
      syncOfflineData();
    };
    const handleOffline = () => setState((s) => ({ ...s, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Sync offline buffer to backend with exponential backoff
   */
  const syncOfflineData = async () => {
    const offlinePings = await flushBuffer();
    if (offlinePings.length === 0) return;

    try {
      const res = await fetch("/api/gps/bulk-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pings: offlinePings }),
      });

      if (!res.ok) throw new Error("Bulk sync failed");
      retryCountRef.current = 0; // Reset on success
    } catch (err) {
      console.error("Sync failed, re-buffering:", err);
      // Re-buffer the pings if sync failed
      for (const ping of offlinePings) await bufferPing(ping);

      // Exponential backoff retry (2s, 4s, 8s, up to 30s)
      if (retryCountRef.current < 5) {
        retryCountRef.current += 1;
        const delay = Math.min(30000, Math.pow(2, retryCountRef.current) * 1000);
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(syncOfflineData, delay);
      }
    }
  };

  useEffect(() => {
    if (!driverId || !sessionId || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported or missing IDs" }));
      return;
    }

    const success = async (pos: GeolocationPosition) => {
      const now = Date.now();
      const coords = pos.coords;
      const currentPos = {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        speed: coords.speed,
        heading: coords.heading,
      };

      setState((s) => ({
        ...s,
        position: currentPos,
        accuracy: coords.accuracy,
        isPredicted: false, // It's a real confirmed ping
        error: null,
      }));

      // Only ping the backend every 10 seconds to conserve battery/network
      if (now - lastPingRef.current >= 10000) {
        lastPingRef.current = now;
        
        const payload: BufferedPing = {
          driver_id: driverId,
          session_id: sessionId,
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          speed: coords.speed || 0,
          heading: coords.heading || 0,
          timestamp: new Date().toISOString(),
        };

        if (navigator.onLine) {
          try {
            await fetch("/api/gps/ping", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch (err) {
            // Network failed during fetch despite navigator.onLine = true
            await bufferPing(payload);
          }
        } else {
          // Offline: buffer immediately
          await bufferPing(payload);
        }
      }
    };

    const error = (err: GeolocationPositionError) => {
      setState((s) => ({ ...s, error: err.message }));
    };

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [driverId, sessionId]);

  return state;
}
