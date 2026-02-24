import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, Phone, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

type ServiceType = "detailing" | "driveway" | "house";

const SERVICE_TITLES: Record<ServiceType, string> = {
  detailing: "Auto Detailing Intake",
  driveway: "Driveway Pressure Washing Intake",
  house: "House Washing Intake",
};

const IntakeForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceType = (searchParams.get("type") as ServiceType) || "detailing";
  const customerName = searchParams.get("name") || "";
  const customerEmail = searchParams.get("email") || "";
  const [submitted, setSubmitted] = useState(false);
  const [showPhoneOption, setShowPhoneOption] = useState(false);

  const [detailingData, setDetailingData] = useState({
    year: "",
    make: "",
    model: "",
    color: "",
    condition: "",
    concerns: "",
  });

  const [drivewayData, setDrivewayData] = useState({
    size: "",
    material: "",
    stains: "",
    concerns: "",
  });

  const [houseData, setHouseData] = useState({
    sqft: "",
    stories: "",
    sidingType: "",
    concerns: "",
  });

  const [phoneData, setPhoneData] = useState({
    phone: "",
    preferredTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would save to DB — for now just show success
    toast.success("Intake form submitted! We'll be in touch soon.");
    setSubmitted(true);
  };

  const handlePhoneRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Phone intake requested! Our AI assistant will call you at your preferred time.");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center px-6 py-32">
          <div className="text-center max-w-md space-y-6">
            <CheckCircle className="mx-auto text-primary" size={64} />
            <h1 className="text-4xl font-display">All Set!</h1>
            <p className="text-muted-foreground text-lg">
              Thanks, {customerName || "friend"}! We've got everything we need. We'll reach out to confirm your appointment details.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
        <FooterSection />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary tracking-[0.3em] uppercase text-sm mb-3">Almost Done</p>
            <h1 className="text-4xl md:text-5xl font-display mb-4">
              {SERVICE_TITLES[serviceType] || "Service Intake"}
            </h1>
            <p className="text-muted-foreground text-lg">
              Hey {customerName || "there"}! Fill out a few quick details so we can give you the best service possible.
            </p>
          </div>

          {/* Toggle between form and phone */}
          <div className="flex gap-3 justify-center mb-8">
            <Button
              variant={!showPhoneOption ? "default" : "outline"}
              onClick={() => setShowPhoneOption(false)}
              className="gap-2"
            >
              <ClipboardList size={18} /> Fill Out Form
            </Button>
            <Button
              variant={showPhoneOption ? "default" : "outline"}
              onClick={() => setShowPhoneOption(true)}
              className="gap-2"
            >
              <Phone size={18} /> AI Phone Intake
            </Button>
          </div>

          {showPhoneOption ? (
            <form onSubmit={handlePhoneRequest} className="space-y-6 bg-card border border-border rounded-lg p-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">Phone Intake with AI Assistant</h3>
                <p className="text-muted-foreground text-sm">
                  Prefer to talk it out? Our friendly AI assistant will call you to walk through the intake — quick, easy, and conversational.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  value={phoneData.phone}
                  onChange={(e) => setPhoneData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="567-370-4021"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">Best Time to Call</Label>
                <Select
                  value={phoneData.preferredTime}
                  onValueChange={(v) => setPhoneData((p) => ({ ...p, preferredTime: v }))}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="When should we call?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8am–12pm)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12pm–4pm)</SelectItem>
                    <SelectItem value="evening">Evening (4pm–7pm)</SelectItem>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold text-lg py-6">
                Request AI Phone Call
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-8">
              {/* Hidden pre-filled info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={customerName} disabled className="bg-secondary border-border opacity-70" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={customerEmail} disabled className="bg-secondary border-border opacity-70" />
                </div>
              </div>

              {serviceType === "detailing" && (
                <>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Vehicle Year</Label>
                      <Input
                        id="year"
                        required
                        value={detailingData.year}
                        onChange={(e) => setDetailingData((p) => ({ ...p, year: e.target.value }))}
                        placeholder="2024"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        required
                        value={detailingData.make}
                        onChange={(e) => setDetailingData((p) => ({ ...p, make: e.target.value }))}
                        placeholder="Honda"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        required
                        value={detailingData.model}
                        onChange={(e) => setDetailingData((p) => ({ ...p, model: e.target.value }))}
                        placeholder="Civic"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Exterior Color</Label>
                      <Input
                        id="color"
                        required
                        value={detailingData.color}
                        onChange={(e) => setDetailingData((p) => ({ ...p, color: e.target.value }))}
                        placeholder="Black"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Overall Condition</Label>
                      <Select
                        value={detailingData.condition}
                        onValueChange={(v) => setDetailingData((p) => ({ ...p, condition: v }))}
                        required
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent — Just needs a refresh</SelectItem>
                          <SelectItem value="good">Good — Light dirt & wear</SelectItem>
                          <SelectItem value="fair">Fair — Noticeable grime & scratches</SelectItem>
                          <SelectItem value="needs-work">Needs Work — Heavy soiling / pet hair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="concerns">Specific Concerns or Problem Areas</Label>
                    <Textarea
                      id="concerns"
                      value={detailingData.concerns}
                      onChange={(e) => setDetailingData((p) => ({ ...p, concerns: e.target.value }))}
                      placeholder="Stains on back seat, dog hair in trunk, swirl marks on hood..."
                      className="bg-secondary border-border min-h-[80px]"
                    />
                  </div>
                </>
              )}

              {serviceType === "driveway" && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driveway-size">Driveway Size</Label>
                      <Select
                        value={drivewayData.size}
                        onValueChange={(v) => setDrivewayData((p) => ({ ...p, size: v }))}
                        required
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-car">1-Car Driveway</SelectItem>
                          <SelectItem value="2-car">2-Car Driveway</SelectItem>
                          <SelectItem value="3-car">3-Car / Large Driveway</SelectItem>
                          <SelectItem value="extra-large">Extra Large / Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Surface Material</Label>
                      <Select
                        value={drivewayData.material}
                        onValueChange={(v) => setDrivewayData((p) => ({ ...p, material: v }))}
                        required
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete</SelectItem>
                          <SelectItem value="asphalt">Asphalt</SelectItem>
                          <SelectItem value="pavers">Pavers / Brick</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stains">Known Stains</Label>
                    <Select
                      value={drivewayData.stains}
                      onValueChange={(v) => setDrivewayData((p) => ({ ...p, stains: v }))}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Any notable stains?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / Minor</SelectItem>
                        <SelectItem value="oil">Oil / Grease Stains</SelectItem>
                        <SelectItem value="rust">Rust Stains</SelectItem>
                        <SelectItem value="mold">Mold / Algae</SelectItem>
                        <SelectItem value="multiple">Multiple Types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driveway-concerns">Additional Details</Label>
                    <Textarea
                      id="driveway-concerns"
                      value={drivewayData.concerns}
                      onChange={(e) => setDrivewayData((p) => ({ ...p, concerns: e.target.value }))}
                      placeholder="Describe any specific areas of concern, obstacles, or access notes..."
                      className="bg-secondary border-border min-h-[80px]"
                    />
                  </div>
                </>
              )}

              {serviceType === "house" && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sqft">Approximate Square Footage</Label>
                      <Input
                        id="sqft"
                        required
                        type="number"
                        value={houseData.sqft}
                        onChange={(e) => setHouseData((p) => ({ ...p, sqft: e.target.value }))}
                        placeholder="2000"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stories">Number of Stories</Label>
                      <Select
                        value={houseData.stories}
                        onValueChange={(v) => setHouseData((p) => ({ ...p, stories: v }))}
                        required
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="How many stories?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Story</SelectItem>
                          <SelectItem value="1.5">1.5 Stories</SelectItem>
                          <SelectItem value="2">2 Stories</SelectItem>
                          <SelectItem value="3+">3+ Stories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siding">Siding Type</Label>
                    <Select
                      value={houseData.sidingType}
                      onValueChange={(v) => setHouseData((p) => ({ ...p, sidingType: v }))}
                      required
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select siding type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vinyl">Vinyl</SelectItem>
                        <SelectItem value="wood">Wood</SelectItem>
                        <SelectItem value="brick">Brick</SelectItem>
                        <SelectItem value="stucco">Stucco</SelectItem>
                        <SelectItem value="aluminum">Aluminum</SelectItem>
                        <SelectItem value="hardie">Hardie Board / Fiber Cement</SelectItem>
                        <SelectItem value="mixed">Mixed / Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="house-concerns">Additional Details</Label>
                    <Textarea
                      id="house-concerns"
                      value={houseData.concerns}
                      onChange={(e) => setHouseData((p) => ({ ...p, concerns: e.target.value }))}
                      placeholder="Mold on north side, second-story gutters need attention, delicate landscaping near walls..."
                      className="bg-secondary border-border min-h-[80px]"
                    />
                  </div>
                </>
              )}

              <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold text-lg py-6">
                Submit Intake Form
              </Button>
            </form>
          )}
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default IntakeForm;
