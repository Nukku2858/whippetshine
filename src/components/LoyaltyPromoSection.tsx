import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Gift, TrendingUp, Eye, Clock, Car, Droplets, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import whippetLogo from "@/assets/whippet-logo.png";

const TRACKER_STEPS = [
  { label: "Scheduled", icon: Clock },
  { label: "Arrived", icon: Car },
  { label: "In Progress", icon: Droplets },
  { label: "Finishing", icon: Sparkles },
  { label: "Complete", icon: CheckCircle2 },
];

const TrackerMini = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TRACKER_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 mt-3">
      {TRACKER_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        return (
          <div key={step.label} className="flex items-center">
            <div
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap transition-all duration-500 ${
                isActive
                  ? "bg-primary text-primary-foreground scale-110"
                  : isPast
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              <Icon size={9} />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < TRACKER_STEPS.length - 1 && (
              <div className={`w-2 h-0.5 mx-0.5 transition-colors duration-500 ${i < activeStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const LoyaltyPromoSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Repeating watermark */}
      <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
        {Array.from({ length: 8 }).map((_, i) => (
          <img key={i} src={whippetLogo} alt="" className="w-36 md:w-48 mix-blend-screen shrink-0 mx-4" />
        ))}
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">
            Rewards Program
          </p>
          <h2
            className="text-4xl md:text-6xl mb-4 italic font-black tracking-tight"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            <span className="text-muted-foreground">JOIN THE</span>{" "}
            <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">PACK</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Earn points every time you book. Redeem them for discounts on future services. It's that simple.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Star size={24} className="text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Earn Points</h3>
            <p className="text-muted-foreground text-sm">
              Get <span className="text-primary font-semibold">1 point per $1</span> spent on every service you book.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Stack Rewards</h3>
            <p className="text-muted-foreground text-sm">
              Points <span className="text-primary font-semibold">never expire</span>. The more you book, the more you save.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Gift size={24} className="text-primary" />
            </div>
            <h3 className="font-display text-xl mb-2">Redeem Discounts</h3>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-semibold">100 points = $5 off</span> your next booking. Apply at checkout.
            </p>
          </div>
        </div>

        {/* Whippet Tracker – featured card */}
        <div className="bg-card border border-primary/30 rounded-lg p-8 mb-10 group hover:border-primary/50 transition-colors relative overflow-visible animate-[pulse-glow_3s_ease-in-out_infinite]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Eye size={28} className="text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-display text-2xl mb-1">The Whippet Tracker™</h3>
              <p className="text-muted-foreground text-sm">
                Watch your service <span className="text-primary font-semibold">live, step-by-step</span> — from arrival to final shine.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <TrackerMini />
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-scarlet-glow text-lg px-10 py-6 font-semibold tracking-wide"
          >
            <Link to={user ? "/account" : "/auth"}>
              {user ? "View Your Points" : "Sign Up — It's Free"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyPromoSection;
