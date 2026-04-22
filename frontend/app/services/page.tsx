import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Services — Astra Flow", description: "What Astra Flow does for you." };
const services = [
  { title: "Real-Time GPS Tracking", icon: "📍", desc: "Continuous driver location monitoring with 10-second intervals. Dead reckoning fills gaps during outages." },
  { title: "Disruption Detection & Alerts", icon: "⚠️", desc: "AI-powered anomaly detection with four severity tiers and automated escalation." },
  { title: "Dynamic Route Optimization", icon: "🛤️", desc: "Graph-based routing considering distance, traffic, weather, and road restrictions." },
  { title: "Weather-Aware Routing", icon: "🌦️", desc: "Per-segment weather risk scores with automatic ETA adjustment." },
  { title: "Control Tower Dashboard", icon: "📡", desc: "Unified real-time view — WebSocket-powered with no page refresh." },
  { title: "API & Integration Layer", icon: "🔌", desc: "RESTful API and WebSocket subscriptions for enterprise integration." },
];
export default function ServicesPage() {
  return (
    <><Navbar /><main className="page-shell">
      <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 20 }}>What Astra Flow Does For You</h1>
        </div>
      </section>
      <div className="container-lg section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {services.map((s, i) => (
            <div key={i} className="card" style={{ cursor: "default" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/contact" className="btn btn-primary">Get in Touch →</Link>
        </div>
      </div>
    </main><Footer /></>
  );
}
