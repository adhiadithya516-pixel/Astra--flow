"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const HeroMap = dynamic(() => import("@/components/HeroMap"), { ssr: false });

function useTypewriter(phrases: string[], speed = 70, pause = 2200) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    const timeout = deleting ? speed / 2 : speed;

    if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
      return;
    }
    const t = setTimeout(() => {
      setCharIdx((c) => c + (deleting ? -1 : 1));
      setText(current.substring(0, charIdx + (deleting ? -1 : 1)));
    }, timeout);
    return () => clearTimeout(t);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return text;
}

export default function HeroSection() {
  const typed = useTypewriter([
    "Predict the Rest.",
    "Prevent Delays.",
    "Protect Revenue.",
  ]);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    const h = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0002})`;
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Parallax map background */}
      <div
        ref={parallaxRef}
        style={{
          position: "absolute",
          inset: "-10%",
          zIndex: 0,
          willChange: "transform",
        }}
      >
        <HeroMap />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(10,13,20,0.45) 0%, rgba(10,13,20,0.75) 50%, rgba(10,13,20,1) 100%)",
        }}
      />

      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "15%",
          width: 500,
          height: 400,
          background: "var(--gradient-glow-warm)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 1,
        }}
      />

      {/* Content — intentionally left-aligned for asymmetry */}
      <div
        className="container-lg"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: 80,
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div className="label-tag reveal">Supply Chain Intelligence</div>

          <h1
            className="reveal reveal-delay-1"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 6.5vw, 68px)",
              fontWeight: 400,
              lineHeight: 1.08,
              marginBottom: 12,
            }}
          >
            Track Everything.
          </h1>
          <h1
            className="reveal reveal-delay-2"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 6.5vw, 68px)",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.08,
              marginBottom: 28,
              color: "var(--color-primary)",
            }}
          >
            {typed}
            <span className="typewriter-cursor" />
          </h1>

          <div className="thin-rule reveal reveal-delay-3" />

          <p
            className="reveal reveal-delay-3"
            style={{
              fontSize: 17,
              color: "var(--color-text-secondary)",
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: 40,
            }}
          >
            Astra Flow gives logistics teams real-time visibility,
            AI&#8209;powered disruption detection, and proactive rerouting
            — before delays happen.
          </p>

          <div
            className="reveal reveal-delay-4"
            style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
          >
            <Link
              href="/dashboard"
              className="btn btn-primary magnetic-btn"
              style={{ fontSize: 14, padding: "13px 28px" }}
            >
              Enter Control Tower →
            </Link>
            <button
              className="btn btn-secondary magnetic-btn"
              style={{ fontSize: 14, padding: "13px 28px" }}
            >
              Watch How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
