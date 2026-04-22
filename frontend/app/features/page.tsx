"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";

// Note: Next.js metadata is not supported in "use client" components directly.
// Moved to layout.tsx or similar if SEO is required.

/* ==================================================
 * STRUCTURED FEATURES DATA (WITH INLINE SVGS)
 * ================================================== */
const featuresData = [
  {
    id: "tracking",
    title: "Real-Time GPS Tracking",
    heroIcon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="8" fill="var(--color-primary)"/>
        <circle cx="36" cy="36" r="16" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <circle cx="36" cy="36" r="24" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.3"/>
        <line x1="36" y1="4" x2="36" y2="20" stroke="var(--color-primary)" strokeWidth="2"/>
        <line x1="36" y1="52" x2="36" y2="68" stroke="var(--color-primary)" strokeWidth="2"/>
        <line x1="4" y1="36" x2="20" y2="36" stroke="var(--color-primary)" strokeWidth="2"/>
        <line x1="52" y1="36" x2="68" y2="36" stroke="var(--color-primary)" strokeWidth="2"/>
      </svg>
    ),
    desc: "Every driver, every second. High-precision live location updates utilizing native web APIs and advanced predictive algorithms to ensure you never lose sight of a shipment.",
    cards: [
      {
        title: "Live Location Engine", desc: "Pinpoints every driver instantly, no setup required", badge: "ALWAYS ON", demoType: "live-location",
        icon: (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="4" fill="var(--color-primary)"/>
            <circle cx="14" cy="14" r="8" stroke="var(--color-primary)" strokeWidth="1.2" fill="none" opacity="0.5"/>
            <line x1="14" y1="2" x2="14" y2="8" stroke="var(--color-primary)" strokeWidth="1.5"/>
            <line x1="14" y1="20" x2="14" y2="26" stroke="var(--color-primary)" strokeWidth="1.5"/>
            <line x1="2" y1="14" x2="8" y2="14" stroke="var(--color-primary)" strokeWidth="1.5"/>
            <line x1="20" y1="14" x2="26" y2="14" stroke="var(--color-primary)" strokeWidth="1.5"/>
          </svg>
        )
      },
      {
        title: "Instant Signal Relay", desc: "Location data reaches the dashboard in milliseconds", badge: "LIVE", demoType: "signal-relay",
        icon: (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 14 L22 6" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 8 Q14 2 20 8" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M4 12 Q14 -2 24 12" stroke="var(--color-primary)" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="var(--color-primary)"/>
            <rect x="6" y="18" width="16" height="7" rx="2" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
          </svg>
        )
      },
      {
        title: "Smart Location Memory", desc: "Every route recorded and queryable on a map grid", badge: "AUTO SYNC", demoType: "location-memory",
        icon: (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <ellipse cx="14" cy="8" rx="10" ry="4" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
            <path d="M4 8 L4 20 Q4 24 14 24 Q24 24 24 20 L24 8" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
            <path d="M4 14 Q4 18 14 18 Q24 18 24 14" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.5"/>
          </svg>
        )
      },
      {
        title: "Offline Journey Buffer", desc: "Stores the route locally when signal drops, syncs on return", badge: "OFFLINE SAFE", demoType: "offline-buffer",
        icon: (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="4" width="20" height="20" rx="3" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
            <rect x="8" y="4" width="12" height="7" rx="1" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
            <circle cx="18" cy="7" r="1.5" fill="var(--color-primary)"/>
            <line x1="8" y1="16" x2="20" y2="16" stroke="var(--color-primary)" strokeWidth="1.2"/>
            <line x1="8" y1="20" x2="16" y2="20" stroke="var(--color-primary)" strokeWidth="1.2" opacity="0.5"/>
          </svg>
        )
      },
      {
        title: "Smooth Path Prediction", desc: "Fills in the gaps when GPS signal is temporarily lost", badge: "AI ASSIST", demoType: "path-prediction",
        icon: (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 22 Q8 16 14 14 Q18 12 22 8" stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M22 8 Q24 4 26 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
            <circle cx="4" cy="22" r="2.5" fill="var(--color-primary)"/>
            <circle cx="14" cy="14" r="2" fill="var(--color-primary)" opacity="0.7"/>
            <circle cx="22" cy="8" r="2" stroke="var(--color-primary)" strokeWidth="1.2" fill="none"/>
          </svg>
        )
      }
    ]
  },
  {
    id: "disruption",
    title: "AI Disruption Detection",
    heroIcon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <path d="M36 8 L44 28 L64 28 L48 42 L54 62 L36 50 L18 62 L24 42 L8 28 L28 28 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="rgba(91,141,239,0.1)"/>
        <circle cx="36" cy="36" r="6" fill="var(--color-primary)"/>
      </svg>
    ),
    desc: "ML models analyze speed, location, and route compliance in real time.",
    cards: [
      { title: "Speed Anomaly Radar", desc: "Speed drop detection", demoType: "speed-anomaly", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M4 18 A10 10 0 0 1 24 18" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" /><circle cx="14" cy="18" r="2" fill="var(--color-primary)" /><line x1="14" y1="18" x2="10" y2="12" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" /></svg> },
      { title: "Route Deviation Guard", desc: "Route deviation alerts (>500m)", demoType: "route-deviation", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M14 26 L14 16 Q14 10 6 6" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><path d="M14 16 Q14 10 22 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" /></svg> },
      { title: "Geofence Sentinel", desc: "Geofence breach detection", demoType: "geofence", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><polygon points="14,2 24,8 24,20 14,26 4,20 4,8" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" /><circle cx="14" cy="14" r="3" fill="var(--color-primary)" /></svg> },
      { title: "Alert Severity Engine", desc: "Alert severity: LOW → MEDIUM → HIGH → CRITICAL", demoType: "alert-engine", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M6 20 L22 20 Q22 18 18 16 L18 10 A4 4 0 0 0 10 10 L10 16 Q6 18 6 20 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" /><line x1="14" y1="10" x2="14" y2="14" stroke="var(--color-primary)" strokeWidth="1.5" /><circle cx="14" cy="17" r="1" fill="var(--color-primary)" /></svg> }
    ]
  },
  {
    id: "weather",
    title: "Weather-Aware Routing",
    heroIcon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="28" cy="30" r="12" stroke="var(--color-accent)" strokeWidth="1.5" fill="none"/>
        <path d="M16 44 Q20 36 28 36 Q34 36 38 42 Q42 36 50 38 Q58 40 58 50 Q58 58 50 58 L20 58 Q12 58 12 50 Q12 44 16 44Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="rgba(91,141,239,0.08)"/>
        <line x1="32" y1="62" x2="30" y2="68" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40" y1="62" x2="38" y2="68" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="48" y1="62" x2="46" y2="68" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    desc: "Open-Meteo data overlaid on every route segment with risk scores and ETA adjustments.",
    cards: [
      { title: "Route Weather Scanner", desc: "Per-segment weather risk scoring", demoType: "weather-live", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M8 18 Q4 18 4 14 Q4 10 8 10 Q10 4 16 6 Q22 4 24 10 Q28 10 28 14 Q28 18 24 18 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" /><path d="M10 22 Q14 18 18 22" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /></svg> },
      { title: "Segment Risk Scorer", desc: "Risk color coded segments", demoType: "segment-risk", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M14 2 L24 6 L24 14 Q24 22 14 26 Q4 22 4 14 L4 6 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" /><path d="M10 14 L13 17 L18 11" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> },
      { title: "Smart ETA Adjuster", desc: "Automatic ETA adjustment for rain", demoType: "eta-adjuster", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><circle cx="14" cy="14" r="10" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><polyline points="14,8 14,14 18,14" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 6 L26 2 L20 2" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg> },
      { title: "Reroute Intelligence", desc: "Proactive rerouting for severe weather", demoType: "reroute", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M14 26 L14 16 Q14 10 6 6" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><polyline points="6,12 6,6 12,6" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><path d="M14 16 Q14 10 22 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" /></svg> }
    ]
  },
  {
    id: "dashboard",
    title: "Control Tower Dashboard",
    heroIcon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect x="28" y="8" width="16" height="8" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="none"/>
        <rect x="20" y="20" width="32" height="24" rx="3" stroke="var(--color-primary)" strokeWidth="1.5" fill="rgba(91,141,239,0.08)"/>
        <line x1="36" y1="44" x2="36" y2="56" stroke="var(--color-primary)" strokeWidth="1.5"/>
        <rect x="16" y="56" width="40" height="8" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" fill="none"/>
        <circle cx="28" cy="32" r="3" fill="var(--color-primary)" opacity="0.7"/>
        <circle cx="36" cy="32" r="3" fill="var(--color-success)"/>
        <circle cx="44" cy="32" r="3" fill="var(--color-accent)" opacity="0.7"/>
        <path d="M22 40 Q36 36 50 40" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
      </svg>
    ),
    desc: "Unified real-time view — WebSocket-powered, no page refresh needed.",
    cards: [
      { title: "Live Fleet Map", desc: "Real-time driver markers", demoType: "fleet-map", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><circle cx="6" cy="6" r="2" fill="var(--color-primary)" /><circle cx="22" cy="10" r="2" fill="var(--color-primary)" /><circle cx="14" cy="22" r="2" fill="var(--color-primary)" /><path d="M6 6 L22 10 L14 22 Z" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeDasharray="2 2" /></svg> },
      { title: "Risk-Scored Driver Table", desc: "Risk-scored driver table with live search", demoType: "driver-table", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><rect x="4" y="6" width="20" height="4" rx="1" fill="var(--color-primary)" opacity="0.3" /><rect x="4" y="14" width="20" height="4" rx="1" fill="var(--color-primary)" /><rect x="4" y="22" width="20" height="4" rx="1" fill="var(--color-primary)" opacity="0.3" /></svg> },
      { title: "Alert Command Feed", desc: "Alert feed with severity color coding", demoType: "alert-feed", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><rect x="8" y="4" width="16" height="4" rx="1" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><rect x="4" y="12" width="20" height="4" rx="1" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /><rect x="8" y="20" width="16" height="4" rx="1" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" /></svg> },
      { title: "System Health Monitor", desc: "System health monitoring", demoType: "health-monitor", icon: <svg viewBox="0 0 28 28" fill="none" width="28" height="28"><path d="M2 14 L8 14 L12 6 L16 22 L20 14 L26 14" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> }
    ]
  }
];

/* ==================================================
 * SECTION HERO ICON WRAPPER
 * ================================================== */
const SectionHeroIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 32px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{
      width: 200, height: 200, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(91,141,239,0.15) 0%, rgba(91,141,239,0.03) 70%)",
      border: "1px solid rgba(91,141,239,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1, fontSize: 72
    }}>
      {icon}
    </div>
    <div style={{ position: "absolute", top: "50%", left: "50%", width: 220, height: 220, margin: "-110px 0 0 -110px", borderRadius: "50%", border: "1px dashed rgba(91,141,239,0.3)", animation: "slowRotate 10s linear infinite", zIndex: 0 }}></div>
    <div style={{ position: "absolute", top: "50%", left: "50%", width: 250, height: 250, margin: "-125px 0 0 -125px", borderRadius: "50%", border: "1px dashed rgba(196,164,124,0.15)", animation: "slowRotate 16s linear infinite reverse", zIndex: 0 }}></div>
  </div>
);

/* ==================================================
 * INTERACTIVE FEATURE CARD
 * ================================================== */
const FeatureCard = ({ icon, title, desc, badge, demoType }: any) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="feat-card-item" style={{ flexDirection: "column", alignItems: "stretch", padding: 0, overflow: "hidden" }}>
      <div 
        style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, cursor: "pointer", width: "100%" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, minWidth: 56, borderRadius: 14,
          background: "rgba(91,141,239,0.1)", border: "1px solid rgba(91,141,239,0.2)"
        }}>
          {icon}
        </div>
        <div className="gps-feature-pill-content" style={{ flex: 1 }}>
          <span className="gps-feature-pill-name">{title}</span>
          {desc && <span className="gps-feature-pill-desc">{desc}</span>}
        </div>
        {badge && <span className="gps-badge">{badge}</span>}
      </div>
      
      <div style={{
        maxHeight: expanded ? 800 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease",
        background: "rgba(0,0,0,0.4)",
        borderTop: expanded ? "1px solid var(--color-border-base)" : "none",
      }}>
        <div style={{ padding: 16 }}>
          <DemoContent type={demoType} />
        </div>
      </div>
    </div>
  );
};

