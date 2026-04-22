"use client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
const stats = [
  { label: "Active Shipments Monitored", value: 12400, suffix: "+" },
  { label: "Average Alert Response Time", value: 340, suffix: "ms" },
  { label: "On-Time Delivery Improvement", value: 94.7, suffix: "%", decimals: 1 },
  { label: "Countries Covered", value: 63, suffix: "" },
];
export default function StatsBar() {
  return (
    <section style={{ background: "var(--color-bg-card)", borderTop: "1px solid var(--color-border-base)", borderBottom: "1px solid var(--color-border-base)", padding: "56px 0" }}>
      <div className="container-lg">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, textAlign: "center" }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 36, fontWeight: 500, marginBottom: 6 }}>
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", fontFamily: "var(--font-data)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
