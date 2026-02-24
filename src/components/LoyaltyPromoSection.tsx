import { Link } from "react-router-dom";
import { Star, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import whippetLogo from "@/assets/whippet-logo.png";

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

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
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
