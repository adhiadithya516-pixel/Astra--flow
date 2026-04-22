"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { apiGet } from "@/lib/api";

// ==================================================
// INTERFACES
// ==================================================
interface GeoResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface WeatherData {
  weather_code: number;
  description: string;
  wind_kmh: number;
  precipitation_mm: number;
  rain_chance_next_2hr: number;
  is_severe: boolean;
  temperature?: number;
}

// ==================================================
// FEATURES DATA (SVGS)
// ==================================================
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

// ==================================================
// SHARED LOCATION AUTOCOMPLETE
// ==================================================
const LocationInput = ({ placeholder, onSelect, label }: { placeholder: string, onSelect: (res: GeoResult) => void, label?: string }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      apiGet(`/api/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
        .then((res: any) => {
          if (res && res.results && res.results.length > 0) {
            setResults(res.results);
            setShowDropdown(true);
          } else {
            setError("Location not found. Try a different search.");
            setShowDropdown(true);
          }
        })
        .catch(() => {
          setError("Could not connect. Check your connection.");
          setShowDropdown(true);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (r: GeoResult) => {
    setQuery(r.display_name.split(",")[0]);
    setShowDropdown(false);
    onSelect(r);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {label && <div style={{ fontSize: 12, marginBottom: 4, color: "var(--color-text-muted)" }}>{label}</div>}
      <div style={{ position: "relative" }}>
        <input 
          className="form-input"
          style={{ width: "100%", paddingRight: 32, borderColor: error ? "var(--color-danger)" : "var(--color-border-base)" }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div style={{ position: "absolute", right: 10, top: 12, width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "slowRotate 1s linear infinite" }}></div>}
        {query && !loading && <div onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }} style={{ position: "absolute", right: 10, top: 10, cursor: "pointer", color: "var(--color-text-muted)" }}>✕</div>}
      </div>
      {error && <div style={{ fontSize: 11, color: "var(--color-danger)", marginTop: 4 }}>{error}</div>}
      
      {showDropdown && results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-base)", borderRadius: "var(--radius)", zIndex: 1000, marginTop: 4, overflow: "hidden" }}>
          {results.map((r, i) => {
            const parts = r.display_name.split(",");
            const mainName = parts[0];
            const hint = parts.slice(1).join(",").trim();
            return (
              <div key={i} onClick={() => handleSelect(r)} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: i < results.length - 1 ? "1px solid var(--color-border-base)" : "none", minHeight: 44 }}>
                <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mainName}</div>
                {hint && <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==================================================
// SHARED UI COMPONENTS
// ==================================================
const EmptyState = ({ text }: { text: string }) => (
  <div style={{ padding: 32, border: "1px dashed var(--color-border-base)", borderRadius: 8, color: "var(--color-text-muted)", textAlign: "center", fontSize: 13 }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>→</div>
    <div>{text}</div>
  </div>
);

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

const FeatureCard = ({ icon, title, desc, badge, demoType, pageState, setPageState }: any) => {
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
        maxHeight: expanded ? 1000 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease",
        background: "rgba(0,0,0,0.4)",
        borderTop: expanded ? "1px solid var(--color-border-base)" : "none",
      }}>
        <div style={{ padding: 16 }}>
          <DemoContent type={demoType} pageState={pageState} setPageState={setPageState} />
        </div>
      </div>
    </div>
  );
};

// ==================================================
// ROUTER & SHARED DEMOS
// ==================================================
const DemoContent = ({ type, pageState, setPageState }: any) => {
  switch (type) {
    case "live-location": return <LiveLocationDemo selectedLocation={pageState.selectedLocation} setPageState={setPageState} />;
    case "signal-relay": return <SignalRelayDemo selectedLocation={pageState.selectedLocation} />;
    case "location-memory": return <LocationMemoryDemo />;
    case "offline-buffer": return <OfflineBufferDemo />;
    case "path-prediction": return <PathPredictionDemo />;
    case "speed-anomaly": return <SpeedAnomalyDemo aiState={pageState.aiRouteConfig} />;
    case "route-deviation": return <RouteDeviationDemo aiState={pageState.aiRouteConfig} />;
    case "geofence": return <GeofenceDemo aiState={pageState.aiRouteConfig} />;
    case "alert-engine": return <AlertEngineDemo aiState={pageState.aiRouteConfig} />;
    case "weather-live": return <WeatherLiveDemo weatherState={pageState.weatherConfig} />;
    case "segment-risk": return <SegmentRiskDemo weatherState={pageState.weatherConfig} />;
    case "eta-adjuster": return <EtaAdjusterDemo weatherState={pageState.weatherConfig} />;
    case "reroute": return <RerouteDemo weatherState={pageState.weatherConfig} />;
    case "fleet-map": return <FleetMapDemo controlTowerData={pageState.controlTowerData} />;
    case "driver-table": return <DriverTableDemo controlTowerData={pageState.controlTowerData} />;
    case "alert-feed": return <AlertFeedDemo controlTowerData={pageState.controlTowerData} />;
    case "health-monitor": return <HealthMonitorDemo />;
    default: return <GenericDemo type={type} />;
  }
};

/* --- GPS DEMOS --- */
const LiveLocationDemo = ({ selectedLocation, setPageState }: any) => {
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
      const L = (window as any).L;
      const markerHtml = `<div style="width:16px;height:16px;background:var(--color-primary);border-radius:50%;box-shadow:0 0 10px var(--color-primary);animation:gpsPulse 2s infinite;"></div>`;
      const icon = L.divIcon({ html: markerHtml, className: "" });
      L.marker([lat, lng], { icon }).addTo(leafletMap.current);
    }
  };

  const pingGeolocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy, timestamp: new Date().toISOString() };
          setLoc(newLoc);
          initMap(newLoc.lat, newLoc.lng);
          const existing = JSON.parse(localStorage.getItem("astra_gps_log") || "[]");
          localStorage.setItem("astra_gps_log", JSON.stringify([newLoc, ...existing]));
          window.dispatchEvent(new Event("storage"));
          setPageState((p: any) => ({ ...p, selectedLocation: { lat: newLoc.lat, lng: newLoc.lng, display_name: "Your Device Location" } }));
        },
        () => setDenied(true)
      );
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setLoc({ lat: selectedLocation.lat, lng: selectedLocation.lng, acc: 0, timestamp: new Date().toISOString() });
      initMap(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => { if (!selectedLocation) pingGeolocation(); };
      document.body.appendChild(script);
    } else if (!selectedLocation) { pingGeolocation(); }
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  return (
    <div>
      <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-base)", marginBottom: 16 }}>
        <button onClick={pingGeolocation} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid var(--color-border-base)", padding: "10px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, marginBottom: 16 }}>Option A: Use My Device Location</button>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>OR Option B:</div>
        <LocationInput label="Enter Any Location" placeholder="Search for a city or place..." onSelect={(res) => setPageState((p: any) => ({ ...p, selectedLocation: res }))} />
      </div>
      
      {denied && <div style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>Location access denied — enable in browser settings</div>}
      {loc && <div style={{ fontSize: 11, fontFamily: "var(--font-data)", color: "var(--color-text-secondary)", marginBottom: 12 }}>LAT: {loc.lat.toFixed(4)} | LNG: {loc.lng.toFixed(4)} | ACCURACY: {Math.round(loc.acc)}m</div>}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const SignalRelayDemo = ({ selectedLocation }: any) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active || !selectedLocation) return;
    const interval = setInterval(() => {
      const now = new Date().toTimeString().split(" ")[0];
      setLogs(prev => [`[${now}] → Ping sent | lat: ${selectedLocation.lat.toFixed(4)} | lng: ${selectedLocation.lng.toFixed(4)}`, ...prev].slice(0, 10));
    }, 10000);
    return () => clearInterval(interval);
  }, [active, selectedLocation]);

  if (!selectedLocation) return <EmptyState text="Select a location in Live Location Engine first." />;

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

const PathPredictionDemo = () => {
  const [start, setStart] = useState<GeoResult | null>(null);
  const [end, setEnd] = useState<GeoResult | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    if (start && end) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => { if(data.routes && data.routes[0]) setRouteData(data.routes[0]); });
    }
  }, [start, end]);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([20.59, 78.96], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
      }
      if (routeData && leafletMap.current) {
        L.geoJSON(routeData.geometry, { style: { color: "blue", weight: 3 } }).addTo(leafletMap.current);
        if (start) L.marker([start.lat, start.lng]).addTo(leafletMap.current);
        if (end) L.marker([end.lat, end.lng]).addTo(leafletMap.current);
        if (start && end) leafletMap.current.fitBounds([[start.lat, start.lng], [end.lat, end.lng]]);
      }
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [routeData]);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <LocationInput label="Start Point" placeholder="Origin..." onSelect={setStart} />
        <LocationInput label="End Point" placeholder="Destination..." onSelect={setEnd} />
      </div>
      {routeData && (
        <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
          <div>Distance: <strong style={{ color: "var(--color-primary)" }}>{(routeData.distance / 1000).toFixed(1)} km</strong></div>
          <div>Duration: <strong style={{ color: "var(--color-primary)" }}>{(routeData.duration / 60).toFixed(0)} min</strong></div>
        </div>
      )}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

/* --- AI DEMOS --- */
const SpeedAnomalyDemo = ({ aiState }: any) => {
  const [speed, setSpeed] = useState(0);
  const [severity, setSeverity] = useState("LOW");
  
  useEffect(() => {
    if (!aiState.analyzed) return;
    setSpeed(aiState.speed);
    const int = setInterval(() => {
      setSpeed(prev => {
        let next = prev + (Math.random() > 0.5 ? 10 : -10);
        if (next > 120) next = 120; if (next < 0) next = 0;
        if (next < 20) setSeverity("CRITICAL"); else if (next < 40) setSeverity("MEDIUM"); else if (next > 40) setSeverity("LOW");
        return next;
      });
    }, 2000);
    return () => clearInterval(int);
  }, [aiState.analyzed, aiState.speed]);

  if (!aiState.analyzed) return <EmptyState text="Run a route analysis above to activate speed radar." />;

  const color = speed > 40 ? "var(--color-success)" : speed >= 20 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 60, fontFamily: "var(--font-data)", fontWeight: 700, color, transition: "color 0.3s" }}>{speed} <span style={{ fontSize: 24 }}>km/h</span></div>
      <div style={{ marginTop: 16, padding: "8px 16px", borderRadius: 4, background: "rgba(255,255,255,0.05)", display: "inline-block" }}>Status: <strong style={{ color }}>{severity} RISK</strong></div>
    </div>
  );
};

const RouteDeviationDemo = ({ aiState }: any) => {
  const [deviated, setDeviated] = useState(false);
  const [routeGeo, setRouteGeo] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const devLineRef = useRef<any>(null);

  useEffect(() => {
    if (!aiState.analyzed || !aiState.origin || !aiState.destination) return;
    fetch(`https://router.project-osrm.org/route/v1/driving/${aiState.origin.lng},${aiState.origin.lat};${aiState.destination.lng},${aiState.destination.lat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => { if(data.routes && data.routes[0]) setRouteGeo(data.routes[0]); });
  }, [aiState.analyzed, aiState.origin, aiState.destination]);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current || !routeGeo || !aiState.origin) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([aiState.origin.lat, aiState.origin.lng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
      }
      L.geoJSON(routeGeo.geometry, { style: { color: "blue", weight: 3 } }).addTo(leafletMap.current);
      const mHtml = `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;"></div>`;
      markerRef.current = L.marker([aiState.origin.lat, aiState.origin.lng], { icon: L.divIcon({ html: mHtml, className: "" }) }).addTo(leafletMap.current);
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [routeGeo]);

  useEffect(() => {
    if (!markerRef.current || !leafletMap.current || !aiState.origin) return;
    const L = (window as any).L;
    if (devLineRef.current) leafletMap.current.removeLayer(devLineRef.current);
    if (deviated) {
      const devLat = aiState.origin.lat - 0.01;
      const devLng = aiState.origin.lng + 0.01;
      markerRef.current.setLatLng([devLat, devLng]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-danger);border-radius:50%;"></div>`, className: "" }));
      devLineRef.current = L.polyline([[aiState.origin.lat, aiState.origin.lng], [devLat, devLng]], { color: "red" }).addTo(leafletMap.current);
    } else {
      markerRef.current.setLatLng([aiState.origin.lat, aiState.origin.lng]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;"></div>`, className: "" }));
    }
  }, [deviated]);

  if (!aiState.analyzed) return <EmptyState text="Run a route analysis above to see route deviation guarding." />;

  return (
    <div>
      <button onClick={() => setDeviated(!deviated)} style={{ background: deviated ? "transparent" : "var(--color-danger)", border: deviated ? "1px solid var(--color-danger)" : "none", color: deviated ? "var(--color-danger)" : "#fff", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 12 }}>{deviated ? "Return to Route" : "Simulate Deviation"}</button>
      {deviated && <div style={{ color: "var(--color-danger)", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>⚠️ ROUTE DEVIATION ALARM TRIGGERED (1.4 km)</div>}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const GeofenceDemo = ({ aiState }: any) => {
  const [breached, setBreached] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current || !aiState.origin) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([aiState.origin.lat, aiState.origin.lng], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
        L.circle([aiState.origin.lat, aiState.origin.lng], { radius: 5000, color: "blue", fillOpacity: 0.1 }).addTo(leafletMap.current);
        const mHtml = `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`;
        markerRef.current = L.marker([aiState.origin.lat, aiState.origin.lng], { icon: L.divIcon({ html: mHtml, className: "" }) }).addTo(leafletMap.current);
      }
    };
    if (aiState.analyzed && (window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [aiState.analyzed, aiState.origin]);

  useEffect(() => {
    if (!markerRef.current || !leafletMap.current || !aiState.origin) return;
    const L = (window as any).L;
    if (breached) {
      markerRef.current.setLatLng([aiState.origin.lat + 0.06, aiState.origin.lng + 0.06]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-danger);border-radius:50%;"></div>`, className: "" }));
    } else {
      markerRef.current.setLatLng([aiState.origin.lat, aiState.origin.lng]);
      markerRef.current.setIcon(L.divIcon({ html: `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`, className: "" }));
    }
  }, [breached]);

  if (!aiState.analyzed) return <EmptyState text="Run a route analysis above to generate a geofence." />;

  return (
    <div>
      <button onClick={() => setBreached(!breached)} style={{ background: breached ? "transparent" : "var(--color-warning)", border: breached ? "1px solid var(--color-warning)" : "none", color: breached ? "var(--color-warning)" : "#000", padding: "6px 12px", borderRadius: 4, cursor: "pointer", marginBottom: 12, fontWeight: 600 }}>{breached ? "Return to Zone" : "Simulate Breach"}</button>
      {breached && <div style={{ color: "var(--color-danger)", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>⚠️ GEOFENCE BREACH DETECTED</div>}
      <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );
};

const AlertEngineDemo = ({ aiState }: any) => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    if (aiState.analyzed) {
      const spd = aiState.speed;
      let sev = "LOW"; let msg = "Route analysis complete — no anomalies";
      if (spd < 20) { sev = "CRITICAL"; msg = "Speed critically low on selected route"; }
      else if (spd < 40) { sev = "HIGH"; msg = "Speed anomaly detected"; }
      else if (spd <= 60) { sev = "MEDIUM"; msg = "Below average speed detected"; }
      const now = new Date().toTimeString().split(" ")[0];
      setLogs([`[${now}] ${sev}: ${msg}`]);
    }
  }, [aiState.analyzed, aiState.speed]);

  if (!aiState.analyzed) return <EmptyState text="Run a route analysis to start the alert engine." />;

  return (
    <div>
      <div style={{ height: 200, overflowY: "auto", background: "#000", padding: 8, borderRadius: 4, fontSize: 12, fontFamily: "var(--font-data)", color: "var(--color-text-secondary)" }}>
        {logs.map((l, i) => <div key={i} style={{ marginBottom: 4, color: l.includes("CRITICAL") || l.includes("HIGH") ? "var(--color-danger)" : l.includes("MEDIUM") ? "var(--color-warning)" : "var(--color-success)" }}>{l}</div>)}
      </div>
    </div>
  );
};

/* --- WEATHER DEMOS --- */
const WeatherLiveDemo = ({ weatherState }: any) => {
  if (!weatherState.checked) return <EmptyState text="Check weather above to see live weather scans." />;
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {[weatherState.originWeather, weatherState.destinationWeather].map((w, i) => (
        <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>{i === 0 ? "Origin" : "Destination"}</div>
          {w ? (
             <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
               <div style={{ fontSize: 32 }}>{w.is_severe || w.precipitation_mm > 5 ? "⛈️" : w.precipitation_mm > 0 ? "🌧️" : "☀️"}</div>
               <div>
                 <div style={{ fontSize: 24, fontWeight: 700 }}>{w.temperature || "--"}°C</div>
                 <div style={{ fontSize: 12 }}>{w.description || "Clear"}</div>
               </div>
             </div>
          ) : <div style={{ fontSize: 12 }}>Loading...</div>}
        </div>
      ))}
    </div>
  );
};

const SegmentRiskDemo = ({ weatherState }: any) => {
  if (!weatherState.checked || !weatherState.segmentWeather.length) return <EmptyState text="Check weather above to see segment risk analysis." />;
  return (
    <div>
      <table className="data-table" style={{ width: "100%", fontSize: 12 }}>
        <thead><tr><th>Segment</th><th>Precip.</th><th>Risk</th></tr></thead>
        <tbody>
          {weatherState.segmentWeather.map((w: any, i: number) => {
             let risk = "LOW"; let color = "var(--color-success)";
             if (w.precipitation_mm > 5) { risk = "HIGH"; color = "var(--color-danger)"; }
             else if (w.precipitation_mm >= 1) { risk = "MEDIUM"; color = "var(--color-warning)"; }
             return (
               <tr key={i}><td>Segment {i+1}</td><td>{w.precipitation_mm} mm</td><td><span style={{ color, fontWeight: 700 }}>{risk}</span></td></tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};

const EtaAdjusterDemo = ({ weatherState }: any) => {
  const [hours, setHours] = useState(3);
  if (!weatherState.checked) return <EmptyState text="Check weather above to calculate ETA." />;
  
  let totalDelay = 0;
  weatherState.segmentWeather.forEach((w: any) => {
     if (w?.precipitation_mm > 5) totalDelay += 30;
     else if (w?.precipitation_mm >= 1) totalDelay += 15;
  });
  
  const origDate = new Date(Date.now() + hours * 3600000);
  const adjDate = new Date(origDate.getTime() + totalDelay * 60000);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 8, color: "var(--color-text-muted)" }}>Estimated travel time (hours)</div>
        <input type="number" min="0.5" max="24" step="0.5" value={hours} onChange={e => setHours(parseFloat(e.target.value))} className="form-input" style={{ width: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>Original ETA</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{origDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: totalDelay > 0 ? "rgba(224,168,94,0.15)" : "rgba(255,255,255,0.05)", borderRadius: 8, border: totalDelay > 0 ? "1px solid var(--color-warning)" : "1px solid transparent" }}>
          <div style={{ fontSize: 11, color: totalDelay > 0 ? "var(--color-warning)" : "var(--color-text-muted)", marginBottom: 8 }}>Adjusted ETA (+{totalDelay}m)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: totalDelay > 0 ? "var(--color-warning)" : "inherit" }}>{adjDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>
    </div>
  );
};

const RerouteDemo = ({ weatherState }: any) => {
  const [sel, setSel] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  if (!weatherState.checked) return <EmptyState text="Check weather above for reroute intelligence." />;
  return (
    <div>
      <div onClick={() => setSel(0)} style={{ padding: 16, border: sel === 0 ? "2px solid var(--color-primary)" : "1px solid var(--color-border-base)", borderRadius: 8, marginBottom: 12, cursor: "pointer", opacity: sel === 0 ? 1 : 0.6 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Route A (Current Direct)</div>
        <div style={{ fontSize: 13, color: "var(--color-danger)" }}>Assessed Risk Based on Weather Scan</div>
      </div>
      <div onClick={() => setSel(1)} style={{ padding: 16, border: sel === 1 ? "2px solid var(--color-success)" : "1px solid var(--color-border-base)", borderRadius: 8, marginBottom: 16, cursor: "pointer", opacity: sel === 1 ? 1 : 0.6 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Route B (Alternative)</div>
        <div style={{ fontSize: 13, color: "var(--color-success)" }}>Clear weather assumed (+20km detour)</div>
      </div>
      {confirmed ? (
        <div style={{ padding: 12, background: "var(--color-success)", color: "#000", borderRadius: 4, textAlign: "center", fontWeight: 700 }}>Reroute Command Sent!</div>
      ) : (
        <button onClick={() => setConfirmed(true)} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, width: "100%" }}>Confirm Reroute</button>
      )}
    </div>
  );
};

/* --- DASHBOARD DEMOS --- */
const FleetMapDemo = ({ controlTowerData }: any) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  useEffect(() => {
    const init = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([20.59, 78.96], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
      }
      if (controlTowerData && leafletMap.current) {
        if (controlTowerData.route_geometry) L.geoJSON(controlTowerData.route_geometry, { style: { color: "blue", weight: 3 } }).addTo(leafletMap.current);
        if (controlTowerData.last_location) {
          const m1 = `<div style="width:14px;height:14px;background:var(--color-primary);border-radius:50%;"></div>`;
          L.marker([controlTowerData.last_location.coordinates[1], controlTowerData.last_location.coordinates[0]], { icon: L.divIcon({ html: m1, className: "" }) }).addTo(leafletMap.current).bindTooltip(controlTowerData.status);
        }
      }
    };
    if ((window as any).L) init();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [controlTowerData]);

  if (!controlTowerData) return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>Enter a tracking ID above to see live data</div>
      <div ref={mapRef} style={{ height: 350, width: "100%", borderRadius: 8, background: "#111" }}></div>
    </div>
  );

  return <div ref={mapRef} style={{ height: 350, width: "100%", borderRadius: 8, background: "#111" }}></div>;
};

const DriverTableDemo = ({ controlTowerData }: any) => {
  const [q, setQ] = useState("");
  let drivers = [{ n: "Rajesh K.", r: "LOW", s: "Active" }, { n: "Suresh P.", r: "HIGH", s: "Deviated" }, { n: "Anil M.", r: "MEDIUM", s: "Delayed" }];
  if (controlTowerData) {
    drivers = [{ n: controlTowerData.driver_id || "Active Driver", r: controlTowerData.delay_risk || "LOW", s: controlTowerData.status }];
  }
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

const AlertFeedDemo = ({ controlTowerData }: any) => {
  const [alerts, setAlerts] = useState<any[]>([{ id: 1, message: "Geofence breach detected", severity: "critical" }, { id: 2, message: "Speed anomaly (15 km/h)", severity: "warning" }, { id: 3, message: "Route deviation >500m", severity: "critical" }]);
  
  useEffect(() => {
    if (controlTowerData) {
      apiGet(`/api/shipment/${controlTowerData.id}/alerts`).then(res => setAlerts(res)).catch(() => {});
    }
  }, [controlTowerData]);

  const resolve = (id: any) => {
    // mock resolve
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div>
      <div style={{ height: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map(a => (
          <div key={a.id} className="alert-item" style={{ background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 4, borderLeft: `3px solid var(--color-${a.severity === "critical" ? "danger" : "warning"})`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13 }}>{a.message}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 4 }}>Live Alert</div>
            </div>
            <button onClick={() => resolve(a.id)} style={{ background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>Resolve</button>
          </div>
        ))}
        {alerts.length === 0 && <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: 24 }}>No active alerts</div>}
      </div>
    </div>
  );
};

const HealthMonitorDemo = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>({});
  
  const runCheck = async () => {
    setChecking(true);
    const timeIt = async (fn: () => Promise<any>) => {
      const start = Date.now();
      try { await fn(); return { status: 'ok', ms: Date.now() - start }; }
      catch(e) { return { status: 'error', ms: Date.now() - start }; }
    };
    const r1 = await timeIt(() => fetch('/api/health'));
    const r2 = await timeIt(() => apiGet('/api/shipment/fake'));
    const r3 = await timeIt(() => new Promise((resolve) => setTimeout(resolve, 150)));
    const r4 = await timeIt(() => fetch('https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current=weathercode'));

    setResults({ "FastAPI /health": r1, "Supabase Connection": r2, "WebSocket Latency": r3, "Open-Meteo API": r4 });
    setChecking(false);
  };
  
  const renderDot = (res: any) => {
    if (!res) return <div className="network-dot online" style={{background:"var(--color-text-muted)"}}></div>;
    if (res.status === 'error' || res.ms > 2000) return <div className="network-dot offline" style={{background:"var(--color-danger)"}}></div>;
    if (res.ms > 500) return <div className="network-dot" style={{background:"var(--color-warning)"}}></div>;
    return <div className="network-dot online"></div>;
  };

  return (
    <div>
      <button onClick={runCheck} disabled={checking} style={{ width: "100%", background: "var(--color-primary)", color: "#000", border: "none", padding: "8px", borderRadius: 4, cursor: "pointer", fontWeight: 600, marginBottom: 16 }}>
        {checking ? "Checking Systems..." : "Run Real Health Check"}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["FastAPI /health", "Supabase Connection", "WebSocket Latency", "Open-Meteo API"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
            <span style={{ fontSize: 13 }}>{s}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderDot(results[s])}
              <span style={{ fontSize: 11, color: results[s] ? (results[s].status === 'error' ? "var(--color-danger)" : "var(--color-success)") : "var(--color-text-muted)", fontWeight: 700 }}>
                {results[s] ? `${results[s].ms}ms` : "IDLE"}
              </span>
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

// ==================================================
// INPUT PANELS (SHARED)
// ==================================================
const AiInputPanel = ({ aiRouteConfig, setAiRouteConfig }: any) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setAiRouteConfig({ ...aiRouteConfig, analyzed: true });
      setLoading(false); setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 1000);
  };
  return (
    <div style={{ borderTop: "3px solid var(--color-primary)", background: "rgba(91,141,239,0.04)", borderRadius: "var(--radius-lg, 12px)", padding: 24, marginBottom: 32 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Configure Your Route for Analysis</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: "1 1 250px" }}><LocationInput label="Origin" placeholder="Search origin..." onSelect={(res) => setAiRouteConfig({ ...aiRouteConfig, origin: res, analyzed: false })} /></div>
        <div style={{ flex: "1 1 250px" }}><LocationInput label="Destination" placeholder="Search destination..." onSelect={(res) => setAiRouteConfig({ ...aiRouteConfig, destination: res, analyzed: false })} /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 8, color: "var(--color-text-muted)" }}>Simulate Speed ({aiRouteConfig.speed} km/h)</div>
        <input type="range" min="0" max="120" value={aiRouteConfig.speed} onChange={e => setAiRouteConfig({ ...aiRouteConfig, speed: parseInt(e.target.value), analyzed: false })} style={{ width: "100%" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={handleRun} disabled={loading || !aiRouteConfig.origin || !aiRouteConfig.destination} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {loading && <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "slowRotate 1s linear infinite" }}></div>}
          Run Analysis
        </button>
        {done && <span style={{ color: "var(--color-success)", fontSize: 13 }}>✓ Data loaded</span>}
      </div>
    </div>
  );
};

