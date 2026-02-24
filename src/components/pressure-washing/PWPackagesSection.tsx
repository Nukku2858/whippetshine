import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Package {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    name: "Small Driveway",
    price: 150,
    description: "1-car driveways — ~300–500 sq ft of concrete restored.",
    features: [
      "High-pressure surface cleaning",
      "Pre-treatment of oil & stain spots",
      "Edge-to-edge concrete coverage",
      "Weed & debris removal from cracks",
      "Post-wash rinse & inspection",
    ],
  },
  {
    name: "Standard Driveway",
    price: 225,
    description: "2-car driveways — ~500–800 sq ft, our most popular size.",
    features: [
      "Everything in Small Driveway",
      "Extended surface area coverage",
      "Hot water treatment for tough stains",
      "Sidewalk & walkway add-on included",
      "Expansion joint detailing",
    ],
    popular: true,
  },
  {
    name: "Large Driveway",
    price: 375,
    description: "3+ car driveways & extended surfaces — 800+ sq ft.",
    features: [
      "Everything in Standard Driveway",
      "Full driveway + apron cleaning",
      "Garage pad wash",
      "Patio / back porch surface wash",
      "Post-clean sealant application",
      "Turnaround & parking pad coverage",
    ],
  },
];

const PWPackagesSection = () => {
  const scrollToBooking = () => {
    document.getElementById("pw-booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Our Services</p>
          <h2 className="text-5xl md:text-6xl font-display">
            Driveway <span className="text-primary">Packages</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-lg p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "bg-card border-2 border-primary shadow-[var(--shadow-scarlet)]"
                  : "bg-card border border-border"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-display mb-2">{pkg.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>
              <div className="mb-8">
                <span className="text-4xl font-display text-primary">${pkg.price}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
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

export default PWPackagesSection;
