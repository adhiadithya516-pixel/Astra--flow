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
                <div className="feat-card-item">
                  <div className="feat-card-icon">🌐</div>
                  <div className="gps-feature-pill-content">
                    <span className="gps-feature-pill-name">Live Location Engine</span>
                    <span className="gps-feature-pill-desc">Pinpoints every driver instantly, no setup required</span>
                  </div>
                  <span className="gps-badge">ALWAYS ON</span>
                </div>
                <div className="feat-card-item">
                  <div className="feat-card-icon">⚡</div>
                  <div className="gps-feature-pill-content">
                    <span className="gps-feature-pill-name">Instant Signal Relay</span>
                    <span className="gps-feature-pill-desc">Location data reaches the dashboard in milliseconds</span>
                  </div>
                  <span className="gps-badge">LIVE</span>
                </div>
                <div className="feat-card-item">
                  <div className="feat-card-icon">🐘</div>
                  <div className="gps-feature-pill-content">
                    <span className="gps-feature-pill-name">Smart Location Memory</span>
                    <span className="gps-feature-pill-desc">Every route recorded and queryable on a map grid</span>
                  </div>
                  <span className="gps-badge">AUTO SYNC</span>
                </div>
                <div className="feat-card-item">
                  <div className="feat-card-icon">💾</div>
                  <div className="gps-feature-pill-content">
                    <span className="gps-feature-pill-name">Offline Journey Buffer</span>
                    <span className="gps-feature-pill-desc">Stores the route locally when signal drops, syncs on return</span>
                  </div>
                  <span className="gps-badge">OFFLINE SAFE</span>
                </div>
                <div className="feat-card-item">
                  <div className="feat-card-icon">🧮</div>
                  <div className="gps-feature-pill-content">
                    <span className="gps-feature-pill-name">Smooth Path Prediction</span>
                    <span className="gps-feature-pill-desc">Fills in the gaps when GPS signal is temporarily lost</span>
                  </div>
                  <span className="gps-badge">AI ASSIST</span>
                </div>
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
                    <div key={j} className="feat-card-item">
                      <div className="feat-card-icon">✨</div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                        {d}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        <style>{`@media(max-width:768px){.feat-cols{grid-template-columns:1fr !important;}}`}</style>
      </main>
      <Footer />
    </>
  );
}
