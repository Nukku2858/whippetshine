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
    name: "Signature Wash",
    price: 150,
    description: "A meticulous hand wash and interior refresh — the standard others aspire to.",
    features: [
      "Premium hand wash & chamois dry",
      "Wheel & tire deep clean + dressing",
      "Streak-free glass inside & out",
      "Full interior vacuum & air purge",
      "Dashboard & console conditioning",
      "Door jamb detailing",
    ],
  },
  {
    name: "Elite Detail",
    price: 275,
    description: "Complete interior & exterior transformation — showroom presence, guaranteed.",
    features: [
      "Everything in Signature",
      "Clay bar decontamination",
      "Single-stage paint polish",
      "Leather cleaning & conditioning",
      "Deep carpet & upholstery shampoo",
      "Engine bay detail & dressing",
      "Tire & trim UV protection",
    ],
    popular: true,
  },
  {
    name: "Master Correction",
    price: 500,
    description: "Full paint correction & ceramic protection — perfection you can feel.",
    features: [
      "Everything in Elite",
      "Multi-stage paint correction",
      "Professional ceramic sealant (1-year)",
      "Headlight restoration & UV seal",
      "Plastic & trim restoration",
      "Interior odor elimination",
      "12-month protection guarantee",
    ],
  },
];

const PackagesSection = () => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="packages" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Our Services</p>
          <h2 className="text-5xl md:text-6xl font-display">
            Detailing <span className="text-primary">Packages</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative rounded-lg p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "bg-card border-2 border-primary shadow-[var(--shadow-gold)]"
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
                    ? "bg-primary text-primary-foreground hover:bg-gold-glow"
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

export default PackagesSection;
