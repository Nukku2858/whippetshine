import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import FleetVehicleManager from "@/components/fleet/FleetVehicleManager";
import FleetDiscountTiers from "@/components/fleet/FleetDiscountTiers";
import FleetBatchBooking from "@/components/fleet/FleetBatchBooking";
import FleetBookingHistory from "@/components/fleet/FleetBookingHistory";

interface FleetVehicle {
  id: string;
  label: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  license_plate: string | null;
}

const Fleet = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/account")}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back to Account
          </Button>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Truck size={16} /> Fleet Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-display">
              Fleet & <span className="text-primary">Commercial</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Manage your fleet vehicles, book in bulk, and save with volume discounts.
            </p>
          </div>

          <div className="space-y-6">
            {/* Discount Tiers */}
            <FleetDiscountTiers activeCount={vehicles.length} />

            {/* Vehicle Manager */}
            <FleetVehicleManager
              userId={user.id}
              vehicles={vehicles}
              onVehiclesChange={setVehicles}
            />

            {/* Batch Booking */}
            <FleetBatchBooking
              userId={user.id}
              vehicles={vehicles}
              onBookingComplete={() => setRefreshKey((k) => k + 1)}
            />

            {/* Booking History */}
            <FleetBookingHistory userId={user.id} refreshKey={refreshKey} />
          </div>
        </div>
      </section>
      <FooterSection />
    </main>
  );
};

export default Fleet;
