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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
        height: 64,
        display: "flex",
        alignItems: "center",
        background: scrolled
          ? "rgba(10,13,20,0.88)"
          : "rgba(10,13,20,0.5)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: scrolled
          ? "1px solid var(--color-border-base)"
          : "1px solid transparent",
        transition: "all 0.4s var(--ease-out)",
      }}
    >
      <div
        className="container-lg"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            className="live-pulse blue"
            style={{ width: 7, height: 7 }}
          />
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            ASTRA
            <span
              style={{ color: "var(--color-primary)", marginLeft: 3 }}
            >
              FLOW
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
          className="nav-desktop"
        >
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  fontWeight: active ? 500 : 400,
                  color: active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                  borderBottom: active
                    ? "1.5px solid var(--color-accent)"
                    : "1.5px solid transparent",
                  paddingBottom: 3,
                  transition: "all 0.2s",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={toggle}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{ fontSize: 12, padding: "7px 16px" }}
          >
            Control Tower
          </Link>
          <button
            className="nav-mobile-toggle"
            onClick={() => setOpen(!open)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--color-text-primary)",
              fontSize: 22,
              cursor: "pointer",
              padding: 4,
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10,13,20,0.97)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            zIndex: 9998,
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 26,
                color:
                  pathname === l.href
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
              }}
            >
              {l.label}
            </Link>
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
