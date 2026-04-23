import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services — Astra Flow", description: "Plans and pricing for Astra Flow logistics intelligence platform." };

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For small teams getting started with logistics visibility.",
    features: ["Up to 10 active shipments", "Real-time GPS tracking", "Basic alerts", "Dashboard access", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "Free",
    desc: "For growing operations that need AI-powered intelligence.",
    features: ["Unlimited shipments", "AI delay analysis", "Weather & traffic alerts", "Route optimization", "Astra AI assistant", "Priority support", "API access"],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Free",
    desc: "For large-scale supply chain operations with custom needs.",
    features: ["Everything in Professional", "Custom integrations", "Dedicated account manager", "SLA guarantees", "On-premise deployment", "SOC 2 compliance", "24/7 support"],
    cta: "Get Started",
    highlighted: false,
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 flex flex-col ${plan.highlighted
                    ? "border-[var(--accent)] bg-[var(--surface)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-4">
                    Most Popular
                  </div>
                )}
                <h2 className="text-xl font-bold text-[var(--text)] mb-1">{plan.name}</h2>
                <div className="text-3xl font-extrabold text-[var(--text)] mb-2">{plan.price}</div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <svg className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`text-center py-3 rounded-lg font-semibold text-sm transition-colors ${plan.highlighted
                      ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
                      : "border border-[var(--border)] hover:bg-[var(--surface-elevated)] text-[var(--text)]"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
