"use client";
import Link from "next/link";

const productLinks = [
  { label: "Real-Time Tracking", href: "/features#tracking" },
  { label: "Disruption Detection", href: "/features#disruption" },
  { label: "Route Optimization", href: "/features#routing" },
  { label: "Control Tower", href: "/dashboard" },
];
const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Industries", href: "/industries" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border-base)",
        background: "var(--color-bg-surface)",
      }}
    >
      <div
        className="container-lg"
        style={{ paddingTop: 72, paddingBottom: 72 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
            gap: 48,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  boxShadow: "0 0 8px var(--color-primary-glow)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                }}
              >
                ASTRA
                <span style={{ color: "var(--color-primary)", marginLeft: 3 }}>
                  FLOW
                </span>
              </span>
            </div>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: 14,
                lineHeight: 1.75,
                maxWidth: 280,
              }}
            >
              AI-powered supply chain intelligence. Real-time visibility,
              proactive disruption detection, and smarter routing.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-data)",
                fontWeight: 500,
                marginBottom: 18,
              }}
            >
              Product
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-data)",
                fontWeight: 500,
                marginBottom: 18,
              }}
            >
              Company
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-data)",
                fontWeight: 500,
                marginBottom: 18,
              }}
            >
              Get in Touch
            </h4>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 14,
                color: "var(--color-text-secondary)",
              }}
            >
              <li>Bengaluru, India</li>
              <li>team@astraflow.io</li>
              <li style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Response within 24 hours
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--color-border-base)" }}>
        <div
          className="container-lg"
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-data)",
          }}
        >
          <span>© {new Date().getFullYear()} Astra Flow. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Terms</span>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .footer-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:480px){
          .footer-grid{grid-template-columns:1fr !important;}
        }
      `}</style>
    </footer>
  );
}
