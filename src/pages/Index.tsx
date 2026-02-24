import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PackagesSection from "@/components/PackagesSection";

import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";
import detailingVideo from "@/assets/detailing-showcase.mp4";
import ReviewsSection from "@/components/ReviewsSection";
import LoyaltyPromoSection from "@/components/LoyaltyPromoSection";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [hash]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Detailing showcase video – mobile only */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-lg">
          <video
            src={detailingVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          />
        </div>
      </section>

      <div id="detailing-packages">
        <PackagesSection />
      </div>
      
      <ReviewsSection />
      <LoyaltyPromoSection />

      {/* Pressure Washing CTA – desktop only */}
      <section className="hidden md:block py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-lg p-12">
          <Droplets size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            Need a <span className="text-primary">Pressure Wash</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            We also offer professional driveway, sidewalk & patio pressure washing — starting at $150.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-scarlet-glow text-lg px-10 py-6 font-semibold tracking-wide">
            <Link to="/pressure-washing">View Pressure Washing Packages</Link>
          </Button>
        </div>
      </section>

      <FooterSection />
      <ChatBot />
    </main>
  );
};

export default Index;
