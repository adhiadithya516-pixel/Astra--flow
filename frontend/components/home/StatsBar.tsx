"use client";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const stats = [
  { label: "Active Shipments", value: 12400, suffix: "+" },
  { label: "Alert Response", value: 340, suffix: "ms" },
  { label: "On-Time Rate", value: 94.7, suffix: "%", decimals: 1 },
  { label: "Countries", value: 63, suffix: "" },
];

export default function StatsBar() {
  return (
    <section
      style={{
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-base)",
        borderBottom: "1px solid var(--color-border-base)",
        padding: "52px 0",
      }}
    >
      <div className="container-lg">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 32,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1}`}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 38,
                  fontWeight: 400,
                  marginBottom: 6,
                  color: "var(--color-text-primary)",
                }}
              >
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals || 0}
                />
              </div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-data)",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
