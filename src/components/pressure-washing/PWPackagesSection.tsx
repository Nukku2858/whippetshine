import { useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import drivewayVideo from "@/assets/driveway-pressure-wash.mp4";

interface Package {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
}

const standardFeatures = [
  "High-pressure surface cleaning",
  "Pre-treatment of oil & stain spots",
  "Edge-to-edge concrete coverage",
  "Weed & debris removal from cracks",
  "Post-wash rinse & inspection",
];

const uniqueFeatures: Record<string, string> = {
  "Small Driveway": "Walkway touch-up included",
  "Standard Driveway": "Sidewalk & walkway cleaning included",
  "Large Driveway": "Garage pad & apron wash included",
};

const packages: Package[] = [
  {
    name: "Small Driveway",
    price: 150,
    description: "1-car driveways — ~300–500 sq ft.",
  },
  {
    name: "Standard Driveway",
    price: 225,
    description: "2-car driveways — ~500–800 sq ft.",
    popular: true,
  },
  {
    name: "Large Driveway",
    price: 375,
    description: "3+ car driveways — 800+ sq ft.",
  },
];

const addOns = [
  { name: "Concrete sealer application", price: 125, description: "A protective sealant coat applied after cleaning to guard against future stains, moisture damage, and freeze-thaw cracking." },
  { name: "Oil & rust stain removal", price: 65, description: "Targeted chemical treatment for deep-set oil, transmission fluid, and rust stains that standard washing can't fully lift." },
  { name: "Gutter & downspout flush", price: 75, description: "Clears debris and buildup from gutters and flushes downspouts to prevent water pooling near the driveway." },
  { name: "Sidewalk & walkway add-on", price: 50, description: "Extends cleaning to all connecting sidewalks, front walks, and stepping-stone paths around the property." },
  { name: "Patio & back porch wash", price: 85, description: "Full surface cleaning of patios, porches, and outdoor living areas — concrete, pavers, or flagstone." },
  { name: "Fence & retaining wall wash", price: 95, description: "Removes green algae, mildew, and dirt buildup from vinyl, wood, or composite fences and retaining walls." },
];

const AddOnsList = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {addOns.map((addon, i) => (
        <button
          key={addon.name}
          type="button"
          onClick={() => toggle(i)}
          className="text-left bg-card border border-border rounded-lg px-5 py-3 transition-all duration-200 hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {openIndex === i ? (
                <Minus size={16} className="text-primary shrink-0" />
              ) : (
                <Plus size={16} className="text-primary shrink-0" />
              )}
              <span className="text-sm text-secondary-foreground">{addon.name}</span>
            </div>
            <span className="text-sm font-semibold text-primary ml-4 whitespace-nowrap">+${addon.price}</span>
          </div>
          {openIndex === i && (
            <p className="mt-3 ml-7 text-xs text-muted-foreground leading-relaxed">
              {addon.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

const PWPackagesSection = () => {
  const { ref, isVisible } = useScrollReveal(0.1);
  const scrollToBooking = () => {
    document.getElementById("pw-booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pw-packages" className="py-16 px-6 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Our Services</p>
          <h2 className="text-4xl md:text-5xl font-display">
            Driveway <span className="text-primary">Packages</span>
          </h2>
        </div>

        <div className="mb-10 rounded-xl overflow-hidden border border-border shadow-lg max-w-3xl mx-auto">
          <video
            src={drivewayVideo}
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
                {standardFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm font-medium">
                  <Check size={14} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-primary">{uniqueFeatures[pkg.name]}</span>
                </li>
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

        {/* Add-Ons Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Enhance Your Wash</p>
            <h3 className="text-2xl md:text-3xl font-display">
              Available <span className="text-primary">Add-Ons</span>
            </h3>
          </div>
          <AddOnsList />
        </div>
      </div>
    </section>
  );
};

export default PWPackagesSection;
