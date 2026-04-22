"use client";

const features = [
  {
    icon: "📍",
    title: "Real-Time GPS Tracking",
    desc: "Sub-meter accuracy with 10-second ping intervals and automatic dead reckoning prediction.",
  },
  {
    icon: "🧠",
    title: "AI Disruption Detection",
    desc: "ML-powered anomaly detection for speed drops, route deviations, and unusual stop patterns.",
  },
  {
    icon: "🛤️",
    title: "Dynamic Route Optimization",
    desc: "Graph-based routing with live reroute recommendations based on real-time conditions.",
  },
  {
    icon: "🌦️",
    title: "Weather-Aware Routing",
    desc: "Per-segment weather risk scoring with automatic ETA adjustment for adverse conditions.",
  },
  {
    icon: "📱",
    title: "Barcode & QR Scanning",
    desc: "Scan events for delivery confirmation, chain of custody tracking, and proof of delivery.",
  },
  {
    icon: "📡",
    title: "Control Tower Dashboard",
    desc: "Unified real-time view for all active drivers, shipments, alerts, and risk assessments.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section" style={{ background: "var(--color-bg-surface)" }}>
      <div className="container-lg">
        <div className="section-header reveal">
          <div className="label-tag">Capabilities</div>
          <h2>Built for the Complexity of Modern Logistics</h2>
          <div className="thin-rule" />
          <p>
            Every feature designed for operations teams who need precision,
            speed, and reliability.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className={`card reveal reveal-delay-${(i % 3) + 1}`}
              style={{ cursor: "default" }}
            >
              <div style={{ fontSize: 28, marginBottom: 18, opacity: 0.85 }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 400,
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.75,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
