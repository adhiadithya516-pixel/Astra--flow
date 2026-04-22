import Link from "next/link";
export default function CTABanner() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--gradient-hero)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "var(--gradient-glow-blue)", borderRadius: "50%", filter: "blur(40px)" }} />
      <div className="container-lg" style={{ position: "relative", zIndex: 1, padding: "96px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, marginBottom: 16 }}>
          Ready to See Your Supply Chain <span style={{ color: "var(--color-primary)" }}>Live</span>?
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px", fontSize: 16, lineHeight: 1.7 }}>
          Join logistics teams using Astra Flow to prevent delays before they happen.
        </p>
        <Link href="/contact" className="btn btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>Start Free — No Credit Card</Link>
      </div>
    </section>
  );
}
