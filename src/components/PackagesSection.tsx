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
    name: "Sedan",
    price: 150,
    description: "Cars, coupes & compact vehicles — precision detailing for everyday rides.",
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
    name: "Midsize",
    price: 225,
    description: "SUVs, crossovers & minivans — extra coverage for larger interiors.",
    features: [
      "Everything in Sedan",
      "Extended interior deep clean",
      "Clay bar decontamination",
      "Hand-applied spray wax & sealant",
      "Leather cleaning & conditioning",
      "Tire & trim UV protection",
    ],
    popular: true,
  },
  {
    name: "Full Size",
    price: 300,
    description: "Trucks, large SUVs & vans — the complete treatment for big rigs.",
    features: [
      "Everything in Midsize",
      "Deep carpet & upholstery shampoo",
      "Engine bay detail & dressing",
      "Bed / cargo area cleaning",
      "Full paint decontamination",
      "Premium sealant & ceramic boost",
      "Headlight restoration",
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
