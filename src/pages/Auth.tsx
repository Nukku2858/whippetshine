import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import whippetLogo from "@/assets/whippet-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to verify your account!");
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Repeating watermark */}
        <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
          {Array.from({ length: 6 }).map((_, i) => (
            <img key={i} src={whippetLogo} alt="" className="w-44 md:w-64 mix-blend-screen shrink-0 mx-6" />
          ))}
        </div>

        <div className="relative max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          <div className="text-center mb-10">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">
              Loyalty Program
            </p>
            <h1
              className="text-5xl md:text-7xl mb-4 italic font-black tracking-tight"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              <span className="text-foreground">{mode === "login" ? "WELCOME" : "JOIN THE"}</span>{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">
                {mode === "login" ? "BACK" : "PACK"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "login"
                ? "Sign in to track your points and redeem rewards."
                : "Create an account to start earning points with every booking."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative space-y-6 bg-card border border-border rounded-lg p-8 overflow-hidden"
          >
            {/* Whippet watermark inside form */}
            <img
              src={whippetLogo}
              alt=""
              aria-hidden="true"
              className="absolute right-4 bottom-4 w-32 h-32 object-contain opacity-[0.06] pointer-events-none select-none"
            />

            <div className="flex bg-muted/60 rounded-full p-1 mb-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 text-sm py-2 rounded-full font-medium transition-all ${
                  mode === "login"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 text-sm py-2 rounded-full font-medium transition-all ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold text-lg py-6"
            >
              {loading ? "Please wait..." : mode === "login" ? (
                <><LogIn size={18} className="mr-2" /> Sign In</>
              ) : (
                <><UserPlus size={18} className="mr-2" /> Create Account</>
              )}
            </Button>
          </form>

          <div className="mt-8 bg-card border border-border rounded-lg p-6 text-center">
            <Star className="mx-auto text-primary mb-2" size={24} />
            <p
              className="text-primary text-2xl mb-1"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              Earn 1 point per $1 spent
            </p>
            <p className="text-muted-foreground text-sm">
              100 points = $5 off your next booking. Points never expire!
            </p>
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default Auth;
