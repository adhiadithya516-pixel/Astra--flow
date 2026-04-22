import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Features — Astra Flow", description: "Real-time GPS, AI disruption detection, weather-aware routing, and a unified control tower." };
const features = [
  { id: "tracking", title: "Real-Time GPS Tracking", icon: "📍", desc: "Every driver, every second. GPS via browser Geolocation API, Socket.IO transport, Supabase storage.", details: ["10-second ping intervals", "Dead reckoning prediction", "Offline ping buffering in IndexedDB", "Visual distinction between confirmed and predicted positions"] },
  { id: "disruption", title: "AI Disruption Detection", icon: "🧠", desc: "ML models analyze speed, location, and route compliance in real time.", details: ["Speed drop detection", "Route deviation alerts (>500m)", "Geofence breach detection", "Alert severity: LOW → MEDIUM → HIGH → CRITICAL"] },
  { id: "weather", title: "Weather-Aware Routing", icon: "🌦️", desc: "Open-Meteo data overlaid on every route segment with risk scores and ETA adjustments.", details: ["Per-segment weather risk scoring", "Automatic ETA adjustment for rain", "Proactive rerouting for severe weather", "Visual weather overlays on map"] },
  { id: "dashboard", title: "Control Tower Dashboard", icon: "📡", desc: "Unified real-time view — WebSocket-powered, no page refresh needed.", details: ["Real-time driver markers", "Risk-scored driver table with live search", "Alert feed with severity color coding", "System health monitoring"] },
];
export default function FeaturesPage() {
  return (
    <><Navbar /><main className="page-shell">
      <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 20 }}>Everything Your Operations Team Needs</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>Integrated capabilities that transform reactive logistics into proactive intelligence.</p>
        </div>
      </section>
      <div className="container-lg" style={{ maxWidth: 1000 }}>
        {features.map((f, i) => (
          <section key={f.id} id={f.id} className="section" style={{ borderBottom: i < features.length - 1 ? "1px solid var(--color-border-base)" : "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="feat-cols">
              <div><div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div><h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{f.title}</h2><p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p></div>
              <div className="card-flat"><div style={{ fontFamily: "var(--font-data)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: 16 }}>Key Capabilities</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {f.details.map((d, j) => (<li key={j} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--color-text-secondary)" }}><span style={{ color: "var(--color-primary)", fontWeight: 700 }}>→</span><span>{d}</span></li>))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
      <style>{`@media(max-width:768px){.feat-cols{grid-template-columns:1fr !important;}}`}</style>
    </main><Footer /></>
  );
}
