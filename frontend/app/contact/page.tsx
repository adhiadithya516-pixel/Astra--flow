"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setSent(true); }
  return (
    <><Navbar /><main className="page-shell">
      <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>Contact Us</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 18 }}>Have a question? Want a demo? We respond within 24 hours.</p>
        </div>
      </section>
      <div className="container-lg section" style={{ maxWidth: 600 }}>
        {sent ? (
          <div style={{ background: "var(--color-bg-surface)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: "var(--color-success)" }}>✓</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--color-success)", marginBottom: 8 }}>Message Sent</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div><label className="form-label">Name</label><input className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" /></div>
            <div><label className="form-label">Email</label><input className="form-input" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" /></div>
            <div><label className="form-label">Message</label><textarea className="form-input" rows={5} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us about your logistics challenges..." /></div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Send Message</button>
          </form>
        )}
        <div className="card-flat" style={{ marginTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--color-text-secondary)" }}>
            <p>📍 Bengaluru, India</p><p>📧 team@astraflow.io</p><p>🕐 Response within 24 hours</p>
            <p>🔗 <a href="https://github.com/sushantshetty09/astra_flow" style={{ color: "var(--color-primary)" }}>github.com/sushantshetty09/astra_flow</a></p>
          </div>
        </div>
      </div>
    </main><Footer /></>
  );
}
