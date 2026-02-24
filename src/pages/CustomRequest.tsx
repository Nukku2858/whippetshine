import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import whippetLogo from "@/assets/whippet-logo.png";

const CustomRequest = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"text" | "email" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "email") {
      const subject = encodeURIComponent("Custom Detailing Request");
      const body = encodeURIComponent(
        `Name: ${formData.name}\n\nRequest Details:\n${formData.details}`
      );
      window.location.href = `mailto:whippetshine@gmail.com?subject=${subject}&body=${body}`;
    } else {
      window.location.href = `sms:5673704021?body=${encodeURIComponent(
        `Hi, I'm ${formData.name}. I'd like a custom detailing quote: ${formData.details}`
      )}`;
    }
    toast.success("Redirecting you now!");
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 px-6">
        <div className="max-w-xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back to Packages
          </Button>

          <div className="text-center mb-12">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">
              Custom Service
            </p>
            <h1 className="text-5xl md:text-7xl mb-4 italic font-black tracking-tight" style={{ fontFamily: "'Permanent Marker', cursive" }}>
              <span className="text-foreground">CUSTOM</span>{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(234,56,76,0.6)]">REQUEST</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Need something specific? Reach out and we'll put together a custom quote for you.
            </p>
          </div>

          {!method ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <button
                onClick={() => setMethod("text")}
                className="group bg-card border border-border rounded-lg p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-scarlet)]"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <MessageSquare size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-display mb-2">Text Message</h3>
                <p className="text-muted-foreground text-sm">
                  Send us a text and we'll respond ASAP with a custom quote.
                </p>
              </button>

              <button
                onClick={() => setMethod("email")}
                className="group bg-card border border-border rounded-lg p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-scarlet)]"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Mail size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-display mb-2">Email</h3>
                <p className="text-muted-foreground text-sm">
                  Email us the details and we'll get back to you with a quote.
                </p>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative space-y-6 bg-card border border-border rounded-lg p-8 overflow-hidden"
            >
              {/* Whippet watermark */}
              <img
                src={whippetLogo}
                alt=""
                aria-hidden="true"
                className="absolute right-4 bottom-4 w-32 h-32 object-contain opacity-[0.06] pointer-events-none select-none"
              />
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-display flex items-center gap-2">
                  {method === "text" ? (
                    <><MessageSquare size={20} className="text-primary" /> Text Message</>
                  ) : (
                    <><Mail size={20} className="text-primary" /> Email</>
                  )}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMethod(null)}
                  className="text-muted-foreground"
                >
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">What do you need?</Label>
                <Textarea
                  id="details"
                  required
                  value={formData.details}
                  onChange={(e) => setFormData((p) => ({ ...p, details: e.target.value }))}
                  placeholder="Describe the service you're looking for — vehicle type, specific areas, add-ons, etc."
                  className="bg-secondary border-border min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold text-lg py-6"
              >
                {method === "text" ? "Open Text Message" : "Open Email"}
              </Button>
            </form>
          )}
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default CustomRequest;
