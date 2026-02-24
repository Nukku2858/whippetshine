import { Check, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Package {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
}

const standardFeatures = [
  "Full interior vacuum & air purge",
  "Dashboard & console conditioning",
  "Door panel & jamb detailing",
  "Upholstery wipe-down & refresh",
  "Streak-free glass inside & out",
  "Premium hand wash & chamois dry",
  "Wheel & tire clean",
];

const addOns = [
  "Clay bar decontamination",
  "Ceramic boost & sealant",
  "Engine bay detail & dressing",
  "Headlight restoration",
  "Leather cleaning & conditioning",
  "Deep carpet & upholstery shampoo",
  "Pet hair removal",
  "Odor elimination treatment",
];

const packages: Package[] = [
  {
    name: "Sedan",
    price: 150,
    description: "Cars, coupes & compact vehicles.",
  },
  {
    name: "Midsize",
    price: 250,
    description: "SUVs, crossovers & minivans.",
    popular: true,
  },
  {
    name: "Full Size",
    price: 325,
    description: "Trucks, large SUVs & vans.",
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
              <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>
              <div className="mb-8 h-12 flex items-baseline">
                <span className="text-4xl font-display text-primary">${pkg.price}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {standardFeatures.map((feature) => (
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
            <p className="text-muted-foreground text-sm mb-6">
              Need something unique? Request a custom quote.
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

        {/* Add-Ons Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Enhance Your Detail</p>
            <h3 className="text-3xl md:text-4xl font-display">
              Available <span className="text-primary">Add-Ons</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {addOns.map((addon) => (
              <div key={addon} className="flex items-center gap-3 bg-card border border-border rounded-lg px-5 py-3">
                <Plus size={16} className="text-primary shrink-0" />
                <span className="text-sm text-secondary-foreground">{addon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
