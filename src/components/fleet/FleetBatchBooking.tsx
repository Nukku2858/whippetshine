import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getDiscountForCount } from "./FleetDiscountTiers";

interface FleetVehicle {
  id: string;
  label: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
}

const SERVICE_OPTIONS = [
  { name: "Sedan Detail", price: 150, category: "detailing" },
  { name: "Midsize Detail", price: 250, category: "detailing" },
  { name: "Full Size Detail", price: 325, category: "detailing" },
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

interface Props {
  userId: string;
  vehicles: FleetVehicle[];
  onBookingComplete: () => void;
}

const FleetBatchBooking = ({ userId, vehicles, onBookingComplete }: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === vehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(vehicles.map((v) => v.id));
    }
  };

  const selectedService = SERVICE_OPTIONS.find((s) => s.name === service);
  const count = selectedIds.length;
  const tier = getDiscountForCount(count);
  const unitPrice = selectedService?.price || 0;
  const discountedUnit = Math.round(unitPrice * (1 - tier.percent / 100));
  const totalPrice = discountedUnit * count;
  const savings = (unitPrice - discountedUnit) * count;

  const handleSubmit = async () => {
    if (!count || !service || !date || !time) {
      toast.error("Please select vehicles, service, date, and time");
      return;
    }
    setSubmitting(true);

    const { data: booking, error } = await supabase
      .from("fleet_bookings")
      .insert({
        user_id: userId,
        service_name: service,
        service_type: selectedService?.category || "detailing",
        vehicle_count: count,
        discount_percent: tier.percent,
        unit_price: unitPrice,
        total_price: totalPrice,
        appointment_date: format(date, "yyyy-MM-dd"),
        appointment_time: time,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !booking) {
      toast.error("Failed to create booking");
      setSubmitting(false);
      return;
    }

    // Link vehicles to the booking
    const vehicleLinks = selectedIds.map((vid) => ({
      fleet_booking_id: booking.id,
      fleet_vehicle_id: vid,
    }));

    await supabase.from("fleet_booking_vehicles").insert(vehicleLinks);

    toast.success(`Fleet booking created for ${count} vehicles!`);
    setSelectedIds([]);
    setService("");
    setDate(undefined);
    setTime("");
    setSubmitting(false);
    onBookingComplete();
  };

  if (vehicles.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground text-sm">Add vehicles to your fleet above to start batch booking.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-display mb-4">Batch Book</h3>

      {/* Vehicle Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Select Vehicles</p>
          <button onClick={selectAll} className="text-xs text-primary hover:underline">
            {selectedIds.length === vehicles.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {vehicles.map((v) => {
            const checked = selectedIds.includes(v.id);
            return (
              <label
                key={v.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all border ${
                  checked ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-transparent hover:border-border"
                }`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(v.id)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{v.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[v.vehicle_year, v.vehicle_make, v.vehicle_model].filter(Boolean).join(" ")}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Service Selection */}
      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Service</p>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Choose a service" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name} — ${s.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date & Time */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left border-border bg-secondary", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Time</p>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing Summary */}
      {count > 0 && selectedService && (
        <div className="bg-secondary/50 rounded-lg px-4 py-3 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{count} × {service}</span>
            <span className="text-foreground">${unitPrice * count}</span>
          </div>
          {tier.percent > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-primary">{tier.label} discount ({tier.percent}%)</span>
              <span className="text-primary">-${savings}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-display border-t border-border pt-2">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${totalPrice}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={submitting || !count || !service || !date || !time}
        className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold gap-2"
      >
        {submitting ? (
          <><Loader2 size={16} className="animate-spin" /> Booking...</>
        ) : (
          <><ShoppingCart size={16} /> Book {count} Vehicle{count !== 1 && "s"}</>
        )}
      </Button>
    </div>
  );
};

export default FleetBatchBooking;
