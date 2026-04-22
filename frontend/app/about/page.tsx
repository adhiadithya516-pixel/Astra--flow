import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "About Us — Astra Flow", description: "We built Astra Flow because delays cost everyone." };
export default function AboutPage() {
  return (
    <><Navbar /><main className="page-shell">
      <section className="section"><div className="container-lg" style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 20 }}>We Built Astra Flow Because Delays Cost Everyone</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 18, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>Every late shipment cascades into lost revenue, spoiled goods, broken trust, and wasted resources. We believe logistics teams deserve real-time intelligence — not spreadsheets and phone calls.</p>
      </div></section>
      <section className="section" style={{ background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center", maxWidth: 600 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, marginBottom: 32 }}>Built With</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
            {["Next.js", "FastAPI", "Socket.IO", "Supabase", "Leaflet", "Upstash Redis"].map((t) => (
              <div key={t} style={{ padding: "12px 16px", background: "var(--color-bg-card)", border: "1px solid var(--color-border-base)", borderRadius: 8, fontFamily: "var(--font-data)", fontSize: 13, color: "var(--color-text-secondary)" }}>{t}</div>
            ))}
          </div>
        </div>
      </section>
    </main><Footer /></>
  );
}
