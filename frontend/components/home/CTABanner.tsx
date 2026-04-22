"use client";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-base)",
      }}
    >
      {/* Warm glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 500,
          height: 350,
          background: "var(--gradient-glow-warm)",
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />

      <div
        className="container-lg"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div className="label-tag reveal">Get Started</div>
        <h2
          className="reveal reveal-delay-1"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            marginBottom: 12,
          }}
        >
          Ready to See Your Supply Chain{" "}
          <span style={{ fontStyle: "italic", color: "var(--color-accent)" }}>
            Live
          </span>
          ?
        </h2>
        <div className="thin-rule reveal reveal-delay-2" style={{ margin: "16px auto" }} />
        <p
          className="reveal reveal-delay-2"
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: 36,
            maxWidth: 460,
            fontSize: 16,
            lineHeight: 1.75,
          }}
        >
          Join logistics teams using Astra Flow to prevent delays before
          they happen.
        </p>
        <Link
          href="/contact"
          className="btn btn-primary magnetic-btn reveal reveal-delay-3"
          style={{ fontSize: 14, padding: "14px 32px" }}
        >
          Start Free — No Credit Card
        </Link>
      </div>
    </section>
  );
}
