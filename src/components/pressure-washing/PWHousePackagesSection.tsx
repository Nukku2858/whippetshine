import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import houseVideo from "@/assets/house-pressure-wash.mp4";

interface Package {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    name: "Small Home",
    price: 250,
    description: "Single-story homes — up to 1,500 sq ft.",
    features: [
      "Full exterior siding wash",
      "Porch & entryway cleaning",
      "Mildew & cobweb removal",
    ],
  },
  {
    name: "Standard Home",
    price: 400,
    description: "Two-story homes — 1,500–2,500 sq ft.",
    features: [
      "Everything in Small Home",
      "Second-story & eaves coverage",
      "Gutter face & soffit wash",
    ],
    popular: true,
  },
  {
    name: "Large Home",
    price: 600,
    description: "Large & multi-story homes — 2,500+ sq ft.",
    features: [
      "Everything in Standard Home",
      "Full wrap-around coverage",
      "Garage, fence & foundation wash",
    ],
  },
];

const PWHousePackagesSection = () => {
  const { ref, isVisible } = useScrollReveal(0.1);
  const scrollToBooking = () => {
    document.getElementById("pw-booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pw-house-packages" className="py-16 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Residential</p>
          <h2 className="text-4xl md:text-5xl font-display">
            House <span className="text-primary">Packages</span>
          </h2>
        </div>

        <div className="mb-10 rounded-xl overflow-hidden border border-border shadow-lg max-w-3xl mx-auto">
          <video
            src={houseVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          />
        </div>

        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-lg p-6 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
                pkg.popular
                  ? "bg-card border-2 border-primary shadow-[var(--shadow-scarlet)]"
                  : "bg-card border border-border"
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: isVisible ? `${packages.indexOf(pkg) * 150}ms` : "0ms" }}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-display mb-1">{pkg.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
              <div className="mb-5">
                <span className="text-3xl font-display text-primary">${pkg.price}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={scrollToBooking}
                className={`w-full font-semibold tracking-wide ${
                  pkg.popular
                    ? "bg-primary text-primary-foreground hover:bg-scarlet-glow"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                Book Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PWHousePackagesSection;
