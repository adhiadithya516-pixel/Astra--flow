import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Blog — Astra Flow", description: "Engineering insights, industry analysis, and product updates." };
export default function BlogIndexPage() {
  return (
    <><Navbar /><main className="page-shell">
      <section className="section" style={{ borderBottom: "1px solid var(--color-border-base)" }}>
        <div className="container-lg" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: 16 }}>Intelligence from the Field</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 18 }}>Engineering insights, industry analysis, and product updates.</p>
        </div>
      </section>
      <div className="container-lg section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card" style={{ display: "block", padding: 0, overflow: "hidden" }}>
              <div style={{ height: 4, background: "var(--gradient-blue)", opacity: 0.3 }} />
              <div style={{ padding: 24 }}>
                <span className="badge badge-blue" style={{ marginBottom: 12 }}>{post.category}</span>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-data)" }}>
                  <span>{post.readingTime}</span><span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main><Footer /></>
  );
}
