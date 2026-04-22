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
        <div className="section-header"><h2>Powering Supply Chains Across Every Critical Industry</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {industries.map((ind, i) => (
            <div key={i} className="card" style={{ cursor: "default" }}>
              <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8 }}>{ind.icon}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{ind.title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>{ind.desc}</p>
              <Link href="/industries" style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 500 }}>Learn More →</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