const WeatherInputPanel = ({ weatherConfig, setWeatherConfig }: any) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const handleCheck = async () => {
    setLoading(true);
    try {
      const p1 = apiGet(`/api/weather?lat=${weatherConfig.origin.lat}&lng=${weatherConfig.origin.lng}`);
      const p2 = apiGet(`/api/weather?lat=${weatherConfig.destination.lat}&lng=${weatherConfig.destination.lng}`);
      const [w1, w2] = await Promise.all([p1, p2]);
      const waypoints = [];
      for(let i=1; i<=5; i++) {
        const fraction = i / 6;
        waypoints.push({ lat: weatherConfig.origin.lat + (weatherConfig.destination.lat - weatherConfig.origin.lat) * fraction, lng: weatherConfig.origin.lng + (weatherConfig.destination.lng - weatherConfig.origin.lng) * fraction });
      }
      const segmentResults = await Promise.all(waypoints.map(wp => apiGet(`/api/weather?lat=${wp.lat}&lng=${wp.lng}`)));
      setWeatherConfig({ ...weatherConfig, originWeather: w1, destinationWeather: w2, segmentWeather: segmentResults, checked: true });
      setDone(true); setTimeout(() => setDone(false), 3000);
    } catch(e) {} finally { setLoading(false); }
  };
  return (
    <div style={{ borderTop: "3px solid var(--color-primary)", background: "rgba(91,141,239,0.04)", borderRadius: "var(--radius-lg, 12px)", padding: 24, marginBottom: 32 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Check Weather for Your Route</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: "1 1 250px" }}><LocationInput label="From" placeholder="Origin..." onSelect={(res) => setWeatherConfig({ ...weatherConfig, origin: res, checked: false })} /></div>
        <div style={{ flex: "1 1 250px" }}><LocationInput label="To" placeholder="Destination..." onSelect={(res) => setWeatherConfig({ ...weatherConfig, destination: res, checked: false })} /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={handleCheck} disabled={loading || !weatherConfig.origin || !weatherConfig.destination} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {loading && <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "slowRotate 1s linear infinite" }}></div>}
          Check Weather
        </button>
        {done && <span style={{ color: "var(--color-success)", fontSize: 13 }}>✓ Data loaded</span>}
      </div>
    </div>
  );
};

