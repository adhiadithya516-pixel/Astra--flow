import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Industries — Astra Flow", description: "Built for the industries that cannot afford to fail." };
const industries = [
  { icon: "🍎", title: "Food & Perishables", stat: "Cold chain failures cost $35B annually", features: ["Real-time temperature monitoring", "Freshness window countdown", "Priority routing for perishables", "Temperature excursion alerts"] },
  { icon: "🧬", title: "Life Sciences", stat: "Pharma logistics market: $112B by 2027", features: ["Compliance documentation and audit trails", "Cold chain verification", "Chain of custody via barcode/QR scanning", "Regulatory zone-aware routing"] },
  { icon: "⚗️", title: "Chemicals & Hazmat", stat: "Hazmat incidents cost $2.3B annually", features: ["Hazmat route validation", "Safety corridor routing", "Emergency protocol triggers", "Regulatory compliance overlays"] },
  { icon: "🐾", title: "Animals & Living Organisms", stat: "Live animal transport: $34.5B market", features: ["Transit duration monitoring", "Welfare check stop detection", "Temperature and ventilation alerts", "Veterinary stop scheduling"] },
  { icon: "🏭", title: "Industrial & Manufacturing", stat: "JIT failures cost manufacturers $1.1T", features: ["JIT window tracking with precision ETA", "Supplier risk scoring", "Production line impact alerts", "Multi-supplier coordination"] },
  { icon: "🛢️", title: "Energy & Resources", stat: "Remote logistics adds 40-60% to costs", features: ["Remote site routing", "Weather risk assessment", "ETA reliability scoring", "Bulk cargo optimization"] },
];
export default function IndustriesPage() {
  return (
    <><Navbar /><main className="page-shell">
      <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 20 }}>Built for the Industries That Cannot Afford to Fail</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 18, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>From food safety to pharma compliance to hazmat routing — Astra Flow adapts to your industry&apos;s specific challenges.</p>
        </div>
      </section>
      <div className="container-lg" style={{ paddingTop: 32, paddingBottom: 64 }}>
        {industries.map((ind, i) => (
          <section key={i} style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 40, paddingTop: 64, paddingBottom: 64, borderBottom: i < industries.length - 1 ? "1px solid var(--color-border-base)" : "none", alignItems: "start" }} className="ind-cols">
            <div>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-bg-card)", border: "1px solid var(--color-border-base)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20 }}>{ind.icon}</div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{ind.title}</h2>
              <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 6, fontFamily: "var(--font-data)", fontSize: 13, fontWeight: 500, color: "var(--color-primary)", background: "var(--color-primary-glow)", marginBottom: 20 }}>{ind.stat}</div>
            </div>
            <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-base)", borderRadius: 12, padding: 28 }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-primary)", fontWeight: 500, marginBottom: 20 }}>ASTRA FLOW FEATURES</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                {ind.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 700, flexShrink: 0 }}>✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <style>{`@media(max-width:768px){.ind-cols{grid-template-columns:1fr !important;}}`}</style>
    </main><Footer /></>
  );
}