/* ==================================================
 * DEMO COMPONENTS ROUTER
 * ================================================== */
const DemoContent = ({ type }: { type: string }) => {
  switch (type) {
    case "live-location": return <LiveLocationDemo />;
    case "signal-relay": return <SignalRelayDemo />;
    case "location-memory": return <LocationMemoryDemo />;
    case "offline-buffer": return <OfflineBufferDemo />;
    case "path-prediction": return <PathPredictionDemo />;
    case "speed-anomaly": return <SpeedAnomalyDemo />;
    case "route-deviation": return <RouteDeviationDemo />;
    case "geofence": return <GeofenceDemo />;
    case "alert-engine": return <AlertEngineDemo />;
    case "weather-live": return <WeatherLiveDemo />;
    case "segment-risk": return <SegmentRiskDemo />;
    case "eta-adjuster": return <EtaAdjusterDemo />;
    case "reroute": return <RerouteDemo />;
    case "fleet-map": return <FleetMapDemo />;
    case "driver-table": return <DriverTableDemo />;
    case "alert-feed": return <AlertFeedDemo />;
    case "health-monitor": return <HealthMonitorDemo />;
    default: return <GenericDemo type={type} />;
  }
};

/* --- GPS DEMOS --- */
const LiveLocationDemo = () => {
  const [loc, setLoc] = useState<any>(null);
  const [denied, setDenied] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  const initMap = (lat: number, lng: number) => {
    if (typeof window === "undefined" || !(window as any).L) return;
    if (!leafletMap.current && mapRef.current) {
      const L = (window as any).L;
      leafletMap.current = L.map(mapRef.current).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap"
      }).addTo(leafletMap.current);
      
      const markerHtml = `<div style="width:16px;height:16px;background:var(--color-primary);border-radius:50%;box-shadow:0 0 10px var(--color-primary);animation:gpsPulse 2s infinite;"></div>`;
      const icon = L.divIcon({ html: markerHtml, className: "" });
      L.marker([lat, lng], { icon }).addTo(leafletMap.current);
    } else if (leafletMap.current) {
      leafletMap.current.setView([lat, lng], 15);
    }
  };

  const ping = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy, timestamp: new Date().toISOString() };
          setLoc(newLoc);
          initMap(newLoc.lat, newLoc.lng);
          const existing = JSON.parse(localStorage.getItem("astra_gps_log") || "[]");
          localStorage.setItem("astra_gps_log", JSON.stringify([newLoc, ...existing]));
          window.dispatchEvent(new Event("storage"));
        },
        () => setDenied(true)
      );
    }
  };

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => ping();
      document.body.appendChild(script);
    } else { ping(); }
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  return (
    <div>
      {denied && <div style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>Location access denied — enable in browser settings</div>}
      <button onClick={ping} style={{ background: "var(--color-primary)", color: "#000", padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 16 }}>Re-ping Location</button>
      {loc && <div style={{ fontSize: 11, fontFamily: "var(--font-data)", color: "var(--color-text-secondary)", marginBottom: 12 }}>LAT: {loc.lat.toFixed(4)} | LNG: {loc.lng.toFixed(4)} | ACCURACY: {Math.round(loc.acc)}m</div>}
      <div ref={mapRef} style={{ height: 400, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const SignalRelayDemo = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [loc, setLoc] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }));
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      const now = new Date().toTimeString().split(" ")[0];
      setLogs(prev => [`[${now}] → Ping sent | lat: ${loc.lat.toFixed(4)} | lng: ${loc.lng.toFixed(4)}`, ...prev].slice(0, 10));
    }, 10000);
    return () => clearInterval(interval);
  }, [active, loc]);

  return (
    <div style={{ background: "#0a0d14", fontFamily: "var(--font-data)", fontSize: 12, padding: 12, borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "var(--color-success)" : "var(--color-danger)", boxShadow: active ? "0 0 8px var(--color-success)" : "none" }}></div>
          <span style={{ color: active ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>SOCKET {active ? "ACTIVE" : "PAUSED"}</span>
        </div>
        <button onClick={() => setActive(!active)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
          {active ? "Pause Relay" : "Resume Relay"}
        </button>
      </div>
      <div style={{ height: 150, overflowY: "auto", background: "#000", padding: 12, borderRadius: 4, color: "var(--color-text-secondary)" }}>
        {logs.map((l, i) => <div key={i} style={{ color: i === 0 ? "var(--color-primary)" : "inherit", marginBottom: 4 }}>{l}</div>)}
        {logs.length === 0 && <div>Waiting for next ping (10s interval)...</div>}
      </div>
    </div>
  );
};

const LocationMemoryDemo = () => {
  const [pings, setPings] = useState<any[]>([]);
  const loadMemory = () => { try { setPings(JSON.parse(localStorage.getItem("astra_gps_log") || "[]")); } catch { setPings([]); } };
  useEffect(() => { loadMemory(); window.addEventListener("storage", loadMemory); return () => window.removeEventListener("storage", loadMemory); }, []);
  const clearMemory = () => { localStorage.removeItem("astra_gps_log"); loadMemory(); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={clearMemory} style={{ background: "rgba(224,96,96,0.15)", color: "var(--color-danger)", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clear Memory</button>
      </div>
      {pings.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)", fontSize: 13 }}>No pings stored yet — click Live Location Engine first</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", fontSize: 12 }}>
            <thead><tr><th>#</th><th>Timestamp</th><th>Lat</th><th>Lng</th><th>Acc</th></tr></thead>
            <tbody>
              {pings.slice(0, 5).map((p, i) => (
                <tr key={i}><td>{i + 1}</td><td>{new Date(p.timestamp).toLocaleTimeString()}</td><td>{p.lat.toFixed(4)}</td><td>{p.lng.toFixed(4)}</td><td>{Math.round(p.acc)}m</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const OfflineBufferDemo = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [buffer, setBuffer] = useState(0);
  useEffect(() => {
    if (isOffline) { const int = setInterval(() => setBuffer(b => b + 1), 2000); return () => clearInterval(int); }
    else if (buffer > 0) setBuffer(0);
  }, [isOffline, buffer]);
  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={() => setIsOffline(!isOffline)} style={{ background: isOffline ? "var(--color-success)" : "var(--color-danger)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
          {isOffline ? "Reconnect Network" : "Simulate Offline Mode"}
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: isOffline ? "var(--color-danger)" : "var(--color-success)" }}>{isOffline ? "OFFLINE" : "ONLINE"}</span>
      </div>
      <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Buffered Pings Pending Sync</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-data)", color: buffer > 0 ? "var(--color-warning)" : "var(--color-text-secondary)" }}>{buffer}</div>
        {buffer > 0 && <div style={{ fontSize: 12, color: "var(--color-warning)", marginTop: 8 }}>Will sync automatically upon reconnection.</div>}
        {!isOffline && buffer === 0 && <div style={{ fontSize: 12, color: "var(--color-success)", marginTop: 8 }}>All data synced successfully.</div>}
      </div>
    </div>
  );
};

const PathPredictionDemo = () => (
  <div>
    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>When the GPS signal drops, the Kalman filter uses the last known velocity and heading to project the driver's path.</p>
    <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
      <div style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "var(--color-danger)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Raw GPS (Dropped)</div>
        <div style={{ fontFamily: "var(--font-data)", fontSize: 13, color: "var(--color-text-muted)" }}>-- SIGNAL LOST --</div>
      </div>
      <div style={{ flex: 1, padding: 16, background: "rgba(91,141,239,0.08)", border: "1px solid var(--color-primary)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "var(--color-primary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kalman Predicted</div>
        <div style={{ fontFamily: "var(--font-data)", fontSize: 13, color: "var(--color-text-primary)" }}>LAT: 12.9718 <br/> LNG: 77.5949</div>
      </div>
    </div>
  </div>
);

/* --- AI DEMOS --- */
const SpeedAnomalyDemo = () => {
  const [speed, setSpeed] = useState(45);
  const [severity, setSeverity] = useState("LOW");
  useEffect(() => {
    const int = setInterval(() => {
      setSpeed(prev => {
        let next = prev + (Math.random() > 0.5 ? 10 : -10);
        if (next > 80) next = 80; if (next < 5) next = 5;
        if (next < 20) setSeverity("CRITICAL"); else if (next < 40) setSeverity("MEDIUM"); else setSeverity("LOW");
        return next;
      });
    }, 2000);
    return () => clearInterval(int);
  }, []);
  const color = speed > 40 ? "var(--color-success)" : speed >= 20 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 60, fontFamily: "var(--font-data)", fontWeight: 700, color, transition: "color 0.3s" }}>{speed} <span style={{ fontSize: 24 }}>km/h</span></div>
      <div style={{ marginTop: 16, padding: "8px 16px", borderRadius: 4, background: "rgba(255,255,255,0.05)", display: "inline-block" }}>Status: <strong style={{ color }}>{severity} RISK</strong></div>
      <div style={{ marginTop: 16 }}><button onClick={() => { setSpeed(45); setSeverity("LOW"); }} style={{ background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", padding: "4px 12px", borderRadius: 4, cursor: "pointer" }}>Reset</button></div>
    </div>
  );
};

const RouteDeviationDemo = () => {
  const [deviated, setDeviated] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const devLineRef = useRef<any>(null);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([12.9716, 77.5946], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
        L.polyline([[12.9716, 77.5946], [12.98, 77.60]], { color: "blue", dashArray: "5, 5" }).addTo(leafletMap.current);
        const mHtml = `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;"></div>`;
        markerRef.current = L.marker([12.9716, 77.5946], { icon: L.divIcon({ html: mHtml, className: "" }) }).addTo(leafletMap.current);
      }
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  useEffect(() => {
    if (!markerRef.current || !leafletMap.current) return;
    const L = (window as any).L;
    if (devLineRef.current) leafletMap.current.removeLayer(devLineRef.current);
    if (deviated) {
      markerRef.current.setLatLng([12.965, 77.585]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-danger);border-radius:50%;"></div>`, className: "" }));
      devLineRef.current = L.polyline([[12.9716, 77.5946], [12.965, 77.585]], { color: "red" }).addTo(leafletMap.current);
    } else {
      markerRef.current.setLatLng([12.9716, 77.5946]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;"></div>`, className: "" }));
    }
  }, [deviated]);

  return (
    <div>
      <button onClick={() => setDeviated(!deviated)} style={{ background: deviated ? "transparent" : "var(--color-danger)", border: deviated ? "1px solid var(--color-danger)" : "none", color: deviated ? "var(--color-danger)" : "#fff", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 12 }}>{deviated ? "Return to Route" : "Simulate Deviation"}</button>
      {deviated && <div style={{ color: "var(--color-danger)", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>⚠️ ROUTE DEVIATION ALARM TRIGGERED</div>}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const GeofenceDemo = () => {
  const [breached, setBreached] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
        L.circle([12.9716, 77.5946], { radius: 3000, color: "blue", fillOpacity: 0.1 }).addTo(leafletMap.current);
        const mHtml = `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`;
        markerRef.current = L.marker([12.9716, 77.5946], { icon: L.divIcon({ html: mHtml, className: "" }) }).addTo(leafletMap.current);
      }
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  useEffect(() => {
    if (!markerRef.current || !leafletMap.current) return;
    const L = (window as any).L;
    if (breached) {
      markerRef.current.setLatLng([13.01, 77.62]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-danger);border-radius:50%;"></div>`, className: "" }));
    } else {
      markerRef.current.setLatLng([12.9716, 77.5946]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`, className: "" }));
    }
  }, [breached]);

  return (
    <div>
      <button onClick={() => setBreached(!breached)} style={{ background: breached ? "transparent" : "var(--color-warning)", border: breached ? "1px solid var(--color-warning)" : "none", color: breached ? "var(--color-warning)" : "#000", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 12, fontWeight: 600 }}>{breached ? "Return to Zone" : "Simulate Breach"}</button>
      {breached && <div style={{ color: "var(--color-danger)", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>⚠️ GEOFENCE BREACH DETECTED</div>}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const AlertEngineDemo = () => {
  const [counts, setCounts] = useState({ LOW: 12, MEDIUM: 5, HIGH: 2, CRITICAL: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const fireAlert = () => {
    const types = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const t = types[Math.floor(Math.random() * types.length)];
    setCounts(prev => ({ ...prev, [t]: prev[t as keyof typeof prev] + 1 }));
    const now = new Date().toTimeString().split(" ")[0];
    setLogs(prev => [`[${now}] ${t} alert triggered in sector 7`, ...prev].slice(0, 5));
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 4, borderLeft: `3px solid var(--color-${k === "CRITICAL" || k === "HIGH" ? "danger" : k === "MEDIUM" ? "warning" : "primary"})` }}>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>
      <button onClick={fireAlert} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, width: "100%", marginBottom: 16 }}>Fire Mock Alert</button>
      <div style={{ height: 100, overflowY: "auto", background: "#000", padding: 8, borderRadius: 4, fontSize: 12, fontFamily: "var(--font-data)", color: "var(--color-text-secondary)" }}>
        {logs.map((l, i) => <div key={i} style={{ marginBottom: 4, color: l.includes("CRITICAL") || l.includes("HIGH") ? "var(--color-danger)" : "inherit" }}>{l}</div>)}
      </div>
    </div>
  );
};

/* --- WEATHER DEMOS --- */
const WeatherLiveDemo = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchWeather = () => {
    setLoading(true); setError(false);
    apiGet("/api/weather?lat=12.9716&lng=77.5946").then(res => setData(res)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchWeather(); }, []);
  return (
    <div>
      <button onClick={fetchWeather} disabled={loading} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>{loading ? "Refreshing..." : "Refresh Data"}</button>
      {error && <div style={{ color: "var(--color-danger)" }}>Failed to load weather data</div>}
      {data && data.current_weather && (
        <div style={{ display: "flex", gap: 24, alignItems: "center", background: "rgba(255,255,255,0.05)", padding: 24, borderRadius: 8 }}>
          <div style={{ fontSize: 48 }}>{data.current_weather.weathercode === 0 ? "☀️" : "🌧️"}</div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{data.current_weather.temperature}°C</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>WMO Code: {data.current_weather.weathercode}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SegmentRiskDemo = () => (
  <div>
    <table className="data-table" style={{ width: "100%", fontSize: 12 }}>
      <thead><tr><th>Segment</th><th>Weather</th><th>Risk</th><th>ETA Impact</th></tr></thead>
      <tbody>
        <tr><td>BLR → HYD</td><td>☀️ Clear</td><td><span style={{ color: "var(--color-success)" }}>LOW</span></td><td>+0 min</td></tr>
        <tr><td>HYD → NGP</td><td>🌧️ Rain</td><td><span style={{ color: "var(--color-warning)" }}>MEDIUM</span></td><td>+45 min</td></tr>
        <tr><td>NGP → BPL</td><td>⛈️ Storm</td><td><span style={{ color: "var(--color-danger)" }}>HIGH</span></td><td>+120 min</td></tr>
        <tr><td>BPL → DEL</td><td>☀️ Clear</td><td><span style={{ color: "var(--color-success)" }}>LOW</span></td><td>+0 min</td></tr>
      </tbody>
    </table>
    <div style={{ marginTop: 16, textAlign: "right", fontWeight: 700, color: "var(--color-warning)" }}>Total ETA Impact: +165 min</div>
  </div>
);

const EtaAdjusterDemo = () => {
  const [adjusted, setAdjusted] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>Original ETA</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>14:30 (Today)</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: adjusted ? "rgba(224,168,94,0.15)" : "rgba(255,255,255,0.05)", borderRadius: 8, border: adjusted ? "1px solid var(--color-warning)" : "1px solid transparent", transition: "all 0.3s" }}>
          <div style={{ fontSize: 11, color: adjusted ? "var(--color-warning)" : "var(--color-text-muted)", marginBottom: 8 }}>Adjusted ETA</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: adjusted ? "var(--color-warning)" : "inherit" }}>{adjusted ? "16:45 (Today)" : "--:--"}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 8 }}>Weather-Affected Route Segment</div>
        <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: "35%", height: "100%", background: "var(--color-warning)" }}></div></div>
      </div>
      <button onClick={() => setAdjusted(true)} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, width: "100%" }}>Apply Weather Data</button>
    </div>
  );
};

const RerouteDemo = () => {
  const [sel, setSel] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <div onClick={() => setSel(0)} style={{ padding: 16, border: sel === 0 ? "2px solid var(--color-primary)" : "1px solid var(--color-border-base)", borderRadius: 8, marginBottom: 12, cursor: "pointer", opacity: sel === 0 ? 1 : 0.6 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Route A (Current)</div>
        <div style={{ fontSize: 13, color: "var(--color-danger)" }}>Severe weather ahead • ETA: 16:45</div>
      </div>
      <div onClick={() => setSel(1)} style={{ padding: 16, border: sel === 1 ? "2px solid var(--color-success)" : "1px solid var(--color-border-base)", borderRadius: 8, marginBottom: 16, cursor: "pointer", opacity: sel === 1 ? 1 : 0.6 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Route B (Recommended)</div>
        <div style={{ fontSize: 13, color: "var(--color-success)" }}>Clear weather • ETA: 15:15 (+45m detour)</div>
      </div>
      {confirmed ? (
        <div style={{ padding: 12, background: "var(--color-success)", color: "#000", borderRadius: 4, textAlign: "center", fontWeight: 700 }}>Reroute Command Sent to Driver!</div>
      ) : (
        <button onClick={() => setConfirmed(true)} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, width: "100%" }}>Confirm Reroute</button>
      )}
    </div>
  );
};

/* --- DASHBOARD DEMOS --- */
const FleetMapDemo = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [pos, setPos] = useState(12.9716);
  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
        const m1 = `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`;
        const m2 = `<div style="width:14px;height:14px;background:var(--color-warning);border-radius:50%;"></div>`;
        L.marker([12.9716, 77.5946], { icon: L.divIcon({ html: m1, className: "" }) }).addTo(leafletMap.current).bindTooltip("Driver A");
        L.marker([12.99, 77.62], { icon: L.divIcon({ html: m2, className: "" }) }).addTo(leafletMap.current).bindTooltip("Driver B");
      }
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);
  return (
    <div>
      <button onClick={() => setPos(pos + 0.01)} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 12, fontWeight: 600 }}>Refresh Positions</button>
      <div ref={mapRef} style={{ height: 350, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const DriverTableDemo = () => {
  const [q, setQ] = useState("");
  const drivers = [{ n: "Rajesh K.", r: "LOW", s: "Active" }, { n: "Suresh P.", r: "HIGH", s: "Deviated" }, { n: "Anil M.", r: "MEDIUM", s: "Delayed" }];
  const filtered = drivers.filter(d => d.n.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input type="text" placeholder="Search drivers..." value={q} onChange={e => setQ(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 4, background: "rgba(0,0,0,0.3)", border: "1px solid var(--color-border-base)", color: "#fff", marginBottom: 16 }} />
      <table className="data-table" style={{ width: "100%", fontSize: 12 }}>
        <thead><tr><th>Driver</th><th>Risk</th><th>Status</th></tr></thead>
        <tbody>
          {filtered.map((d, i) => (
            <tr key={i}>
              <td>{d.n}</td>
              <td style={{ color: d.r === "HIGH" ? "var(--color-danger)" : d.r === "MEDIUM" ? "var(--color-warning)" : "var(--color-success)", fontWeight: 700 }}>{d.r}</td>
              <td>{d.s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AlertFeedDemo = () => {
  const [alerts, setAlerts] = useState([{ id: 1, m: "Geofence breach detected", c: "critical" }, { id: 2, m: "Speed anomaly (15 km/h)", c: "warning" }, { id: 3, m: "Route deviation >500m", c: "critical" }]);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setAlerts([{ id: Date.now(), m: "New Weather Alert", c: "warning" }, ...alerts])} style={{ flex: 1, background: "var(--color-primary)", color: "#000", border: "none", padding: "6px", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>Add Alert</button>
        <button onClick={() => setAlerts([])} style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "6px", borderRadius: 4, cursor: "pointer" }}>Resolve All</button>
      </div>
      <div style={{ height: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map(a => (
          <div key={a.id} className="alert-item" style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 4, borderLeft: `3px solid var(--color-${a.c === "critical" ? "danger" : "warning"})` }}>
            <div style={{ fontSize: 13 }}>{a.m}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 4 }}>Just now</div>
          </div>
        ))}
        {alerts.length === 0 && <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 24 }}>No active alerts</div>}
      </div>
    </div>
  );
};

const HealthMonitorDemo = () => {
  const [checking, setChecking] = useState(false);
  const services = ["GPS Ingestion API", "WebSocket Relay", "PostGIS Database", "Weather Service"];
  const runCheck = () => { setChecking(true); setTimeout(() => setChecking(false), 2000); };
  return (
    <div>
      <button onClick={runCheck} disabled={checking} style={{ width: "100%", background: "var(--color-primary)", color: "#000", border: "none", padding: "8px", borderRadius: 4, cursor: "pointer", fontWeight: 600, marginBottom: 16 }}>
        {checking ? "Checking Systems..." : "Run Health Check"}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {services.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
            <span style={{ fontSize: 13 }}>{s}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className={`network-dot ${checking ? (Math.random() > 0.5 ? "online" : "offline") : "online"}`}></div>
              <span style={{ fontSize: 11, color: "var(--color-success)", fontWeight: 700 }}>OPERATIONAL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GenericDemo = ({ type }: { type: string }) => (
  <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>
    <div style={{ fontSize: 24, marginBottom: 12 }}>✨</div>
    <p style={{ fontSize: 14 }}>Interactive demo for {type} is currently active and monitoring.</p>
  </div>
);

/* ==================================================
 * LIVE MAP SECTION
 * ================================================== */
const LiveMapSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const driver1Marker = useRef<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    apiGet("/api/weather?lat=12.9716&lng=77.5946").then(res => setWeatherData(res)).catch(() => {});
  }, []);

  useEffect(() => {
    const initMap = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (leafletMap.current) return;

      leafletMap.current = L.map(mapRef.current).setView([13.4, 78.0], 8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "© OpenStreetMap"
      }).addTo(leafletMap.current);

      const routePoints: [number, number][] = [
        [12.9716, 77.5946], [13.0827, 77.5877], [13.3409, 77.7229],
        [13.6288, 78.1387], [13.7729, 78.4832], [13.8500, 78.7200]
      ];
      L.polyline(routePoints, { color: "blue", dashArray: "5, 10" }).addTo(leafletMap.current);

      const d1Html = `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;box-shadow:0 0 8px var(--color-success);animation:gpsPulse 2s infinite;"></div>`;
      driver1Marker.current = L.marker([13.0827, 77.5877], { icon: L.divIcon({ html: d1Html, className: "" }) }).addTo(leafletMap.current);

      const d2Html = `<div style="width:14px;height:14px;background:var(--color-text-muted);border-radius:50%;"></div>`;
      L.marker([13.3409, 77.7229], { icon: L.divIcon({ html: d2Html, className: "" }) }).addTo(leafletMap.current);
      L.polyline([[13.3409, 77.7229], [13.4909, 77.7229]], { color: "orange", dashArray: "5, 5" }).addTo(leafletMap.current);

      const d3Html = `<div style="width:14px;height:14px;background:var(--color-warning);border-radius:50%;"></div>`;
      const devLat = 13.6288 - 0.008;
      const devLng = 78.1387 + 0.008;
      L.marker([devLat, devLng], { icon: L.divIcon({ html: d3Html, className: "" }) }).addTo(leafletMap.current);
      L.polyline([[13.6288, 78.1387], [devLat, devLng]], { color: "red" }).addTo(leafletMap.current);

      L.circle([13.3409, 77.7229], { radius: 8000, color: "var(--color-primary)", fillOpacity: 0.05, dashArray: "8 4" }).addTo(leafletMap.current);
    };

    if (!(window as any).L) {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.body.appendChild(script);
      }
    } else {
      initMap();
    }

    const interval = setInterval(() => {
      if (driver1Marker.current) {
        const pos = driver1Marker.current.getLatLng();
        driver1Marker.current.setLatLng([pos.lat + 0.015, pos.lng]);
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
    };
  }, []);

  return (
    <section className="section" style={{ borderTop: "1px solid var(--color-border-base)", marginTop: 64, paddingBottom: 64 }}>
      <div className="container-lg" style={{ maxWidth: 1000 }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 3vw, 40px)", textAlign: "center", marginBottom: 8 }}>See It All Working Together</h2>
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center", marginBottom: 32 }}>One map. Every feature. Live.</p>
        
        <div style={{ position: "relative", width: "100%", height: 500, borderRadius: "var(--radius-lg, 12px)", overflow: "hidden", border: "1px solid var(--color-border-base)", background: "#111" }}>
          {weatherData && (
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-base)", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <span>{weatherData.current_weather?.temperature}°C</span>
              <span style={{ color: "var(--color-text-muted)" }}>|</span>
              <span style={{ fontSize: 16 }}>{weatherData.current_weather?.weathercode === 0 ? "☀️" : "🌧️"}</span>
            </div>
          )}
          <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "12px", borderRadius: 8, border: "1px solid var(--color-border-base)", fontSize: 12, color: "var(--color-text-primary)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-success)" }}></div> Online driver</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-text-muted)" }}></div> Offline / predicted</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-warning)" }}></div> Route deviation</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, background: "blue" }}></div> Planned route</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, background: "orange", borderBottom: "2px dashed orange" }}></div> Predicted path</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid var(--color-primary)" }}></div> Geofence zone</div>
          </div>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
        </div>
      </div>
    </section>
  );
};

/* ==================================================
 * PAGE EXPORT
 * ================================================== */
export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
          <div className="container-lg" style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 20 }}>Everything Your Operations Team Needs</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>Integrated capabilities that transform reactive logistics into proactive intelligence.</p>
          </div>
        </section>

        <div className="container-lg" style={{ maxWidth: 1000 }}>
          {featuresData.map((f, i) => (
            <section key={f.id} id={f.id} className="section reveal" style={{ borderBottom: i < featuresData.length - 1 ? "1px solid var(--color-border-base)" : "none" }}>
              <div>
                <SectionHeroIcon icon={f.heroIcon} />
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.2rem, 4vw, 48px)", fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{f.title}</h2>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: 16, textAlign: "center", maxWidth: 800, margin: "0 auto 48px auto" }}>{f.desc}</p>
                
                <div className="feat-cards-grid">
                  {f.cards.map((c, j) => (
                    <FeatureCard key={j} icon={c.icon} title={c.title} desc={c.desc} badge={c.badge} demoType={c.demoType} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        
        <LiveMapSection />
      </main>
      <Footer />
    </>
  );
}
