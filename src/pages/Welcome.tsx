import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import whippetLogo from "@/assets/whippet-logo.png";
import whippetShineLogo from "@/assets/whippet-shine-logo-transparent.png";
import { UserPlus, Crown, Car, Droplets, Home } from "lucide-react";

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showGuestOptions, setShowGuestOptions] = useState(false);

  // Auto-skip for logged-in users
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  // Don't render if user is logged in (will redirect)
  if (user) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Watermark logo */}
      <img
        src={whippetLogo}
        alt=""
        className="absolute right-[-10%] bottom-[5%] w-72 md:w-[28rem] opacity-[0.06] pointer-events-none select-none mix-blend-screen"
      />
      <img
        src={whippetLogo}
        alt=""
        className="absolute left-[-10%] top-[5%] w-72 md:w-[28rem] opacity-[0.04] pointer-events-none select-none mix-blend-screen rotate-180"
      />

      {/* Logo & title */}
      <div className="text-center mb-12 relative z-10 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
        <div className="w-80 md:w-[26rem] h-[20rem] md:h-[24rem] mx-auto mb-0 overflow-hidden relative bg-background" style={{
          WebkitMaskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 55%, transparent 90%)',
          maskImage: 'radial-gradient(ellipse 95% 95% at 50% 50%, black 55%, transparent 90%)'
        }}>
          <img
            src={whippetShineLogo}
            alt="Whippet Shine"
            className="w-full h-[140%] object-cover drop-shadow-[0_0_30px_rgba(200,40,40,0.3)] mix-blend-lighten"
            style={{ objectPosition: '50% 35%' }}
          />
        </div>
        <h1
          className="text-5xl md:text-7xl tracking-[0.06em] uppercase mt-2 mb-1 bg-clip-text text-transparent animate-shimmer drop-shadow-none"
          style={{
            backgroundImage: 'linear-gradient(110deg, hsl(0 60% 35%) 0%, hsl(0 70% 50%) 15%, hsl(355 85% 65%) 25%, hsl(0 90% 80%) 30%, hsl(355 85% 65%) 35%, hsl(0 70% 50%) 45%, hsl(0 60% 35%) 55%, hsl(0 70% 50%) 65%, hsl(355 85% 65%) 75%, hsl(0 90% 80%) 80%, hsl(355 85% 65%) 85%, hsl(0 60% 35%) 100%)',
            backgroundSize: '300% 100%',
            filter: 'drop-shadow(0 0 12px hsl(0 72% 50% / 0.5)) drop-shadow(0 0 30px hsl(0 72% 50% / 0.25))',
            fontFamily: "'Permanent Marker', cursive",
          }}
        >
          Whippet Shine
        </h1>
        <p className="text-muted-foreground text-sm tracking-[0.25em] uppercase mt-1">
          Shelby, Ohio
        </p>

        {/* Service summary */}
        <div className="flex items-center justify-center gap-6 mt-5 text-muted-foreground text-[11px] tracking-wide uppercase">
          <span className="flex items-center gap-1.5"><Car size={14} className="text-primary" /> Auto Detailing</span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5"><Droplets size={14} className="text-primary" /> Driveways</span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5"><Home size={14} className="text-primary" /> Houses</span>
        </div>
        <p className="text-muted-foreground/60 text-[10px] mt-2">Starting at $150 · Book & pay online</p>
      </div>

      {/* Bubbles */}
      <div className="relative z-10 w-full max-w-sm space-y-4">
        {!showGuestOptions ? (
          <>
            {/* Members Club */}
            <button
              onClick={() => navigate("/auth")}
              className="w-full group relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 transition-all hover:border-primary/60 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards", animation: "fade-up 0.5s ease-out 0.2s forwards, pulse-glow 3s ease-in-out 0.7s infinite" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                  <Crown size={26} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">
                    Members Club
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sign in to your account
                  </p>
                </div>
              </div>
            </button>

            {/* New Customer / Guest */}
            <button
              onClick={() => setShowGuestOptions(true)}
              className="w-full group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-muted-foreground/40 hover:shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.1)] active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                  <UserPlus size={26} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">
                    New Customer / Guest
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Browse services or create an account
                  </p>
                </div>
              </div>
            </button>
          </>
        ) : (
          /* Sub-options for Guest */
          <>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="w-full group relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 transition-all hover:border-primary/60 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] active:scale-[0.98] animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                  <UserPlus size={26} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">
                    Create Account
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Join & earn loyalty rewards
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/home")}
              className="w-full group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-muted-foreground/40 hover:shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.1)] active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                  <Crown size={26} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">
                    Browse as Guest
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View packages & pricing
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGuestOptions(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center pt-2"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </main>
  );
};

export default Welcome;
