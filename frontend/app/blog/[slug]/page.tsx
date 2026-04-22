import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { blogPosts } from "@/lib/blog-data";

export function generateStaticParams() { return blogPosts.map(post => ({ slug: post.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return { title: "Post Not Found" };
  return { title: `${post.title} — Astra Flow Blog`, description: post.excerpt };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return notFound();
  return (
    <><Navbar /><main className="page-shell">
      <article className="container-lg" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ marginBottom: 32 }}>
          <style>{`.back-link{color:var(--color-text-muted);font-size:14px;transition:color 150ms;}.back-link:hover{color:var(--color-primary);}`}</style>
          <Link href="/blog" className="back-link">← Back to Blog</Link>
        </div>
        <div style={{ display: "inline-block", padding: "4px 14px", background: "var(--color-primary-glow)", color: "var(--color-primary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 6, marginBottom: 16 }}>{post.category}</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>{post.title}</h1>
        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--color-text-muted)", fontFamily: "var(--font-data)", marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--color-border-base)" }}>
          <span>{post.author}</span><span>·</span><span>{post.date}</span><span>·</span><span>{post.readingTime}</span>
        </div>
        <div>
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("## ")) return <h2 key={i} style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, marginTop: 40, marginBottom: 16 }}>{para.replace("## ", "")}</h2>;
            return <p key={i} style={{ color: "var(--color-text-secondary)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>{para}</p>;
          })}
        </div>
      </article>
    </main><Footer /></>
  );
}
