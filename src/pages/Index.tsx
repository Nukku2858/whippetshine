import HeroSection from "@/components/HeroSection";
import PackagesSection from "@/components/PackagesSection";
import BookingSection from "@/components/BookingSection";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplets } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <PackagesSection />
      <BookingSection />

      {/* Pressure Washing CTA */}
      <section className="py-20 px-6">
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
    </main>
  );
};

export default Index;
