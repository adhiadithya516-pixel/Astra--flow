"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Note: Next.js metadata is not supported in "use client" components directly.
// It should be moved to a layout.tsx if SEO is required for this route.

const features = [
  { id: "tracking", title: "Real-Time GPS Tracking", icon: "📍", desc: "Every driver, every second. High-precision live location updates utilizing native web APIs and advanced predictive algorithms to ensure you never lose sight of a shipment.", details: [] },
  { id: "disruption", title: "AI Disruption Detection", icon: "🧠", desc: "ML models analyze speed, location, and route compliance in real time.", details: ["Speed drop detection", "Route deviation alerts (>500m)", "Geofence breach detection", "Alert severity: LOW → MEDIUM → HIGH → CRITICAL"] },
  { id: "weather", title: "Weather-Aware Routing", icon: "🌦️", desc: "Open-Meteo data overlaid on every route segment with risk scores and ETA adjustments.", details: ["Per-segment weather risk scoring", "Automatic ETA adjustment for rain", "Proactive rerouting for severe weather", "Visual weather overlays on map"] },
  { id: "dashboard", title: "Control Tower Dashboard", icon: "📡", desc: "Unified real-time view — WebSocket-powered, no page refresh needed.", details: ["Real-time driver markers", "Risk-scored driver table with live search", "Alert feed with severity color coding", "System health monitoring"] },
];

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
        <div className="feat-card-icon">{icon}</div>
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
 * DEMO COMPONENTS
 * ================================================== */
const DemoContent = ({ type }: { type: string }) => {
  if (type === "live-location") return <LiveLocationDemo />;
  if (type === "signal-relay") return <SignalRelayDemo />;
  if (type === "location-memory") return <LocationMemoryDemo />;
  if (type === "offline-buffer") return <OfflineBufferDemo />;
  if (type === "path-prediction") return <PathPredictionDemo />;
  return <GenericDemo type={type} />;
};

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
        maxZoom: 19,
        attribution: "© OpenStreetMap"
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
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => ping();
      document.body.appendChild(script);
    } else {
      ping();
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
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

  const loadMemory = () => {
    try {
      const data = JSON.parse(localStorage.getItem("astra_gps_log") || "[]");
      setPings(data);
    } catch { setPings([]); }
  };

  useEffect(() => {
    loadMemory();
    window.addEventListener("storage", loadMemory);
    return () => window.removeEventListener("storage", loadMemory);
  }, []);

  const clearMemory = () => {
    localStorage.removeItem("astra_gps_log");
    loadMemory();
  };

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
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{new Date(p.timestamp).toLocaleTimeString()}</td>
                  <td>{p.lat.toFixed(4)}</td>
                  <td>{p.lng.toFixed(4)}</td>
                  <td>{Math.round(p.acc)}m</td>
                </tr>
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
    if (isOffline) {
      const int = setInterval(() => setBuffer(b => b + 1), 2000);
      return () => clearInterval(int);
    } else if (buffer > 0) {
      setBuffer(0);
    }
  }, [isOffline, buffer]);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button 
          onClick={() => setIsOffline(!isOffline)}
          style={{ background: isOffline ? "var(--color-success)" : "var(--color-danger)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 12 }}
        >
          {isOffline ? "Reconnect Network" : "Simulate Offline Mode"}
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: isOffline ? "var(--color-danger)" : "var(--color-success)" }}>
          {isOffline ? "OFFLINE" : "ONLINE"}
        </span>
      </div>
      
      <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Buffered Pings Pending Sync</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-data)", color: buffer > 0 ? "var(--color-warning)" : "var(--color-text-secondary)" }}>
          {buffer}
        </div>
        {buffer > 0 && <div style={{ fontSize: 12, color: "var(--color-warning)", marginTop: 8 }}>Will sync automatically upon reconnection.</div>}
        {!isOffline && buffer === 0 && <div style={{ fontSize: 12, color: "var(--color-success)", marginTop: 8 }}>All data synced successfully.</div>}
      </div>
    </div>
  );
};

const PathPredictionDemo = () => {
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        When the GPS signal drops, the Kalman filter uses the last known velocity and heading to project the driver's path.
      </p>
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
};

const GenericDemo = ({ type }: { type: string }) => {
  return (
    <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>
      <div style={{ fontSize: 24, marginBottom: 12 }}>✨</div>
      <p style={{ fontSize: 14 }}>Interactive demo for {type} is currently active and monitoring.</p>
    </div>
  );
};

/* ==================================================
 * PAGE EXPORT
 * ================================================== */
export default function FeaturesPage() {
  const otherFeatures = features.slice(1);

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
          {/* CUSTOM GPS TRACKING SECTION */}
          <section id="tracking" className="section reveal" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
            <div>
              <div className="feat-section-icon-wrapper">
                📍
                <div className="feat-section-icon-ring"></div>
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.2rem, 4vw, 48px)", fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Real-Time GPS Tracking</h2>
              <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: 16, textAlign: "center", maxWidth: 800, margin: "0 auto 48px auto" }}>
                Every driver, every second. High-precision live location updates utilizing native web APIs and advanced predictive algorithms to ensure you never lose sight of a shipment.
              </p>

              <div className="feat-cards-grid">
                <FeatureCard 
                  icon="🌐" 
                  title="Live Location Engine" 
                  desc="Pinpoints every driver instantly, no setup required" 
                  badge="ALWAYS ON" 
                  demoType="live-location" 
                />
                <FeatureCard 
                  icon="⚡" 
                  title="Instant Signal Relay" 
                  desc="Location data reaches the dashboard in milliseconds" 
                  badge="LIVE" 
                  demoType="signal-relay" 
                />
                <FeatureCard 
                  icon="🐘" 
                  title="Smart Location Memory" 
                  desc="Every route recorded and queryable on a map grid" 
                  badge="AUTO SYNC" 
                  demoType="location-memory" 
                />
                <FeatureCard 
                  icon="💾" 
                  title="Offline Journey Buffer" 
                  desc="Stores the route locally when signal drops, syncs on return" 
                  badge="OFFLINE SAFE" 
                  demoType="offline-buffer" 
                />
                <FeatureCard 
                  icon="🧮" 
                  title="Smooth Path Prediction" 
                  desc="Fills in the gaps when GPS signal is temporarily lost" 
                  badge="AI ASSIST" 
                  demoType="path-prediction" 
                />
              </div>
            </div>
          </section>

          {/* DYNAMIC REMAINING SECTIONS */}
          {otherFeatures.map((f, i) => (
            <section key={f.id} id={f.id} className="section reveal" style={{ borderBottom: i < otherFeatures.length - 1 ? "1px solid var(--color-border-base)" : "none" }}>
              <div>
                <div className="feat-section-icon-wrapper">
                  {f.icon}
                  <div className="feat-section-icon-ring"></div>
                </div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.2rem, 4vw, 48px)", fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{f.title}</h2>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: 16, textAlign: "center", maxWidth: 800, margin: "0 auto 48px auto" }}>{f.desc}</p>
                
                <div className="feat-cards-grid">
                  {f.details.map((d, j) => (
                    <FeatureCard 
                      key={j}
                      icon="✨" 
                      title={d} 
                      desc="" 
                      badge="" 
                      demoType={`generic-${f.id}-${j}`} 
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
