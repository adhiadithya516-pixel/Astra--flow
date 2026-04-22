"use client";
import Link from "next/link";

const industries = [
  { icon: "🍎", title: "Food & Perishables", desc: "Cold chain monitoring, freshness windows, priority routing" },
  { icon: "🧬", title: "Life Sciences", desc: "Pharma cold chain, compliance tracking, audit trails" },
  { icon: "⚗️", title: "Chemicals & Hazmat", desc: "Safety routing, regulatory compliance overlays" },
  { icon: "🐾", title: "Animals & Organisms", desc: "Live cargo monitoring, welfare alerts, duration limits" },
  { icon: "🏭", title: "Industrial & Manufacturing", desc: "JIT delivery, supplier risk scoring, production impact" },
  { icon: "🛢️", title: "Energy & Resources", desc: "Bulk logistics, remote site delivery, weather exposure" },
];

export default function IndustriesSection() {
  return (
    <section className="section">
      <div className="container-lg">
        <div className="section-header reveal">
          <div className="label-tag">Industries</div>
          <h2>Powering Supply Chains Across Every Critical Industry</h2>
          <div className="thin-rule" />
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div className="hscroll-wrapper reveal reveal-delay-2">
        <div className="hscroll-track">
          {industries.map((ind, i) => (
            <div key={i} className="card" style={{ cursor: "default" }}>
              <div style={{ fontSize: 36, marginBottom: 18, opacity: 0.8 }}>
                {ind.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                  fontWeight: 400,
                  marginBottom: 8,
                }}
              >
                {ind.title}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                {ind.desc}
              </p>
              <Link
                href="/industries"
                style={{
                  color: "var(--color-accent)",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "var(--font-data)",
                  letterSpacing: "0.03em",
                }}
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
