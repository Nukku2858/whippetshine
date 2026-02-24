import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar, Clock, Car, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADDONS = [
  { id: "clay-bar", name: "Clay Bar Decontamination", price: 75 },
  { id: "ceramic-boost", name: "Ceramic Boost & Sealant", price: 120 },
  { id: "engine-bay", name: "Engine Bay Detail & Dressing", price: 85 },
  { id: "headlight-restoration", name: "Headlight Restoration", price: 65 },
  { id: "leather-conditioning", name: "Leather Cleaning & Conditioning", price: 60 },
  { id: "carpet-shampoo", name: "Deep Carpet & Upholstery Shampoo", price: 80 },
  { id: "pet-hair", name: "Pet Hair Removal", price: 50 },
  { id: "odor-elimination", name: "Odor Elimination Treatment", price: 55 },
];

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    date: "",
    time: "",
    vehicle: "",
    notes: "",
  });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

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
          vehicle: formData.vehicle,
          notes: formData.notes,
          addOns: selectedAddOns,
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

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="booking" className="py-24 px-6 bg-card/50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Schedule Your Detail</p>
          <h2 className="text-5xl md:text-6xl font-display">
            Book <span className="text-primary">Now</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Smith"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
                <SelectItem value="sedan">Sedan — $150</SelectItem>
                <SelectItem value="midsize">Midsize — $250</SelectItem>
                <SelectItem value="fullsize">Full Size — $325</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Preferred Date
              </Label>
              <Input
                id="date"
                required
                type="date"
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
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
            <Label htmlFor="vehicle" className="flex items-center gap-2">
              <Car size={14} className="text-primary" /> Vehicle Info
            </Label>
            <Input
              id="vehicle"
              required
              value={formData.vehicle}
              onChange={(e) => updateField("vehicle", e.target.value)}
              placeholder="2024 Honda Civic — Black"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any special requests or areas of concern..."
              className="bg-secondary border-border min-h-[80px]"
            />
          </div>

          {/* Add-Ons Selection */}
          <div className="space-y-3">
            <Label className="text-base">Add-Ons <span className="text-muted-foreground text-sm font-normal">(optional)</span></Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {ADDONS.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-center gap-3 bg-secondary border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                    selectedAddOns.includes(addon.id)
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Checkbox
                    checked={selectedAddOns.includes(addon.id)}
                    onCheckedChange={() => toggleAddOn(addon.id)}
                  />
                  <span className="text-sm flex-1 text-secondary-foreground">{addon.name}</span>
                  <span className="text-xs font-semibold text-primary whitespace-nowrap">+${addon.price}</span>
                </label>
              ))}
            </div>
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
          <p className="text-xs text-muted-foreground text-center mt-3">
            All bookings are subject to availability and final confirmation after payment.
          </p>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
