import { useEffect, useState } from "react";
import { CalendarDays, Clock, DollarSign, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FleetBooking {
  id: string;
  service_name: string;
  vehicle_count: number;
  discount_percent: number;
  total_price: number;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-green-500/20 text-green-400",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const FleetBookingHistory = ({ userId, refreshKey }: { userId: string; refreshKey: number }) => {
  const [bookings, setBookings] = useState<FleetBooking[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("fleet_bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setBookings(data as FleetBooking[]);
    };
    fetch();
  }, [userId, refreshKey]);

  if (bookings.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-display flex items-center gap-2 mb-4">
        <Truck size={20} className="text-primary" /> Fleet Booking History
      </h3>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-secondary/50 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground text-sm">{b.service_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`}>
                {b.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-primary" />
                {b.vehicle_count} vehicle{b.vehicle_count !== 1 && "s"}
              </span>
              {b.appointment_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} className="text-primary" />
                  {b.appointment_date}
                </span>
              )}
              {b.appointment_time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-primary" />
                  {b.appointment_time}
                </span>
              )}
              <span className="flex items-center gap-1">
                <DollarSign size={12} className="text-primary" />
                ${b.total_price}
                {b.discount_percent > 0 && (
                  <span className="text-primary ml-1">({b.discount_percent}% off)</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetBookingHistory;
