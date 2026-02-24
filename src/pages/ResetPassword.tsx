import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import whippetLogo from "@/assets/whippet-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also listen for auth state change with recovery event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated! You're now signed in.");
      navigate("/account");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
          {Array.from({ length: 6 }).map((_, i) => (
            <img key={i} src={whippetLogo} alt="" className="w-44 md:w-64 mix-blend-screen shrink-0 mx-6" />
          ))}
        </div>

        <div className="relative max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/auth")}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back to Sign In
          </Button>

          <div className="text-center mb-10">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">
              Account Security
            </p>
            <h1
              className="text-5xl md:text-7xl mb-4 italic font-black tracking-tight"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              <span className="text-foreground">NEW</span>{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">PASSWORD</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {ready ? "Enter your new password below." : "Waiting for verification..."}
            </p>
          </div>

          {ready ? (
            <form
              onSubmit={handleSubmit}
              className="relative space-y-6 bg-card border border-border rounded-lg p-8 overflow-hidden"
            >
              <img
                src={whippetLogo}
                alt=""
                aria-hidden="true"
                className="absolute right-4 bottom-4 w-32 h-32 object-contain opacity-[0.06] pointer-events-none select-none"
              />

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Updating..." : (
                  <><KeyRound size={18} className="mr-2" /> Update Password</>
                )}
              </Button>
            </form>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                If you arrived here from an email link, please wait a moment while we verify your session.
              </p>
            </div>
          )}
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default ResetPassword;