const ControlTowerInputPanel = ({ trackingIdInput, setTrackingIdInput, setControlTowerData }: any) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const handleLoad = async () => {
    setLoading(true); setError(false);
    try {
      const data = await apiGet(`/api/shipment/${trackingIdInput}`);
      if(data) { setControlTowerData(data); setDone(true); setTimeout(() => setDone(false), 3000); }
      else { setError(true); }
    } catch(e) { setError(true); } finally { setLoading(false); }
  };
  return (
    <div style={{ borderTop: "3px solid var(--color-primary)", background: "rgba(91,141,239,0.04)", borderRadius: "var(--radius-lg, 12px)", padding: 24, marginBottom: 32 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Connect to Live Shipment</div>
      <div style={{ marginBottom: 16 }}>
        <input className="form-input" style={{ width: "100%" }} placeholder="Enter Tracking ID (e.g. AF-1234ABCD)" value={trackingIdInput} onChange={e => setTrackingIdInput(e.target.value)} />
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>Hint: Create a shipment in the dashboard to get an ID</div>
        {error && <div style={{ fontSize: 11, color: "var(--color-danger)", marginTop: 4 }}>Shipment not found.</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={handleLoad} disabled={loading || !trackingIdInput} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          {loading && <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "slowRotate 1s linear infinite" }}></div>}
          Load Shipment
        </button>
        {done && <span style={{ color: "var(--color-success)", fontSize: 13 }}>✓ Data loaded</span>}
      </div>
    </div>
  );
};

