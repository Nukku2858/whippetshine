import { useState } from "react";
import { Check, MessageSquare, Plus, Minus, ShoppingCart, Car, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Package {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  stripePriceId: string;
}

const standardFeatures = [
  "Full interior vacuum & air purge",
  "Dashboard & console conditioning",
  "Door panel & jamb detailing",
  "Upholstery wipe-down & refresh",
  "Streak-free glass inside & out",
  "Premium exterior hand wash & chamois dry",
  "Wheel & tire clean",
];

const addOns = [
  { id: "clay-bar", name: "Clay bar decontamination", addonPrice: 75, standalonePrice: 125, stripePriceId: "price_1T4FicQ47JXIZZAQZMTeRETr", description: "Removes embedded contaminants like tree sap, industrial fallout, and overspray from your paint, leaving a glass-smooth finish ready for protection." },
  { id: "ceramic-boost", name: "Ceramic boost & sealant", addonPrice: 120, standalonePrice: 200, stripePriceId: "price_1T4FkXQ47JXIZZAQV3vmfGY0", description: "A high-gloss ceramic layer that shields your paint from UV rays, water spots, and light scratches for up to 6 months of lasting protection." },
  { id: "engine-bay", name: "Engine bay detail & dressing", addonPrice: 85, standalonePrice: 150, stripePriceId: "price_1T4FksQ47JXIZZAQWgjmeU3T", description: "Full degrease and deep clean of the engine compartment, followed by a UV-protectant dressing for a showroom-quality underhood appearance." },
  { id: "headlight-restoration", name: "Headlight restoration", addonPrice: 65, standalonePrice: 110, stripePriceId: "price_1T4Fl9Q47JXIZZAQ8y7jbtLW", description: "Wet-sands and polishes oxidized, yellowed headlight lenses back to crystal clarity, improving both looks and nighttime visibility." },
  { id: "leather-conditioning", name: "Leather cleaning & conditioning", addonPrice: 60, standalonePrice: 100, stripePriceId: "price_1T4FlPQ47JXIZZAQnkQqk0x3", description: "Gently lifts dirt and oils from leather surfaces, then applies a rich conditioner to prevent cracking, fading, and premature wear." },
  { id: "carpet-shampoo", name: "Deep carpet & upholstery shampoo", addonPrice: 80, standalonePrice: 140, stripePriceId: "price_1T4FleQ47JXIZZAQg4m5zrg2", description: "Hot-water extraction and agitation of all fabric surfaces — carpets, mats, and seats — to remove deep stains, dirt, and allergens." },
  { id: "pet-hair", name: "Pet hair removal", addonPrice: 50, standalonePrice: 85, stripePriceId: "price_1T4FlsQ47JXIZZAQGOMqjm3f", description: "Specialized tools and techniques to extract stubborn pet hair from every crevice, seat seam, and carpet fiber in your vehicle." },
  { id: "odor-elimination", name: "Odor elimination treatment", addonPrice: 55, standalonePrice: 95, stripePriceId: "price_1T4FmCQ47JXIZZAQMu0OnCZe", description: "Targets odor at the source with an ozone or enzyme-based treatment that neutralizes smoke, food, pet, and mildew smells — not just masks them." },
];

const vehiclePackages: Package[] = [
  { name: "Sedan", price: 150, description: "Cars, coupes & compact vehicles.", stripePriceId: "price_1T48mAQ47JXIZZAQ0t9hBp7k" },
  { name: "Midsize", price: 250, description: "SUVs, crossovers & minivans.", popular: true, stripePriceId: "price_1T498fQ47JXIZZAQ0YeWMBKk" },
  { name: "Full Size", price: 325, description: "Trucks, large SUVs & vans.", stripePriceId: "price_1T498rQ47JXIZZAQMymxfuc8" },
];

const expressPackage: Package = {
  name: "Express Clean",
  price: 75,
  description: "Quick interior wipe-down & vacuum.",
  stripePriceId: "",
};

const AddOnsList = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { addItem, items } = useCart();
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const handleAddStandalone = (addon: typeof addOns[0], e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: `standalone-detailing-${addon.id}`,
      name: addon.name,
      price: addon.standalonePrice,
      category: "detailing",
      type: "standalone",
    });
    toast.success(`${addon.name} added to cart`);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {addOns.map((addon, i) => {
        const inCart = items.some((item) => item.id === `standalone-detailing-${addon.id}`);
        return (
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
              <div className="flex flex-col items-end ml-4">
                <span className="text-sm font-semibold text-primary whitespace-nowrap">+${addon.addonPrice}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">${addon.standalonePrice} standalone</span>
              </div>
            </div>
            {openIndex === i && (
              <div className="mt-3 ml-7">
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {addon.description}
                </p>
                <span
                  role="button"
                  onClick={(e) => handleAddStandalone(addon, e)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    inCart
                      ? "bg-primary/20 text-primary cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-scarlet-glow cursor-pointer"
                  }`}
                >
                  <ShoppingCart size={12} />
                  {inCart ? "In Cart" : `Add Standalone — $${addon.standalonePrice}`}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

const PackagesSection = () => {
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const handleAddPackage = (pkg: Package) => {
    addItem({
      id: `pkg-detailing-${pkg.name.toLowerCase().replace(/\s/g, "-")}`,
      name: `${pkg.name} Detail`,
      price: pkg.price,
      category: "detailing",
      type: "package",
      stripePriceId: pkg.stripePriceId,
    });
    toast.success(`${pkg.name} Detail added to cart`);
  };

  const isInCart = (pkg: Package) =>
    items.some((item) => item.id === `pkg-detailing-${pkg.name.toLowerCase().replace(/\s/g, "-")}`);

  const expressInCart = isInCart(expressPackage);

  return (
    <section id="packages" className="py-16 px-6 scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Our Auto Services</p>
          <h2 className="text-4xl md:text-5xl font-display">
            Detailing <span className="text-primary">Packages</span>
          </h2>
        </div>

        {/* Express Clean – Compact Banner */}
        <div className="mb-8 bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-primary transition-colors">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-display">{expressPackage.name}</h3>
            <p className="text-muted-foreground text-sm">{expressPackage.description}</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-3xl font-display text-primary">${expressPackage.price}</span>
            <Button
              onClick={() => handleAddPackage(expressPackage)}
              disabled={expressInCart}
              size="sm"
              className={`font-semibold tracking-wide ${
                expressInCart
                  ? "bg-primary/20 text-primary"
                  : "bg-primary text-primary-foreground hover:bg-scarlet-glow"
              }`}
            >
              {expressInCart ? "✓ In Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>

        {/* Included in Every Detail */}
        <div className="mb-10 bg-card/50 border border-border rounded-lg p-6">
          <h4 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4 text-center">
            Included in Every Full Detail
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            {standardFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <Check size={14} className="text-primary mt-0.5 shrink-0" />
                <span className="text-secondary-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Size Packages – 3 columns */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {vehiclePackages.map((pkg) => {
            const inCart = isInCart(pkg);
            return (
              <div
                key={pkg.name}
                className={`relative rounded-xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? "bg-card border-2 border-primary shadow-[var(--shadow-scarlet)]"
                    : "bg-card border border-border"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase px-4 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-display mb-1">{pkg.name}</h3>
                <p className="text-muted-foreground text-sm mb-5">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-display text-primary">${pkg.price}</span>
                </div>
                <Button
                  onClick={() => handleAddPackage(pkg)}
                  disabled={inCart}
                  className={`w-full font-semibold tracking-wide mt-auto ${
                    inCart
                      ? "bg-primary/20 text-primary"
                      : pkg.popular
                        ? "bg-primary text-primary-foreground hover:bg-scarlet-glow"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {inCart ? "✓ In Cart" : "Add to Cart"}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Custom Request */}
        <div className="rounded-lg border border-dashed border-border hover:border-primary p-6 flex flex-col sm:flex-row items-center gap-4 transition-colors bg-card mb-12">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-display mb-1">Need Something Custom?</h3>
            <p className="text-muted-foreground text-sm">
              Fleet discounts, specialty coatings, multi-vehicle deals — reach out for a personalized quote.
            </p>
          </div>
          <Button
            onClick={() => navigate("/custom-request")}
            variant="outline"
            className="shrink-0 font-semibold tracking-wide border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <MessageSquare size={16} className="mr-2" />
            Request Quote
          </Button>
        </div>

        {/* Add-Ons Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Add-On or Standalone</p>
            <h3 className="text-2xl md:text-3xl font-display">
              Additional <span className="text-primary">Services</span>
            </h3>
            <p className="text-muted-foreground text-sm mt-2">Bundle with a package to save, or book as a standalone service.</p>
          </div>
          <AddOnsList />

          {/* Pick Up & Drop Off – Members Perk */}
          <div className="mt-8 bg-card border border-primary/30 rounded-lg p-6 relative overflow-visible animate-[pulse-glow_3s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg" />
            <div className="relative flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Car size={24} className="text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                  <h4 className="text-lg font-display">Pick Up & Drop Off</h4>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full">Members Only Perk</span>
                </div>
                <p className="text-muted-foreground text-sm">We'll pick up your vehicle before your appointment and drop it back off — so you don't have to lift a finger.</p>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">$20</span>
                  <span className="text-lg font-display text-primary">FREE</span>
                </div>
                <span className="text-[10px] text-muted-foreground">$20 for non-members</span>
                <span className="text-[10px] text-muted-foreground/60 italic">* Fuel surcharge may apply</span>
              </div>
              <a href="/auth" className="block text-center text-sm font-semibold text-primary hover:text-scarlet-glow transition-colors tracking-wide mt-3">Join the Pack →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
