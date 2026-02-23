import heroImage from "@/assets/hero-car.jpg";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4 opacity-0 animate-fade-up">
          Shelby, Ohio's Premier Detail Shop
        </p>
        <h1 className="text-6xl md:text-8xl font-display leading-none mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Whippet
          <span className="block text-primary">Shine</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Professional car detailing services that bring out the best in your vehicle. From basic washes to full paint correction.
        </p>
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <Button
            size="lg"
            onClick={scrollToPackages}
            className="bg-primary text-primary-foreground hover:bg-gold-glow text-lg px-10 py-6 font-semibold tracking-wide"
          >
            View Packages
          </Button>
        </div>
      </div>

      <button
        onClick={scrollToPackages}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default HeroSection;
