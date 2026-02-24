import { Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    price: 250,
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
    price: 325,
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
  const navigate = useNavigate();

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="packages" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Our Services</p>
          <h2 className="text-5xl md:text-6xl font-display">
            Detailing <span className="text-primary">Packages</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 items-stretch">
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
              <p className="text-muted-foreground text-sm mb-6 h-[60px]">{pkg.description}</p>
              <div className="mb-8 h-12 flex items-baseline">
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

          {/* Custom Request card */}
          <div className="relative rounded-lg p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 bg-card border border-dashed border-border hover:border-primary">
            <h3 className="text-2xl mb-2 italic font-black" style={{ fontFamily: "'Permanent Marker', cursive" }}>Custom</h3>
            <p className="text-muted-foreground text-sm mb-6 h-[60px]">
              Need something unique? Request a custom quote tailored to your exact needs.
            </p>
            <div className="mb-8 h-12 flex items-baseline">
              <span className="text-4xl font-display text-primary">Quote</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Personalized service plan",
                "Add-on services available",
                "Fleet & multi-vehicle discounts",
                "Specialty coatings & treatments",
                "Reach us by text or email",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <MessageSquare size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-secondary-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate("/custom-request")}
              className="w-full font-semibold tracking-wide bg-secondary text-secondary-foreground hover:bg-muted"
            >
              Request Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
