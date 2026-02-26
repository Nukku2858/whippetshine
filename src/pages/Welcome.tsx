import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import whippetLogo from "@/assets/whippet-logo.png";
import whippetShineLogo from "@/assets/whippet-shine-logo-transparent.png";
import { UserPlus, Crown, Car, Droplets, Home } from "lucide-react";
import WaterSplashParticles from "@/components/WaterSplashParticles";
import { useWashSound } from "@/hooks/use-wash-sound";

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const washContainerRef = useRef<HTMLDivElement>(null);
  const { startWash, stopWash } = useWashSound();
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
        <div className="w-72 md:w-[26rem] h-[19rem] md:h-[25rem] mx-auto mb-0 overflow-hidden relative bg-background" style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 95%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 95%)'
        }}>
          <img
            src={whippetShineLogo}
            alt="Whippet Shine"
            className="w-full h-[140%] object-cover drop-shadow-[0_0_30px_rgba(200,40,40,0.3)] mix-blend-lighten"
            style={{ objectPosition: '50% 18%' }}
          />
        </div>
        <div className="relative mt-2 mb-1" ref={washContainerRef}>
          <WaterSplashParticles containerRef={washContainerRef} onWashStart={startWash} onWashEnd={stopWash} />
          {/* Clean red text - always visible, mud splats overlay via canvas */}
          <h1
            className="text-5xl md:text-7xl tracking-[0.06em] uppercase text-center bg-clip-text text-transparent"
            style={{
              fontFamily: "'Rubik Spray Paint', cursive",
              backgroundImage: 'linear-gradient(110deg, hsl(0 55% 22%) 0%, hsl(0 60% 32%) 15%, hsl(355 70% 42%) 25%, hsl(0 65% 55%) 30%, hsl(355 70% 42%) 35%, hsl(0 60% 32%) 45%, hsl(0 55% 22%) 100%)',
              backgroundSize: '100% 100%',
            }}
          >
            Whippet Shine
          </h1>
        </div>
        <p className="text-muted-foreground text-sm tracking-[0.25em] uppercase mt-1">
          Shelby, Ohio
        </p>

        {/* Service summary */}
        <div className="flex items-center justify-center mt-5 text-muted-foreground text-[10px] sm:text-[11px] tracking-wide uppercase whitespace-nowrap">
          <span className="flex items-center justify-center gap-1 flex-1"><Car size={13} className="text-primary" /> Automotive</span>
          <span className="text-border">|</span>
          <span className="flex items-center justify-center gap-1 flex-1"><Droplets size={13} className="text-primary" /> Driveways</span>
          <span className="text-border">|</span>
          <span className="flex items-center justify-center gap-1 flex-1"><Home size={13} className="text-primary" /> Houses</span>
        </div>
        <p className="text-muted-foreground/60 text-[10px] mt-2">Detailing services starting at $75 · Book & pay online</p>
      </div>

      {/* Bubbles */}
      <div className="relative z-10 w-full max-w-sm">
        {!showGuestOptions ? (
          <div key="initial" className="space-y-4 animate-fade-in">
            {/* Members Club */}
            <button
              onClick={() => navigate("/auth")}
              className="w-full group relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 transition-all hover:border-primary/60 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: "0.5s", animationFillMode: "forwards", animation: "fade-up 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards, pulse-glow 5s ease-in-out 1.7s infinite" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                  <Crown size={26} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">Members Club</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sign in to your account</p>
                </div>
              </div>
            </button>

            {/* New Customer / Guest */}
            <button
              onClick={() => setShowGuestOptions(true)}
              className="w-full group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-muted-foreground/40 hover:shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.1)] active:scale-[0.98] opacity-0 animate-fade-up"
              style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                  <UserPlus size={26} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-display tracking-wide text-foreground">New Customer / Guest</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse services or create an account</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div key="guest" className="animate-[scale-fade-in_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <div className="grid grid-cols-2 gap-3">
              {/* Create Account */}
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 transition-all hover:border-primary/60 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                    <UserPlus size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-display tracking-wide text-foreground">Create Account</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Join & earn rewards</p>
                  </div>
                </div>
              </button>

              {/* Browse as Guest */}
              <button
                onClick={() => navigate("/home")}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/40 hover:shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.1)] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                    <Crown size={22} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-display tracking-wide text-foreground">Browse as Guest</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">View packages & pricing</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowGuestOptions(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center pt-4"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Welcome;
