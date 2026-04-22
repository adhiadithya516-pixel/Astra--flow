"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Industries", href: "/industries" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, width: "100%", zIndex: 9999,
      height: 68, display: "flex", alignItems: "center",
      background: scrolled ? "rgba(7,9,13,0.92)" : "rgba(7,9,13,0.85)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      transition: "background 200ms",
    }}>
      <div className="container-lg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="live-pulse blue" style={{ width: 8, height: 8 }} />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>
            ASTRA<span style={{ color: "var(--color-primary)", marginLeft: 4 }}>FLOW</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }} className="nav-desktop">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "var(--font-body)", fontSize: 14, letterSpacing: "0.04em",
              color: pathname === l.href ? "#fff" : "var(--color-text-secondary)",
              borderBottom: pathname === l.href ? "2px solid var(--color-primary)" : "2px solid transparent",
              paddingBottom: 4, transition: "all 150ms",
            }}>{l.label}</Link>
          ))}
        </div>

        {/* CTA + Mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/tracking" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 18px" }}>
            Control Tower
          </Link>
          <button className="nav-mobile-toggle" onClick={() => setOpen(!open)} style={{
            display: "none", background: "none", border: "none", color: "#fff",
            fontSize: 24, cursor: "pointer", padding: 4,
          }}>{open ? "✕" : "☰"}</button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, bottom: 0,
          background: "rgba(5,8,16,0.97)", backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 32, zIndex: 9998,
        }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 600,
              color: pathname === l.href ? "#fff" : "var(--color-text-secondary)",
            }}>{l.label}</Link>
          ))}
        </div>
      )}
      <style>{`
        @media(max-width:768px){
          .nav-desktop{display:none !important;}
          .nav-mobile-toggle{display:block !important;}
        }
      `}</style>
    </nav>
  );
}
