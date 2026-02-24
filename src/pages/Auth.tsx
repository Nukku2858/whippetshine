import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

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
      <section className="py-24 px-6">
        <div className="max-w-md mx-auto">
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
            <h1 className="text-5xl md:text-7xl mb-4 font-display tracking-tight">
              <span className="text-foreground">{mode === "login" ? "WELCOME" : "JOIN"}</span>{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">BACK</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "login"
                ? "Sign in to track your points and redeem rewards."
                : "Create an account to start earning points with every booking."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card border border-border rounded-lg p-8"
          >
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
            <p className="text-primary font-display text-xl mb-1">Earn 1 point per $1 spent</p>
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
