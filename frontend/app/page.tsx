import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import IndustriesSection from "@/components/home/IndustriesSection";
import CTABanner from "@/components/home/CTABanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astra Flow — AI-Powered Supply Chain Intelligence",
  description: "Real-time logistics tracking, AI disruption detection, and proactive rerouting.",
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesGrid />
        <IndustriesSection />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
