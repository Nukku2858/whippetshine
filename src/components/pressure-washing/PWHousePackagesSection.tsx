import { useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import houseVideo from "@/assets/house-pressure-wash.mp4";

interface Package {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
}

const standardFeatures = [
  "Full exterior siding wash",
  "Mildew, algae & cobweb removal",
  "Porch & entryway cleaning",
  "Window frame & sill rinse",
  "Post-wash walkthrough & inspection",
];

const uniqueFeatures: Record<string, string> = {
  "Small Home": "Front walkway wash included",
  "Standard Home": "Second-story & eaves coverage included",
  "Large Home": "Garage, fence & foundation wash included",
};

const packages: Package[] = [
  {
    name: "Small Home",
    price: 250,
    description: "Single-story homes — up to 1,500 sq ft.",
  },
  {
    name: "Standard Home",
    price: 400,
    description: "Two-story homes — 1,500–2,500 sq ft.",
    popular: true,
  },
  {
    name: "Large Home",
    price: 600,
    description: "Large & multi-story homes — 2,500+ sq ft.",
  },
];

const addOns = [
  { name: "Gutter face & soffit wash", price: 85, description: "Removes black streaks, mold, and grime from gutter faces and soffits for a clean roofline appearance." },
  { name: "Roof soft wash", price: 175, description: "Low-pressure chemical treatment that safely removes moss, algae, and dark streaks from shingles without damage." },
  { name: "Deck & patio restoration", price: 120, description: "Deep cleans wood, composite, or concrete deck surfaces and restores them to near-original condition." },
  { name: "Window exterior wash", price: 70, description: "Streak-free cleaning of all exterior-facing windows, screens, and frames using purified water." },
  { name: "Fence & gate wash", price: 95, description: "Removes green algae, mildew, and weathering from vinyl, wood, or composite fences and gates." },
  { name: "Foundation & trim brightening", price: 65, description: "Targets dirt buildup, efflorescence, and discoloration along the home's foundation and trim lines." },
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
              House <span className="text-primary">Add-Ons</span>
            </h3>
          </div>
          <AddOnsList />
        </div>
      </div>
    </section>
  );
};

export default PWHousePackagesSection;
