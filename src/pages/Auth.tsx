import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, UserPlus, Star, Mail } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import whippetLogo from "@/assets/whippet-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Check your email for a reset link!");
    } else if (mode === "login") {
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
              <span className="text-foreground">
                {mode === "login" ? "WELCOME" : mode === "signup" ? "JOIN THE" : "RESET"}
              </span>{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">
                {mode === "login" ? "BACK" : mode === "signup" ? "PACK" : "PASSWORD"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "login"
                ? "Sign in to track your points and redeem rewards."
                : mode === "signup"
                ? "Create an account to start earning points with every booking."
                : "Enter your email and we'll send you a reset link."}
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

            {mode !== "forgot" && (
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
            )}

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

            {mode !== "forgot" && (
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
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold text-lg py-6"
            >
              {loading ? "Please wait..." : mode === "forgot" ? (
                <><Mail size={18} className="mr-2" /> Send Reset Link</>
              ) : mode === "login" ? (
                <><LogIn size={18} className="mr-2" /> Sign In</>
              ) : (
                <><UserPlus size={18} className="mr-2" /> Create Account</>
              )}
            </Button>

            {mode !== "forgot" && (
              <>
                <div className="relative flex items-center my-2">
                  <div className="flex-1 border-t border-border" />
                  <span className="px-3 text-xs text-muted-foreground uppercase">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-border text-foreground hover:bg-muted py-6"
                  onClick={async () => {
                    const { error } = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (error) toast.error(error.message || "Google sign-in failed");
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center"
              >
                Forgot your password?
              </button>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center"
              >
                ← Back to Sign In
              </button>
            )}
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
