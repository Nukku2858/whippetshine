import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Gift, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

interface PointsTransaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setVehicleYear(profile.vehicle_year || "");
      setVehicleMake(profile.vehicle_make || "");
      setVehicleModel(profile.vehicle_model || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setTransactions(data as PointsTransaction[]);
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        phone,
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
      })
      .eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Profile updated!");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          {/* Points Banner */}
          <div className="bg-card border border-border rounded-lg p-8 text-center mb-8">
            <Star className="mx-auto text-primary mb-3" size={36} />
            <p className="text-5xl font-display text-primary mb-1">
              {profile?.points_balance || 0}
            </p>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Loyalty Points
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              100 points = $5 off · Earn 1 point per $1 spent
            </p>
          </div>

          {/* Profile Form */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-display mb-6">Your Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="567-370-4021" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Year</Label>
                <Input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="2024" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Toyota" className="bg-secondary border-border" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Vehicle Model</Label>
                <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Camry" className="bg-secondary border-border" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-6 bg-primary text-primary-foreground hover:bg-scarlet-glow">
              <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>

          {/* Points History */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
              <Gift size={20} className="text-primary" /> Points History
            </h2>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No transactions yet. Book a service to start earning points!
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{tx.description || (tx.type === "earned" ? "Points earned" : "Points redeemed")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-display text-lg ${tx.type === "earned" ? "text-green-400" : "text-primary"}`}>
                      {tx.type === "earned" ? "+" : "-"}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={handleSignOut} className="w-full border-border text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default Account;
