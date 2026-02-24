import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Clock, Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PWBookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    date: "",
    time: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          packageId: formData.package,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          vehicle: formData.address,
          notes: formData.notes,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="pw-booking" className="py-24 px-6 bg-card/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Schedule Your Wash</p>
          <h2 className="text-5xl md:text-6xl font-display">
            Book <span className="text-primary">Now</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pw-name">Full Name</Label>
              <Input
                id="pw-name"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Smith"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-phone">Phone</Label>
              <Input
                id="pw-phone"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="567-370-4021"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw-email">Email</Label>
            <Input
              id="pw-email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="whippetshine@gmail.com"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Package</Label>
            <Select value={formData.package} onValueChange={(v) => updateField("package", v)} required>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled value="driveway-header" className="font-display text-xs text-muted-foreground uppercase tracking-widest">— Driveway Packages —</SelectItem>
                <SelectItem value="pw-small">Small Driveway — $150</SelectItem>
                <SelectItem value="pw-standard">Standard Driveway — $225</SelectItem>
                <SelectItem value="pw-large">Large Driveway — $375</SelectItem>
                <SelectItem disabled value="house-header" className="font-display text-xs text-muted-foreground uppercase tracking-widest mt-2">— House Packages —</SelectItem>
                <SelectItem value="house-small">Small Home — $250</SelectItem>
                <SelectItem value="house-standard">Standard Home — $400</SelectItem>
                <SelectItem value="house-large">Large Home — $600</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pw-date" className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Preferred Date
              </Label>
              <Input
                id="pw-date"
                required
                type="date"
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-time" className="flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Preferred Time
              </Label>
              <Select value={formData.time} onValueChange={(v) => updateField("time", v)} required>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8am">8:00 AM</SelectItem>
                  <SelectItem value="9am">9:00 AM</SelectItem>
                  <SelectItem value="10am">10:00 AM</SelectItem>
                  <SelectItem value="11am">11:00 AM</SelectItem>
                  <SelectItem value="12pm">12:00 PM</SelectItem>
                  <SelectItem value="1pm">1:00 PM</SelectItem>
                  <SelectItem value="2pm">2:00 PM</SelectItem>
                  <SelectItem value="3pm">3:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw-address" className="flex items-center gap-2">
              <Home size={14} className="text-primary" /> Property Address
            </Label>
            <Input
              id="pw-address"
              required
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123 Main St, Shelby, OH 44875"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw-notes">Additional Notes</Label>
            <Textarea
              id="pw-notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Driveway size, specific stains, gate codes, etc."
              className="bg-secondary border-border min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold tracking-wide text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting to Payment…
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default PWBookingSection;
