"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
const HeroMap = dynamic(() => import("@/components/HeroMap"), { ssr: false });

export default function HeroSection() {
  return (
    <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}><HeroMap /></div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(5,8,16,0.55) 0%, rgba(5,8,16,0.80) 60%, rgba(5,8,16,1) 100%)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2, textAlign: "center", width: "100%", maxWidth: 800, padding: "0 24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
          <span>Track Everything.</span><br />
          <span style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Predict the Rest.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px" }}>
          Astra Flow gives logistics teams real-time visibility, AI-powered disruption detection, and proactive rerouting — before delays happen.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/tracking" className="btn btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>Enter Control Tower →</Link>
          <button className="btn btn-secondary" style={{ fontSize: 15, padding: "14px 32px" }}>Watch How It Works</button>
        </div>
      </div>
    </section>
  );
}