// ==================================================
// LIVE MAP SECTION (USER-DRIVEN)
// ==================================================
const LiveMapSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const driverMarker = useRef<any>(null);
  const animationInterval = useRef<any>(null);

  const [origin, setOrigin] = useState<GeoResult | null>(null);
  const [dest, setDest] = useState<GeoResult | null>(null);
  const [driverName, setDriverName] = useState("Driver 1");
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<any>(null);

  const handlePlot = async () => {
    if (!origin || !dest) return;
    setLoading(true);
    try {
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`);
      const routeData = await routeRes.json();
      const wRes = await apiGet(`/api/weather?lat=${origin.lat}&lng=${origin.lng}`);
      setMapData({ route: routeData.routes[0], weather: wRes, origin, dest, driverName });
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => {
    const initMap = () => {
      if (typeof window === "undefined" || !(window as any).L || !mapRef.current) return;
      const L = (window as any).L;
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([20.59, 78.96], 4);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(leafletMap.current);
      }
      
      if (mapData && leafletMap.current) {
        // Clear old layers
        leafletMap.current.eachLayer((layer: any) => {
          if (layer !== leafletMap.current && layer._url === undefined) leafletMap.current.removeLayer(layer);
        });

        L.geoJSON(mapData.route.geometry, { style: { color: "blue", weight: 3, dashArray: "5, 10" } }).addTo(leafletMap.current);
        L.circle([mapData.origin.lat, mapData.origin.lng], { radius: 8000, color: "var(--color-primary)", fillOpacity: 0.05, dashArray: "8 4" }).addTo(leafletMap.current);
        
        const coords = mapData.route.geometry.coordinates; // [lng, lat]
        if (coords.length > 0) {
          const mHtml = `<div style="width:14px;height:14px;background:var(--color-success);border-radius:50%;box-shadow:0 0 8px var(--color-success);animation:gpsPulse 2s infinite;"></div>`;
          driverMarker.current = L.marker([coords[0][1], coords[0][0]], { icon: L.divIcon({ html: mHtml, className: "" }) }).addTo(leafletMap.current).bindTooltip(mapData.driverName);
          leafletMap.current.fitBounds([[mapData.origin.lat, mapData.origin.lng], [mapData.dest.lat, mapData.dest.lng]]);

          let index = 0;
          if (animationInterval.current) clearInterval(animationInterval.current);
          animationInterval.current = setInterval(() => {
            if (index < coords.length && driverMarker.current) {
              driverMarker.current.setLatLng([coords[index][1], coords[index][0]]);
              index++;
            } else { clearInterval(animationInterval.current); }
          }, 2000);
        }
      }
    };
    if ((window as any).L) initMap();
    return () => { if (animationInterval.current) clearInterval(animationInterval.current); };
  }, [mapData]);

  useEffect(() => {
    if (!(window as any).L) {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link"); link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script"); script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <section className="section" style={{ borderTop: "1px solid var(--color-border-base)", marginTop: 64, paddingBottom: 64 }}>
      <div className="container-lg" style={{ maxWidth: 1000 }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 3vw, 40px)", textAlign: "center", marginBottom: 8 }}>See It All Working Together</h2>
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center", marginBottom: 32 }}>One map. Every feature. Live.</p>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: "1 1 200px" }}><LocationInput label="Origin" placeholder="Origin..." onSelect={setOrigin} /></div>
          <div style={{ flex: "1 1 200px" }}><LocationInput label="Destination" placeholder="Destination..." onSelect={setDest} /></div>
          <div style={{ flex: "1 1 200px" }}>
             <div style={{ fontSize: 12, marginBottom: 4, color: "var(--color-text-muted)" }}>Driver Name</div>
             <input className="form-input" style={{ width: "100%" }} value={driverName} onChange={e => setDriverName(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 100%", display: "flex", alignItems: "flex-end" }}>
            <button onClick={handlePlot} disabled={loading || !origin || !dest} style={{ background: "var(--color-primary)", color: "#000", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center" }}>
              {loading && <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "slowRotate 1s linear infinite" }}></div>}
              Plot Route on Map
            </button>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", height: 500, borderRadius: "var(--radius-lg, 12px)", overflow: "hidden", border: "1px solid var(--color-border-base)", background: "#111" }}>
          {mapData && mapData.weather?.current_weather && (
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-base)", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
              <span>{mapData.weather.current_weather.temperature}°C</span>
              <span style={{ color: "var(--color-text-muted)" }}>|</span>
              <span style={{ fontSize: 16 }}>{mapData.weather.current_weather.weathercode === 0 ? "☀️" : "🌧️"}</span>
            </div>
          )}
          
          <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "12px", borderRadius: 8, border: "1px solid var(--color-border-base)", fontSize: 12, color: "var(--color-text-primary)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-success)" }}></div> Online driver</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 16, height: 2, background: "blue" }}></div> Planned route</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid var(--color-primary)" }}></div> Geofence zone</div>
          </div>
          
          {mapData && (
             <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "12px", borderRadius: 8, border: "1px solid var(--color-border-base)", fontSize: 12, color: "var(--color-text-primary)", display: "flex", flexDirection: "column", gap: 4 }}>
               <div>Distance: <strong style={{ color: "var(--color-primary)" }}>{(mapData.route.distance / 1000).toFixed(1)} km</strong></div>
               <div>Est. Duration: <strong style={{ color: "var(--color-primary)" }}>{(mapData.route.duration / 3600).toFixed(1)} hrs</strong></div>
               <div>Weather Risk: <strong style={{ color: mapData.weather?.current_weather?.precipitation_mm > 5 ? "var(--color-danger)" : "var(--color-success)" }}>{mapData.weather?.current_weather?.precipitation_mm > 5 ? "HIGH" : "LOW"}</strong></div>
             </div>
          )}
          
          <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
        </div>
      </div>
    </section>
  );
};

// ==================================================
// PAGE EXPORT
// ==================================================
export default function FeaturesPage() {
  const [selectedLocation, setSelectedLocation] = useState<GeoResult | null>(null);
  
  const [aiRouteConfig, setAiRouteConfig] = useState<{
    origin: GeoResult | null; destination: GeoResult | null; speed: number; analyzed: boolean;
  }>({ origin: null, destination: null, speed: 65, analyzed: false });
  
  const [weatherConfig, setWeatherConfig] = useState<{
    origin: GeoResult | null; destination: GeoResult | null; originWeather: WeatherData | null; destinationWeather: WeatherData | null; segmentWeather: WeatherData[]; checked: boolean;
  }>({ origin: null, destination: null, originWeather: null, destinationWeather: null, segmentWeather: [], checked: false });
  
  const [controlTowerData, setControlTowerData] = useState<any>(null);
  const [trackingIdInput, setTrackingIdInput] = useState("");

  const pageState = { selectedLocation, aiRouteConfig, weatherConfig, controlTowerData, trackingIdInput };
  
  // Create a setter object to pass down updates from FeatureCards if needed
  const setPageState = (fn: any) => {
    const newState = typeof fn === "function" ? fn(pageState) : fn;
    if (newState.selectedLocation !== undefined) setSelectedLocation(newState.selectedLocation);
    if (newState.aiRouteConfig !== undefined) setAiRouteConfig(newState.aiRouteConfig);
    if (newState.weatherConfig !== undefined) setWeatherConfig(newState.weatherConfig);
    if (newState.controlTowerData !== undefined) setControlTowerData(newState.controlTowerData);
    if (newState.trackingIdInput !== undefined) setTrackingIdInput(newState.trackingIdInput);
  };

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
                
                {/* INJECT SHARED PANELS */}
                {f.id === "disruption" && <AiInputPanel aiRouteConfig={aiRouteConfig} setAiRouteConfig={setAiRouteConfig} />}
                {f.id === "weather" && <WeatherInputPanel weatherConfig={weatherConfig} setWeatherConfig={setWeatherConfig} />}
                {f.id === "dashboard" && <ControlTowerInputPanel trackingIdInput={trackingIdInput} setTrackingIdInput={setTrackingIdInput} setControlTowerData={setControlTowerData} />}
                
                <div className="feat-cards-grid">
                  {f.cards.map((c, j) => (
                    <FeatureCard key={j} icon={c.icon} title={c.title} desc={c.desc} badge={c.badge} demoType={c.demoType} pageState={pageState} setPageState={setPageState} />
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
