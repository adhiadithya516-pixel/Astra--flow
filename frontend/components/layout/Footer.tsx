"use client";
import Link from "next/link";

const productLinks = [
  { label: "Real-Time Tracking", href: "/features#tracking" },
  { label: "Disruption Detection", href: "/features#disruption" },
  { label: "Route Optimization", href: "/features#routing" },
  { label: "Control Tower", href: "/tracking" },
];
const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Industries", href: "/industries" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border-base)", background: "var(--color-bg-surface)" }}>
      <div className="container-lg" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", boxShadow: "0 0 8px var(--color-primary-glow)" }} />
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700 }}>
                ASTRA<span style={{ color: "var(--color-primary)", marginLeft: 4 }}>FLOW</span>
              </span>
            </div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
              AI-powered supply chain intelligence. Real-time visibility, proactive disruption detection, and smarter routing.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", fontFamily: "var(--font-data)", fontWeight: 500, marginBottom: 16 }}>Product</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {productLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", fontFamily: "var(--font-data)", fontWeight: 500, marginBottom: 16 }}>Company</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {companyLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", fontFamily: "var(--font-data)", fontWeight: 500, marginBottom: 16 }}>Get in Touch</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--color-text-secondary)" }}>
              <li>📍 Bengaluru, India</li>
              <li>📧 team@astraflow.io</li>
              <li>🕐 Response within 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ paddingTop: 16, paddingBottom: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-data)" }}>
          <span>© {new Date().getFullYear()} Astra Flow. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ cursor: "pointer" }}>Privacy Policy</span>
            <span style={{ cursor: "pointer" }}>Terms of Service</span>
          </div>
        </div>
      </div>
      <style>{`.footer-link{font-size:14px;color:var(--color-text-secondary);transition:color 150ms;}.footer-link:hover{color:var(--color-primary);}`}</style>
    </footer>
  );
}
